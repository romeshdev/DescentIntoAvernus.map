Vue.component("hexagon", {
  name: "hexagon",
  template: `
    <a @click.prevent="openModal" :id="hex" class="hexagon" :class="statusClass" style="cursor: pointer;">
        <div class="hexagontent">{{ name }}</div>
    </a>
  `,
  props: {
    name: String,
    hex: String,
    status: String
  },
  computed: {
    statusClass() {
      if (!this.status) return 'status-unknown';
      switch (this.status.toLowerCase()){
        case "u":
          return 'status-unknown';
        case "e":
          return 'status-explored';
        case "k":
          return 'status-known';
      }
    }
  },
  methods: {
    openModal() {
      this.$emit('open-modal', this.hex);
    }
  }
});

Vue.component("row", {
  name: "row",
  template: `
    <div class="ibws-fix noselect">
        <hexagon v-for="location in element" :key="location.hex" :hex="location.hex" :name="location.name" :status="location.status" @open-modal="$emit('open-modal', $event)"></hexagon>
    </div>
  `,
  props: {
    printable: Array,
    element: Array,
    hex: String,
    status: String
  },
});

Vue.component("collapsible-list", {
  name: "collapsible-list",
  template: `
    <div class="collapsible-list">
      <div class="collapsible-item" v-for="(item, index) in items" :key="index" @click.stop="toggle(item)">
        <div :class="['collapsible-title', depthClass(depth), {'expanded': item.expanded, 'renderDropdown': item.children && item.children.length > 0}]">{{ item.title }}</div>
        <collapsible-list v-if="item.children && item.expanded" :items="item.children" :depth="depth+1" @item-clicked="$emit('item-clicked', $event)"></collapsible-list>
      </div>
    </div>
  `,
  props: {
    items: Array,
    depth: 0,
  },
  methods: {
    toggle(item) {
      this.$set(item, "expanded", !item.expanded);
      this.$emit("item-clicked", item);
    },
    depthClass(depth) {
      return "depth-" + depth;
    },
  },
});

Vue.component("location-marker", {
  name: "location-marker",
  template: `
    <a @click.prevent="openModal" style="cursor: pointer;">
      <div class="mapNode" :style="styleObject" :class="statusClass" :title="locName">
          <div>{{ parsedNumId }}</div>
      </div>
    </a>
  `,
  props: {
    x: Number,
    y: Number,
    numId: String,
    locName: String,
    status: String
  },
  computed: {
    styleObject() {
      return {
        position: "absolute",
        top: this.y + "px",
        left: this.x + "px",
      };
    },
    urlMaker() {
      return "/dm/locations/elturel/hex/" + this.numId;
    },
    parsedNumId() {
      // Using a regular expression to retain only numbers
      return this.numId.replace(/\D/g, "");
    },
    statusClass() {
      if (!this.status) return 'status-unknown';
      switch (this.status.toLowerCase()){
        case "u":
          return 'status-unknown';
        case "e":
          return 'status-explored';
        case "k":
          return 'status-known';
      }
    }
  },  
  methods: {
    openModal() {
      this.$emit('open-modal', this.numId);
    }
  }
})

Vue.component("location-modal", {
  name: "location-modal",
  template: `
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">&times;</button>
        
        <div v-if="loading" class="loading">
          Loading location data...
        </div>
        
        <div v-else-if="locationData">
          <!-- Editable Title -->
          <div v-if="!editingTitle" class="u-text u-text-1" @click="startEditTitle" style="font-size: 2em; font-weight: bold; margin-bottom: 10px; cursor: pointer;"> 
            {{ localName }} 
            <small v-if="editable" class="clickable-hint">(click to edit)</small>
          </div>
          <div v-else class="edit-mode">
            <input 
              v-model="editTitleValue" 
              class="edit-input" 
              @keyup.enter="saveTitle"
              @keyup.escape="cancelEditTitle"
              ref="titleInput"
              placeholder="Enter location name"
            />
            <div class="edit-buttons">
              <button class="infernal-button" @click="saveTitle">Save</button>
              <button class="infernal-button" @click="cancelEditTitle">Cancel</button>
            </div>
          </div>
          
          <div class="u-text-2" style="margin-bottom: 15px;">
              <p v-if="locationData.item">
                  <strong>Items in place:</strong> {{ locationData.item }}
              </p>
              <p>
                  <strong>Terrain:</strong> {{ renderTerrain(locationData) }}
              </p>
            </div>
          
          <!-- Editable Text -->
          <div v-if="!editingText" class="u-align-justify u-text u-text-3" @click="startEditText" style="cursor: pointer;">
            <div v-html="localText"></div>
            <small v-if="editable" class="clickable-hint">(click to edit)</small>
          </div>
          <div v-else class="edit-mode">
            <textarea 
              v-model="editTextValue" 
              class="edit-textarea" 
              @keyup.escape="cancelEditText"
              ref="textInput"
              placeholder="Enter location description (HTML allowed)"
            ></textarea>
            <div class="edit-buttons">
              <button class="infernal-button" @click="saveText">Save</button>
              <button class="infernal-button" @click="cancelEditText">Cancel</button>
            </div>
          </div>
          
          <div id="modal-message-container"></div>
          
          <div v-if="editable" class="status-buttons" style="margin-top: 20px;">
            <strong>Status:</strong>
            <button class="infernal-button" @click="updateStatus('U')" :class="{ 'active': locationData.status === 'U' }">Unknown</button>
            <button class="infernal-button" @click="updateStatus('K')" :class="{ 'active': locationData.status === 'K' }">Known</button>
            <button class="infernal-button" @click="updateStatus('E')" :class="{ 'active': locationData.status === 'E' }">Explored</button>
          </div>
        </div>
        
        <div v-else class="error">
          Failed to load location data.
        </div>
      </div>
    </div>
  `,
  props: {
    hex: String,
    region: String,
    editable: Boolean
  },
  data() {
    return {
      locationData: null,
      loading: false,
      editingTitle: false,
      editingText: false,
      editTitleValue: '',
      editTextValue: '',
      localName: '',
      localText: ''
    };
  },
  watch: {
    hex: {
      handler(newHex) {
        if (newHex) {
          this.loadLocationData();
        }
      },
      immediate: true
    }
  },
  methods: {
    loadLocationData() {
      this.loading = true;
      this.locationData = null;
      
      fetch(`${this.editable ? '': '/player'}/api/data/locations/${this.region}/hex/${this.hex}`)
        .then(response => response.json())
        .then(data => {
          this.locationData = data.data;
          this.localName = this.locationData.name;
          this.localText = this.locationData.text;
          this.loading = false;
        })
        .catch(error => {
          console.error('Error loading location:', error);
          this.loading = false;
          this.showError('Failed to load location data.');
        });
    },
    
    closeModal() {
      this.$emit('close-modal');
    },
    
    renderTerrain(item) {
      if (!item.terrain || !item.terrain[0]) return "???";
      
      switch (item.terrain[0]) {
        case "ash":
          return "ashlands";
        case "bog":
          return "caustic bogs";
        case "brambles":
          return "bone brambles";
        case "cracks":
          return "wasteland, cracked";
        case "fire":
          return "plains of fire";
        case "hills":
          return "hills, avernian";
        case "mountains":
          return "mountains, avernian";
        case "volcano":
          return "volcanic plains";
        case "waste":
          return "wastelands";
        default:
          console.log("Error, unknown terrain");
          return "???";
      }
    },
    
    updateStatus(status) {
      this.sendUpdate({ status: status });
    },
    
    startEditTitle() {
      if(!this.editable) return;
      this.editingTitle = true;
      this.editTitleValue = this.localName;
      this.$nextTick(() => {
        this.$refs.titleInput.focus();
      });
    },
    
    cancelEditTitle() {
      this.editingTitle = false;
      this.editTitleValue = '';
    },
    
    saveTitle() {
      if (this.editTitleValue.trim() !== '') {
        this.sendUpdate({ name: this.editTitleValue.trim() });
        this.localName = this.editTitleValue.trim();
        this.editingTitle = false;
      }
    },
    
    startEditText() {
      if(!this.editable) return;
      this.editingText = true;
      this.editTextValue = this.localText;
      this.$nextTick(() => {
        this.$refs.textInput.focus();
      });
    },
    
    cancelEditText() {
      this.editingText = false;
      this.editTextValue = '';
    },
    
    saveText() {
      this.sendUpdate({ text: this.editTextValue });
      this.localText = this.editTextValue;
      this.editingText = false;
    },
    
    sendUpdate(updateData) {
      fetch(`${this.editable ? '': '/player'}/api/data/locations/${this.region}/hex/${this.hex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update local data
          Object.assign(this.locationData, updateData);
          
          // Emit event to parent to update the map
          this.$emit('location-updated', { hex: this.hex, data: updateData });
          
          // Show success message
          const field = Object.keys(updateData)[0];
          let message = '';
          if (field === 'status') {
            message = `Status updated to ${updateData.status === 'U' ? 'Unknown' : updateData.status === 'K' ? 'Known' : 'Explored'}`;
          } else {
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`;
          }
          this.showSuccess(message);
        } else {
          this.showError('Error updating location: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error updating location:', error);
        this.showError('Error updating location: ' + error.message);
      });
    },
    
    showSuccess(message) {
      const container = document.getElementById('modal-message-container');
      container.innerHTML = `<div class="success">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = '';
      }, 3000);
    },
    
    showError(message) {
      const container = document.getElementById('modal-message-container');
      container.innerHTML = `<div class="error">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    }
  }
})