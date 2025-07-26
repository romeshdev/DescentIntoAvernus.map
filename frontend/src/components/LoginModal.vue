<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="modal-close" @click="closeModal">&times;</button>
      
      <div class="login-header">
        <h2>{{ isRegistering ? 'Register for DM Access' : 'DM Login Required' }}</h2>
        <p>{{ isRegistering ? 'Create an account to edit maps' : 'Login to enable edit mode' }}</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div v-if="isRegistering" class="form-group">
          <label for="modal-email">Email:</label>
          <input
            type="email"
            id="modal-email"
            v-model="form.email"
            required
            :disabled="loading"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="modal-username">Username:</label>
          <input
            type="text"
            id="modal-username"
            v-model="form.username"
            required
            :disabled="loading"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="modal-password">Password:</label>
          <input
            type="password"
            id="modal-password"
            v-model="form.password"
            required
            :disabled="loading"
            class="form-input"
          />
        </div>
        
        <div v-if="error" class="error">{{ error }}</div>
        
        <div class="form-buttons">
          <InfernalButton 
            type="submit" 
            :disabled="loading"
            :onClick="handleSubmit"
          >
            {{ loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login') }}
          </InfernalButton>
          
          <button 
            type="button" 
            @click="closeModal" 
            class="btn-cancel"
            :disabled="loading"
          >
            Cancel
          </button>
        </div>
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
import { useAuthStore } from '../store/auth'
import InfernalButton from './InfernalButton.vue'

export default {
  name: 'LoginModal',
  components: {
    InfernalButton
  },
  emits: ['close-modal', 'login-success'],
  setup(props, { emit }) {
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
        emit('login-success')
        closeModal()
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
    
    const closeModal = () => {
      // Reset form and errors when closing
      form.value = {
        username: '',
        email: '',
        password: ''
      }
      authStore.error = null
      isRegistering.value = false
      emit('close-modal')
    }
    
    return {
      isRegistering,
      form,
      loading,
      error,
      handleSubmit,
      toggleAuthMode,
      closeModal
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
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Higher than LocationModal */
}

.modal-content {
  background: #1a1a1a;
  color: #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
  border: 2px solid #ff6b6b;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #ccc;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 50%;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #ff6b6b;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.login-header p {
  color: #adb5bd;
  font-size: 0.9rem;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e0e0e0;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  background: #2a2a2a;
  color: #e0e0e0;
  font-size: 1rem;
  transition: border-color 0.3s, background-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b6b;
  background: #333;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  background-color: #3a1e1e;
  border: 1px solid #dc3545;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #555;
  border-radius: 4px;
  background: #2a2a2a;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-cancel:hover:not(:disabled) {
  background: #404040;
  border-color: #777;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-auth {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #555;
}

.toggle-auth p {
  margin: 0;
  color: #adb5bd;
}

.btn-link {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  margin-left: 0.25rem;
}

.btn-link:hover:not(:disabled) {
  color: #ea6262;
}

.btn-link:disabled {
  color: #6c757d;
  cursor: not-allowed;
}
</style>