<!-- components/EditControls.vue -->
<template>
  <div class="edit-controls" style="z-index: 999999">
    <transition name="fade">
      <div v-if="editMode && map.type == 'nodemap'" class="context-buttons">
        <button v-if="!placingPOI" class="context-button" @click="placingPOI = true">
          ❗ Place POI Marker
        </button>
        <button v-else-if="placingPOI" class="context-button active" @click="placingPOI = false">
          📌 Placing POI Marker..
        </button>

        <button v-if="!placingMarker" class="context-button" @click="placingMarker = true">
          📑 Place Recap Marker
        </button>
        <button v-else-if="placingMarker" class="context-button active" @click="placingMarker = false">
          📌 Placing Recap Marker..
        </button>

        <button v-if="!linkingPoints" class="context-button" @click="linkingPoints = true">
          🔗 Link Points
        </button>
        <button v-else-if="linkingPoints" class="context-button active" @click="linkingPoints = false">
          🖇️ Linking Points..
        </button>
      </div>
    </transition>

    <div class="edit-toggle edit-mode-section">
        <button @click="toggleEdit" class="edit-mode-toggle" :class="{ 'active': editMode, 'authenticated': isAuthenticated }">
            <span class="toggle-icon">✏️</span>
            <span class="toggle-text">Edit Mode</span>
            <span class="edit-indicator">{{ editMode ? 'ON' : 'OFF' }}</span>
        </button>
    </div>
    <LoginModal v-if="showLoginModal" @close-modal="closeLoginModal" @login-success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import LoginModal from './LoginModal.vue'

const showLoginModal = ref(false)
const editMode = inject('editMode')
const placingPOI = inject('placingPOI')
const placingMarker = inject('placingMarker')
const linkingPoints = inject('linkingPoints')
const map = inject('map')
const isAuthenticated = inject('isAuthenticated', { value: false })

const toggleEdit = () => {
    if (!editMode.value) {
    // Turning edit mode ON
    if (isAuthenticated.value) {
        // Already authenticated, just enable edit mode
        editMode.value = true
    } else {
        // Not authenticated, show login modal
        showLoginModal.value = true
    }
    } else {
    // Turning edit mode OFF
    editMode.value = false
    }
}

const closeLoginModal = () => {
    showLoginModal.value = false
}

const onLoginSuccess = () => {
    // Enable edit mode after successful login
    editMode.value = true
    showLoginModal.value = false
}

const handleLogout = () => {
    authStore.logout()
    editMode.value = false // Disable edit mode on logout
    router.push('/')
    closeMenu()
}

</script>

<style scoped>
.edit-controls {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}
.edit-toggle {
  padding: 0.5rem 1rem;
  background: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.context-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.context-button {
  background: #007bff;
  color: white;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.context-button.active {
  background: #a9b2bb;
  color: white;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-mode-section {
  display: flex;
  align-items: center;
}

.edit-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2a2a2a;
  border: 2px solid #555;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.edit-mode-toggle:hover {
  border-color: #ff6b6b;
  background: #333;
  transform: translateY(-1px);
}

.edit-mode-toggle.active {
  border-color: #28a745;
  background: #1e3a24;
  color: white;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
}

.edit-mode-toggle.active:hover {
  border-color: #28a745;
  background: #2d4a32;
}

.edit-mode-toggle.authenticated:not(.active) {
  background: #2a2a2a;
  border: 2px solid #555;
}

.edit-mode-toggle.authenticated:not(.active):hover {
  border-color: #ff6b6b;
  background: #333;
}

.toggle-icon {
  font-size: 1.1rem;
}

.toggle-text {
  font-weight: 500;
}

.edit-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}


</style>