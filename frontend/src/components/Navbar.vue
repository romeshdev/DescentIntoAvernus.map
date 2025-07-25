<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        My Full-Stack App
      </router-link>
  <div class="nav-menu" :class="{ active: isMenuOpen }">
    <InfernalButton to="/" :onClick="closeMenu">Home</InfernalButton>
      <InfernalButton to="/maps" :onClick="closeMenu">Maps</InfernalButton>
    
    <template v-if="isAuthenticated">
      <InfernalButton to="/dashboard" :onClick="closeMenu">Dashboard</InfernalButton>
      <div class="nav-user">
        <span class="user-info">{{ user?.username }}</span>
        <InfernalButton :onClick="handleLogout">Logout</InfernalButton>
      </div>
    </template>
    <template v-else>
      <InfernalButton to="/login" :onClick="closeMenu">DM Login</InfernalButton>
    </template>
  </div>
  
  <div class="nav-toggle" @click="toggleMenu">
    <span class="bar"></span>
    <span class="bar"></span>
    <span class="bar"></span>
  </div>
</div>
  </nav>
</template>
<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import InfernalButton from '../components/InfernalButton.vue' 

export default {
  name: 'Navbar',
  components: {
    InfernalButton
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const isMenuOpen = ref(false)
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }
    
    const closeMenu = () => {
      isMenuOpen.value = false
    }
    
    const handleLogout = () => {
      authStore.logout()
      router.push('/')
      closeMenu()
    }
    
    return {
      isMenuOpen,
      isAuthenticated,
      user,
      toggleMenu,
      closeMenu,
      handleLogout
    }
  }
}
</script>
<style scoped>
.navbar {
  background-color: #1a1a1a;
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
}
</style>