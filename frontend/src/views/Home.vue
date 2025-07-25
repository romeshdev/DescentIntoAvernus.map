<template>
  <div class="home">
    <header>
      <h1>My Full-Stack App</h1>
    </header>
      <HelloWorld msg="Welcome to Vue.js + Express.js with Authentication!" />

      <!-- <section class="auth-section">
        <div v-if="!isAuthenticated" class="auth-buttons">
          <router-link to="/login" class="btn btn-primary">Login</router-link>
          <p class="demo-info">
            <strong>Demo Credentials:</strong><br>
            Username: admin | Password: admin123<br>
            Username: user | Password: admin123
          </p>
        </div>
        <div v-else class="welcome-message">
          <h3>Welcome back, {{ user?.username }}!</h3>
          <router-link to="/dashboard" class="btn btn-primary">Go to Dashboard</router-link>
        </div>
      </section> -->
  </div>
</template>
<script>
import HelloWorld from '../components/HelloWorld.vue'
import { useAuthStore } from '../store/auth'
import { computed } from 'vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  setup() {
    const authStore = useAuthStore()
    
    return {
      isAuthenticated: computed(() => authStore.isAuthenticated),
      user: computed(() => authStore.user)
    }
  }
}
</script>
<style scoped>
.home {
  text-align: center;
}

header {
  margin-bottom: 2rem;
}

.auth-section {
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.demo-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #6c757d;
}

.welcome-message h3 {
  margin-bottom: 1rem;
  color: #28a745;
}
</style>