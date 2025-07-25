<template>
  <div class="login">
    <div class="login-card">
      <h2>{{ isRegistering ? 'Register' : 'Login' }}</h2>
  <form @submit.prevent="handleSubmit">
    <div v-if="isRegistering" class="form-group">
      <label for="email">Email:</label>
      <input
        type="email"
        id="email"
        v-model="form.email"
        required
        :disabled="loading"
      />
    </div>
    
    <div class="form-group">
      <label for="username">Username:</label>
      <input
        type="text"
        id="username"
        v-model="form.username"
        required
        :disabled="loading"
      />
    </div>
    
    <div class="form-group">
      <label for="password">Password:</label>
      <input
        type="password"
        id="password"
        v-model="form.password"
        required
        :disabled="loading"
      />
    </div>
    
    <div v-if="error" class="error">{{ error }}</div>
    

    <InfernalButton type="submit" @onClick="handleSubmit" :disabled="loading">{{ loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login') }}</InfernalButton>
    <!-- <button 
      type="submit" 
      class="btn btn-primary" 
      :disabled="loading"
    >
      {{ loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login') }}
    </button> -->
  </form>
  
  <div class="toggle-auth">
    <p>
      {{ isRegistering ? 'Already have an account?' : "Don't have an account?" }}
      <button 
        type="button" 
        @click="toggleAuthMode" 
        class="btn-link"
        :disabled="loading"
      >
        {{ isRegistering ? 'Login' : 'Register' }}
      </button>
    </p>
  </div>
</div>
  </div>
</template>
<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import InfernalButton from '../components/InfernalButton.vue' 

export default {
  name: 'Login',
  components: {
    InfernalButton
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isRegistering = ref(false)
    const form = ref({
      username: '',
      email: '',
      password: ''
    })
    
    const loading = computed(() => authStore.loading)
    const error = computed(() => authStore.error)
    
    const handleSubmit = async () => {
      const result = isRegistering.value 
        ? await authStore.register(form.value)
        : await authStore.login({
            username: form.value.username,
            password: form.value.password
          })
      
      if (result.success) {
        router.push('/dashboard')
      }
    }
    
    const toggleAuthMode = () => {
      isRegistering.value = !isRegistering.value
      authStore.error = null
      form.value = {
        username: '',
        email: '',
        password: ''
      }
    }
    
    return {
      isRegistering,
      form,
      loading,
      error,
      handleSubmit,
      toggleAuthMode
    }
  }
}
</script>
<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  background: #292929;
  color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #ff6b6b;
}

.toggle-auth {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ff6b6b;
}

.btn-link {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.btn-link:hover {
  color: #ea6262;
}

.btn-link:disabled {
  color: #6c757d;
  cursor: not-allowed;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>