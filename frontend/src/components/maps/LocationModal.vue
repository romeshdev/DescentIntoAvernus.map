<template>
  <div class="modal-overlay">
      <v-card width="850">
        <v-toolbar density="compact">
          <v-icon end v-if="locationData.type == 'poi' && !isEditModeActive">mdi-exclamation-thick</v-icon>
          <v-icon end v-if="locationData.type == 'danger' && !isEditModeActive">mdi-skull</v-icon>
          <v-icon end v-if="locationData.type == 'treasure' && !isEditModeActive">mdi-treasure-chest</v-icon>
          <v-icon end v-if="locationData.type == 'note' && !isEditModeActive">mdi-note-text-outline</v-icon>
          <v-icon end v-if="locationData.type == 'unknown' && !isEditModeActive">mdi-help</v-icon>
          <v-icon end v-if="isEditModeActive">mdi-pencil</v-icon>
          <v-toolbar-title>
            {{ ( isEditModeActive ? 'Editing ' : '' ) + locationData.name }}
          </v-toolbar-title>
          <v-btn icon="mdi-close" size="small" variant="elevated" @click="closeModal"></v-btn>
        </v-toolbar>

        <!-- <div class="modal-content"> -->
        <v-card-text>
          <div v-if="loading" class="loading">
            Loading location data...
          </div>
          
          <div v-else-if="locationData">
            <div v-if="!isEditModeActive" class="u-text u-text-1" style="font-size: 2em; font-weight: bold; margin-bottom: 10px;"> 
              <span v-if="map.type == 'nodemap' && locationData.nodeLabel != ''">[Session: {{ locationData.nodeLabel }}] </span>{{ locationData.name }}
            </div>
            <div v-else class="edit-mode">
              <div v-if="!isDeleting" class="title-inputs">
                <div v-if="locationData.type == null || locationData.type == 'recap'">
                  <label class="edit-label">Session Number:</label>
                  <input v-model="editableLocationData.nodeLabel"  class="edit-input" placeholder="Enter session number" />
                </div>
                <div>
                  <label class="edit-label">Title*:</label>
                  <input v-model="editableLocationData.name"  class="edit-input" placeholder="Enter location name" />
                </div>
                
                <div v-if="locationData.type != null && locationData.type != 'recap'">
                  <label class="edit-label">Type*:</label>
                  <v-btn-toggle v-model="editableLocationData.type" border divided>
                    <v-btn v-tooltip:bottom="'Point of Interest'" icon="mdi-exclamation-thick" value="poi"></v-btn>
                    <v-btn v-tooltip:bottom="'Danger!'" icon="mdi-skull" value="danger"></v-btn>
                    <v-btn v-tooltip:bottom="'Treasure'" icon="mdi-treasure-chest" value="treasure"></v-btn>
                    <v-btn v-tooltip:bottom="'Note'" icon="mdi-note-text-outline" value="note"></v-btn>
                    <v-btn v-tooltip:bottom="'???'" icon="mdi-help" value="unknown"></v-btn>
                  </v-btn-toggle> 
                </div>
              </div>
            </div>

            <div v-if="!isEditModeActive && map.type == 'hexcrawl'" class="u-text u-text-1" style="font-size: 2em; font-weight: bold; margin-bottom: 10px;"> 
              <span class="status-badge" :class="`status-${locationData.status.toLowerCase()}`">
                {{ locationData.status === 'U' ? 'Unknown' : locationData.status === 'K' ? 'Known' : 'Explored' }}
              </span>
            </div>
            <div v-else-if="map.type == 'hexcrawl'" class="edit-mode">
              <label class="edit-label">Player Status:</label>
              <div class="status-button-group">
                <div class="toggle-container">
                  <button :class="{ active: editableLocationData.status === 'U' }" @click="() => updateLocalStatus('U')">Unknown</button>
                  <button :class="{ active: editableLocationData.status === 'K' }" @click="() => updateLocalStatus('K')">Known</button>
                  <button :class="{ active: editableLocationData.status === 'E' }" @click="() => updateLocalStatus('E')">Explored</button>
                </div>
              </div>
            </div>
            
            <div v-if="!isEditModeActive" class="u-align-justify u-text u-text-3">
              <div v-html="locationData.text"></div>
            </div>
            <div v-else class="edit-mode">
              <label class="edit-label">Location Description:</label>
              <textarea v-model="editableLocationData.text" class="edit-textarea" placeholder="Enter location description (HTML allowed)"></textarea>
            </div>
            
            <div id="modal-message-container"></div>

            <div v-if="isEditModeActive">
              <div v-if="!isDeleting" class="main-edit-buttons">
                <button class="save-button" @click="saveAllChanges" :class="{ disabled: !isDirty() }" :disabled="!isDirty()">Save</button>
                <button class="" @click="cancelAllChanges">Cancel</button>
                <button v-if="map.type != 'hexcrawl'" @click="toggleDelete">Delete Location</button>
              </div>
              <div v-else class="edit-buttons">
                <div class="error">
                  Are you sure?
                </div>
                <div class="delete-confirm-buttons">
                  <button @click="sendDelete">Delete</button>
                  <button class="cancel-button" @click="toggleDelete">Cancel</button>
                </div>
              </div>
            </div>
            <div v-if="!isEditModeActive">
              <div v-if="!isDeleting" class="main-edit-buttons">
                <button @click="isEditModeActive = true">Edit</button>
              </div>
            </div>
          </div>
          
          <div v-else class="error">
            Failed to load location data.
          </div>
        </v-card-text>
        <!-- </div> -->
      </v-card>
  </div>
</template>

<script setup>
import { ref, watch, inject, computed } from 'vue'
import { updateLocation, deleteLocation } from '../../services/api-service';

const props = defineProps({
  locationId: String,
  region: String,
  editable: Boolean, 
  locationModel: Object
})

const emit = defineEmits(['close-modal', 'location-updated'])

const editMode = inject('editMode')
const isAuthenticated = inject('isAuthenticated', { value: false })
const map = inject('map')

const isEditModeActive = ref(false)// computed(() => editMode.value)

const locationData = ref(null)
const originalLocationData = ref(null)
const editableLocationData = ref(null)
const loading = ref(false)
const isDeleting = ref(false)

watch(
  () => props.locationModel,
  (newModel) => {
    if (newModel) loadLocationFromModel()
  },
  { immediate: true, deep: true }
)

watch(isEditModeActive, (newVal) => {
  if (newVal && locationData.value) initializeEditValues()
})

// ✅ Methods (now as functions)
async function loadLocationFromModel() {
  loading.value = true
  locationData.value = null

  if (!props.locationModel) {
    loading.value = false
    return
  }

  const isNewLocation = props.locationModel.name === 'New Location'

  if (!isNewLocation) {
    locationData.value = { ...props.locationModel }
    loading.value = false
    initializeEditValues()
    return
  } else {
    locationData.value = {
      x: props.locationModel.x,
      y: props.locationModel.y,
      id: props.locationModel.id,
      connectedTo: [],
      nodeLabel: '',
      name: '',
      text: '',
      type: props.locationModel.type
    }
  }

  loading.value = false
  initializeEditValues()
  await updateLocation(props.region, props.locationId, locationData.value).then(handleLocationUpdated)
}

function initializeEditValues() {
  if (!locationData.value) return
  editableLocationData.value = { ...locationData.value }
  originalLocationData.value = { ...locationData.value }
}

function updateLocalStatus(status) {
  editableLocationData.value.status = status
}

function isDirty() {
  return Object.keys(editableLocationData.value).some(x => editableLocationData.value[x] !== originalLocationData.value[x])
}

async function saveAllChanges() {
  const updateData = {}

  for (let prop of Object.keys(editableLocationData.value)){
    if (editableLocationData.value[prop] != originalLocationData.value[prop])
      updateData[prop] = editableLocationData.value[prop]
  }

  if (Object.keys(updateData).length > 0) {
    await updateLocation(props.region, props.locationId, updateData).then(handleLocationUpdated)
  } else {
    showSuccess('No changes to save')
  }
}

function cancelAllChanges() {
  // if (!isDirty()) closeModal()
  isEditModeActive.value = false
  editableLocationData.value = { ...originalLocationData.value }
  showSuccess('Changes cancelled')
}

function closeModal() {
  emit('close-modal')
}

function handleLocationUpdated(response)
{
  if (!response.success) {
    showError('Error updating location: ' + (data.error || 'Unknown error'))
    return;
  }

  locationData.value = { ...response.data }
  initializeEditValues()
  emit('location-updated', { hex: props.locationId, data: response.data })
  showSuccess("Fields updated successfully")
  // closeModal()
  isEditModeActive.value = false
}

function toggleDelete() {
  isDeleting.value = !isDeleting.value
}

async function sendDelete() {
  await deleteLocation(props.region, props.locationId)
      .then(response => {
        if (!response.success) {
          showError('Error deleting location: ' + (response.error || 'Unknown error'))
          return
        }
        emit('location-updated', { hex: props.locationId, data: null })
        closeModal()
      })
      .catch((err) => showError('Error deleting location: ' + err.message))
}

function showSuccess(message) {
  const container = document.getElementById('modal-message-container')
  container.innerHTML = `<div class="success">${message}</div>`
  setTimeout(() => (container.innerHTML = ''), 2000)
}

function showError(message) {
  const container = document.getElementById('modal-message-container')
  container.innerHTML = `<div class="error">${message}</div>`
  setTimeout(() => (container.innerHTML = ''), 5000)
}

function renderTerrain(item) {
  if (!item.terrain || !item.terrain[0]) return '???'

  switch (item.terrain[0]) {
    case 'ash':
      return 'ashlands'
    case 'bog':
      return 'caustic bogs'
    case 'brambles':
      return 'bone brambles'
    case 'cracks':
      return 'wasteland, cracked'
    case 'fire':
      return 'plains of fire'
    case 'hills':
      return 'hills, avernian'
    case 'mountains':
      return 'mountains, avernian'
    case 'volcano':
      return 'volcanic plains'
    case 'waste':
      return 'wastelands'
    default:
      console.log('Error, unknown terrain')
      return '???'
  }
}
</script>


<style scoped>

.overlay { 
  position: fixed;
  top: 20%;
  left: 25%;
  width:50%;
  z-index: 1000;
}

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
  width: 850px; /* Fixed width */
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

.title-inputs {
  display: flex;
  gap: 15px;
}

.main-edit-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #444;
}

.edit-buttons {
  border-top: 1px solid #444;
}

.delete-confirm-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.disabled {
  opacity: .4;
}

.save-button {
  background: #ff6b35 !important;
  border-color: #ff6b35 !important;
  color: white !important;
  /* font-weight: bold; */
  /* padding: 12px 24px !important; */
  /* font-size: 16px !important; */
}

.save-button:hover {
  background: #ff7949 !important;
  border-color: #ff7949 !important;
}

.save-button.disabled:hover {
  cursor: auto;
  background: #ff6b35 !important;
  border-color: #ff6b35 !important;
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


.cancel-button.disabled:hover {
  cursor: auto;
  background: #6c757d !important;
  border-color: #6c757d !important;
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

.toggle-container {
  display: flex;
  gap: 5px; /* Adjust spacing between buttons */
}

.toggle-container button {
  padding: 10px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #474646;
}

.toggle-container button.active {
  background-color: #ff6b35; /* Active state background color */
  color: white; /* Active state text color */
  border-color: #ff6b35;
}
</style>