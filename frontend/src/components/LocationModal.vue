<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- <button class="modal-close" @click="closeModal">&times;</button> -->
        
        <div v-if="loading" class="loading">
          Loading location data...
        </div>
        
        <div v-else-if="locationData">
          <!-- Edit Mode Indicator -->
          <div v-if="isEditModeActive" class="edit-mode-banner">
            <span class="edit-icon">✏️</span>
            Edit Mode Active - Click content to edit
          </div>
          
          <!-- Editable Title -->
          <div v-if="!editingTitle" class="u-text u-text-1" @click="startEditTitle" :class="{ 'editable-field': isEditModeActive }" style="font-size: 2em; font-weight: bold; margin-bottom: 10px;"> 
            {{ localName }} 
            <small v-if="isEditModeActive" class="clickable-hint">(click to edit)</small>
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
              <InfernalButton :onClick="saveTitle">Save</InfernalButton>
              <InfernalButton :onClick="cancelEditTitle">Cancel</InfernalButton>
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
          <div v-if="!editingText" class="u-align-justify u-text u-text-3" @click="startEditText" :class="{ 'editable-field': isEditModeActive }" style="cursor: pointer;">
            <div v-html="localText"></div>
            <small v-if="isEditModeActive" class="clickable-hint">(click to edit)</small>
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
              <InfernalButton :onClick="saveText">Save</InfernalButton>
              <InfernalButton :onClick="cancelEditText">Cancel</InfernalButton>
            </div>
          </div>
          
          <div id="modal-message-container"></div>
          
          <!-- Status buttons only show in edit mode -->
          <div v-if="isEditModeActive" class="status-buttons" style="margin-top: 20px;">
            <strong>Player Status:</strong>
            <div class="status-button-group">
              <InfernalButton 
                :onClick="() => updateStatus('U')"
                :class="{ 'status-active': locationData.status === 'U' }"
              >
                Unknown
              </InfernalButton>
              <InfernalButton 
                :onClick="() => updateStatus('K')"
                :class="{ 'status-active': locationData.status === 'K' }"
              >
                Known
              </InfernalButton>
              <InfernalButton 
                :onClick="() => updateStatus('E')"
                :class="{ 'status-active': locationData.status === 'E' }"
              >
                Explored
              </InfernalButton>
            </div>
          </div>
          
          <!-- Show current status even when not in edit mode -->
          <div v-else-if="locationData.status" class="status-display">
            <strong>Player Status: </strong> 
            <span class="status-badge" :class="`status-${locationData.status.toLowerCase()}`">
              {{ locationData.status === 'U' ? 'Unknown' : locationData.status === 'K' ? 'Known' : 'Explored' }}
            </span>
          </div>
        </div>
        
        <div v-else class="error">
          Failed to load location data.
        </div>
      </div>
    </div>
</template>

<script>
import { inject, computed } from 'vue'
import InfernalButton from './InfernalButton.vue';

export default {
  name: "LocationModal",
  components: { InfernalButton },
  props: {
    hex: String,
    region: String,
    editable: Boolean // Keep for backward compatibility, but now use injected edit mode
  },
  setup() {
    // Inject edit mode and authentication state from parent
    const editMode = inject('editMode', { value: false })
    const isAuthenticated = inject('isAuthenticated', { value: false })
    
    // Edit mode is active when both edit mode is on AND user is authenticated
    const isEditModeActive = computed(() => {
      return editMode.value && isAuthenticated.value
    })
    
    return {
      isEditModeActive
    }
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
      
      fetch(`/api/data/maps/${this.region}/hex/${this.hex}`)
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
      if(!this.isEditModeActive) return;
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
      if(!this.isEditModeActive) return;
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
      fetch(`/api/data/maps/${this.region}/hex/${this.hex}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // Add authorization header if available
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
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
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  color: #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #2a2a2a;
  border: 1px solid #555;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  font-weight: bold;
  line-height: 28px;
  text-align: center;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
  transform: scale(1.1);
}

.edit-mode-banner {
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  background: #28a745;
  border: 1px solid #28a745;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: inset 0 0 0 1px rgba(255, 107, 107, 0.2);
}

.edit-mode-banner .edit-icon {
  font-size: 1.1rem;
  background: #28a745;
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
  line-height: 1;
}

.edit-icon {
  font-size: 1.2rem;
}

.editable-field {
  position: relative;
  border: 2px dashed transparent;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.editable-field:hover {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.edit-mode {
  border: 2px dashed #666;
  padding: 5px;
  margin: 5px 0;
  background: #2a2a2a;
  border-radius: 4px;
}

.edit-input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #333;
  color: #e0e0e0;
}

.edit-input:focus {
  outline: none;
  border-color: #777;
  background: #404040;
}

.edit-textarea {
  width: 100%;
  min-height: 200px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #555;
  border-radius: 4px;
  resize: vertical;
  background: #333;
  color: #e0e0e0;
}

.edit-textarea:focus {
  outline: none;
  border-color: #777;
  background: #404040;
}

.edit-buttons {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.status-buttons {
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #444;
}

.status-button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.status-active {
  background: #ff6b6b !important;
  border-color: #ff6b6b !important;
  color: white !important;
}

.status-display {
  background: #2a2a2a;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  margin-top: 1rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-u {
  background: #6c757d;
  color: white;
}

.status-k {
  background: #ffc107;
  color: #000;
}

.status-e {
  background: #28a745;
  color: white;
}

.success {
  color: #28a745;
  background-color: #1e3a24;
  border: 1px solid #28a745;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.error {
  color: #dc3545;
  background-color: #3a1e1e;
  border: 1px solid #dc3545;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #ccc;
}

.clickable-hint {
  opacity: 0.6;
  font-size: 0.8em;
  font-style: italic;
  cursor: pointer;
  color: #bbb;
}

.clickable-hint:hover {
  opacity: 1;
  color: #ddd;
}
</style>