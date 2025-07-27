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
            Edit Mode Active - Make your changes and click Save All Changes
          </div>
          
          <!-- Editable Title -->
          <div v-if="!isEditModeActive" class="u-text u-text-1" style="font-size: 2em; font-weight: bold; margin-bottom: 10px;"> 
            {{ localName }}
          </div>
          <div v-else class="edit-mode">
            <label class="edit-label">Location Name:</label>
            <input 
              v-model="editTitleValue" 
              class="edit-input" 
              placeholder="Enter location name"
            />
          </div>

          <div v-if="!isEditModeActive" class="u-text u-text-1" style="font-size: 2em; font-weight: bold; margin-bottom: 10px;"> 
            <span class="status-badge" :class="`status-${locationData.status.toLowerCase()}`">
              {{ locationData.status === 'U' ? 'Unknown' : locationData.status === 'K' ? 'Known' : 'Explored' }}
            </span>
          </div>
          <div v-else class="edit-mode">
            <label class="edit-label">Player Status:</label>
            <div class="status-button-group">
              <InfernalButton 
                :onClick="() => updateLocalStatus('U')"
                :class="{ 'status-active': editStatusValue === 'U' }">Unknown
              </InfernalButton>
              <InfernalButton 
                :onClick="() => updateLocalStatus('K')"
                :class="{ 'status-active': editStatusValue === 'K' }">Known
              </InfernalButton>
              <InfernalButton 
                :onClick="() => updateLocalStatus('E')"
                :class="{ 'status-active': editStatusValue === 'E' }">Explored
              </InfernalButton>
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
          <div v-if="!isEditModeActive" class="u-align-justify u-text u-text-3">
            <div v-html="localText"></div>
          </div>
          <div v-else class="edit-mode">
            <label class="edit-label">Location Description:</label>
            <textarea 
              v-model="editTextValue" 
              class="edit-textarea" 
              placeholder="Enter location description (HTML allowed)"
            ></textarea>
          </div>
          
          <div id="modal-message-container"></div>

          <!-- Single Save/Cancel buttons at bottom for edit mode -->
          <div v-if="isEditModeActive" class="main-edit-buttons">
            <InfernalButton :onClick="saveAllChanges">Save All Changes</InfernalButton>
            <InfernalButton :onClick="cancelAllChanges">Cancel Changes</InfernalButton>
          </div>
        </div>
        
        <div v-else class="error">
          Failed to load location data.
        </div>
      </div>
    </div>
</template>

<script>
import { inject, computed, watch } from 'vue'
import InfernalButton from './InfernalButton.vue';

export default {
  name: "LocationModal",
  components: { InfernalButton },
  props: {
    hex: String,
    region: String,
    editable: Boolean, // Keep for backward compatibility, but now use injected edit mode
    locationModel: Object // New prop to receive the location model from parent
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
      isEditModeActive,
      isAuthenticated
    }
  },
  data() {
    return {
      locationData: null,
      loading: false,
      editTitleValue: '',
      editTextValue: '',
      editStatusValue: '',
      localName: '',
      localText: '',
      // Store original values for cancel functionality
      originalName: '',
      originalText: '',
      originalStatus: ''
    };
  },
  watch: {
    locationModel: {
      handler(newModel) {
        if (newModel) {
          this.loadLocationFromModel();
        }
      },
      immediate: true,
      deep: true
    },
    // Initialize edit values when edit mode is activated
    'isEditModeActive': {
      handler(newEditMode) {
        if (newEditMode && this.locationData) {
          this.initializeEditValues();
        }
      }
    }
  },
  methods: {
    loadLocationFromModel() {
      this.loading = true;
      this.locationData = null;

      if (!this.locationModel) {
        this.loading = false;
        return;
      }

      // Check if this is a new location (name is 'New Location')
      const isNewLocation = this.locationModel.name === 'New Location';
      
      if (isNewLocation) {
        // Handle like the old pendingLocation
        this.locationData = {
          "x": this.locationModel.x,
          "y": this.locationModel.y,
          "id": this.locationModel.id,
          "connectedTo": [],
          "status": "U",
          "name": this.locationModel.name,
          "text": ""
        };
        
        this.localName = this.locationData.name;
        this.localText = this.locationData.text;
        this.loading = false;
        this.initializeEditValues();

        // Send update for new location
        this.sendUpdate(this.locationData);
      } else {
        // Use the provided model as-is for existing locations
        this.locationData = { ...this.locationModel };
        this.localName = this.locationData.name || '';
        this.localText = this.locationData.text || '';
        this.loading = false;
        this.initializeEditValues();
      }
    },

    initializeEditValues() {
      if (this.locationData) {
        // Set edit values to current data
        this.editTitleValue = this.locationData.name || '';
        this.editTextValue = this.locationData.text || '';
        this.editStatusValue = this.locationData.status || 'U';
        
        // Store original values for cancel functionality
        this.originalName = this.locationData.name || '';
        this.originalText = this.locationData.text || '';
        this.originalStatus = this.locationData.status || 'U';
      }
    },

    updateLocalStatus(status) {
      this.editStatusValue = status;
    },

    saveAllChanges() {
      // Prepare update data with all changed fields
      const updateData = {};
      
      if (this.editTitleValue.trim() !== this.originalName) {
        updateData.name = this.editTitleValue.trim();
      }
      
      if (this.editTextValue !== this.originalText) {
        updateData.text = this.editTextValue;
      }
      
      if (this.editStatusValue !== this.originalStatus) {
        updateData.status = this.editStatusValue;
      }

      // Only send update if there are changes
      if (Object.keys(updateData).length > 0) {
        this.sendUpdate(updateData);
      } else {
        this.showSuccess('No changes to save');
      }
    },

    cancelAllChanges() {
      // Reset edit values to original values
      this.editTitleValue = this.originalName;
      this.editTextValue = this.originalText;
      this.editStatusValue = this.originalStatus;
      
      this.showSuccess('Changes cancelled');
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
          
          // Update display values
          if (updateData.name) {
            this.localName = updateData.name;
          }
          if (updateData.text !== undefined) {
            this.localText = updateData.text;
          }
          
          // Update original values to match saved values
          this.originalName = this.locationData.name || '';
          this.originalText = this.locationData.text || '';
          this.originalStatus = this.locationData.status || 'U';
          
          // Emit event to parent to update the map
          this.$emit('location-updated', { hex: this.hex, data: updateData });
          
          // Show success message
          const changedFields = Object.keys(updateData);
          let message = '';
          if (changedFields.length === 1) {
            const field = changedFields[0];
            if (field === 'status') {
              message = `Status updated to ${updateData.status === 'U' ? 'Unknown' : updateData.status === 'K' ? 'Known' : 'Explored'}`;
            } else {
              message = `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`;
            }
          } else {
            message = `${changedFields.length} fields updated successfully`;
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
  padding: 30px;
  width: 650px; /* Fixed width */
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

.edit-mode {
  border: 2px dashed #666;
  padding: 15px;
  margin: 15px 0;
  background: #2a2a2a;
  border-radius: 4px;
}

.edit-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #ccc;
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
  background-image: url("../buttons/button3.png");
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

.main-edit-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #444;
}

.save-button {
  background: #28a745 !important;
  border-color: #28a745 !important;
  color: white !important;
  font-weight: bold;
  padding: 12px 24px !important;
  font-size: 16px !important;
}

.save-button:hover {
  background: #218838 !important;
  border-color: #218838 !important;
}

.cancel-button {
  background: #6c757d !important;
  border-color: #6c757d !important;
  color: white !important;
  padding: 12px 24px !important;
  font-size: 16px !important;
}

.cancel-button:hover {
  background: #5a6268 !important;
  border-color: #5a6268 !important;
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
</style>