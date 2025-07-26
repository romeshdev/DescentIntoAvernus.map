<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        Orphan's of Avernus
      </router-link>
      
      <div class="tag tag-city">{{ isAuthenticated ? 'DM View' : 'Player View' }}</div>

      <div class="nav-menu" :class="{ active: isMenuOpen }">
        <!-- <InfernalButton to="/" :onClick="closeMenu">Home</InfernalButton> -->
        <InfernalButton to="/maps" :onClick="closeMenu">Maps</InfernalButton>
        
        <!-- Edit Mode Toggle -->
        <!-- <div class="edit-mode-section" style="z-index: 999999">
          <button @click="toggleEditMode" class="edit-mode-toggle" :class="{ 'active': editMode, 'authenticated': isAuthenticated }">
            <span class="toggle-icon">✏️</span>
            <span class="toggle-text">Edit Mode</span>
            <span class="edit-indicator">{{ editMode ? 'ON' : 'OFF' }}</span>
          </button>
        </div> -->

        
        <!-- <InfernalButton :onClick="handleLogout">Logout</InfernalButton> -->
      </div>
      
      <div class="nav-toggle" @click="toggleMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </div>
    
    <!-- Login Modal -->
    <!-- <LoginModal 
      v-if="showLoginModal" 
      @close-modal="closeLoginModal"
      @login-success="onLoginSuccess"
    /> -->
  </nav>
</template>

<script>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import InfernalButton from '../components/InfernalButton.vue'
import LoginModal from '../components/LoginModal.vue'

export default {
  name: 'Navbar',
  components: {
    InfernalButton,
    LoginModal
  },
  setup() {
    const router = useRouter()
    const isMenuOpen = ref(false)
    const showLoginModal = ref(false)
    
    const editMode = inject('editMode', { value: false })
    const isAuthenticated = inject('isAuthenticated', { value: false })
    
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }
    
    const closeMenu = () => {
      isMenuOpen.value = false
    }
    
    // const toggleEditMode = () => {
    //   if (!editMode.value) {
    //     // Turning edit mode ON
    //     if (isAuthenticated.value) {
    //       // Already authenticated, just enable edit mode
    //       editMode.value = true
    //     } else {
    //       // Not authenticated, show login modal
    //       showLoginModal.value = true
    //     }
    //   } else {
    //     // Turning edit mode OFF
    //     editMode.value = false
    //   }
    // }
    
    // const closeLoginModal = () => {
    //   showLoginModal.value = false
    // }
    
    // const onLoginSuccess = () => {
    //   // Enable edit mode after successful login
    //   editMode.value = true
    //   showLoginModal.value = false
    // }
    
    // const handleLogout = () => {
    //   authStore.logout()
    //   editMode.value = false // Disable edit mode on logout
    //   router.push('/')
    //   closeMenu()
    // }
    
    return {
      isMenuOpen,
      isAuthenticated,
      editMode,
      showLoginModal,
      toggleMenu,
      closeMenu,
      // toggleEditMode,
      // closeLoginModal,
      // onLoginSuccess,
      // handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #101010;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6b6b;
  text-decoration: none;
}

.nav-brand:hover {
  color: #007bff;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #495057;
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

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  color: #adb5bd;
  font-size: 0.9rem;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: 0.3s;
}

@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    left: -100%;
    top: 70px;
    flex-direction: column;
    background-color: #343a40;
    width: 100%;
    text-align: center;
    transition: 0.3s;
    box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
    padding: 2rem 0;
    gap: 1rem;
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-user {
    flex-direction: column;
    gap: 0.5rem;
  }

  .edit-mode-section {
    order: -1; /* Show edit mode toggle first on mobile */
  }

  .edit-mode-toggle {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

/* Animation for edit mode activation */
@keyframes editModeActivate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.edit-mode-toggle.active {
  animation: editModeActivate 0.3s ease;
}
</style>