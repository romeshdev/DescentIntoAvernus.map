<template>
  <div id="app">
    <header>
      <h1>My Full-Stack App</h1>
    </header>
    
    <main>
      <HelloWorld msg="Welcome to Vue.js + Express.js!" />
      
      <section class="users-section">
        <h2>Users</h2>
        <div v-if="loading">Loading users...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else>
          <ul class="users-list">
            <li v-for="user in users" :key="user.id" class="user-item">
              <strong>{{ user.name }}</strong> - {{ user.email }}
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data() {
    return {
      users: [],
      loading: false,
      error: null
    }
  },
  async mounted() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get('/api/users')
        this.users = response.data
      } catch (error) {
        this.error = 'Failed to fetch users'
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

header {
  margin-bottom: 2rem;
}

.users-section {
  margin-top: 2rem;
}

.users-list {
  list-style: none;
  padding: 0;
  max-width: 400px;
  margin: 0 auto;
}

.user-item {
  padding: 0.5rem;
  margin: 0.5rem 0;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.error {
  color: #dc3545;
  margin: 1rem 0;
}
</style>