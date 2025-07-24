<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome, {{ user?.username }}! Your role: <strong>{{ user?.role }}</strong></p>
    </header>
<div v-if="loading" class="loading">Loading dashboard data...</div>
<div v-else-if="error" class="error">{{ error }}</div>

<div v-else>
  <!-- Dashboard Stats -->
  <section class="stats-section">
    <h2>Statistics</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats?.totalUsers || 0 }}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats?.activeUsers || 0 }}</div>
        <div class="stat-label">Active Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats?.totalOrders || 0 }}</div>
        <div class="stat-label">Total Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${{ stats?.revenue || 0 }}</div>
        <div class="stat-label">Revenue</div>
      </div>
    </div>
  </section>

  <!-- User Profile -->
  <section class="profile-section">
    <div class="card">
      <h2>Your Profile</h2>
      <div v-if="profile">
        <p><strong>Username:</strong> {{ profile.username }}</p>
        <p><strong>Email:</strong> {{ profile.email }}</p>
        <p><strong>Role:</strong> {{ profile.role }}</p>
        <p><strong>Last Login:</strong> {{ formatDate(profile.lastLogin) }}</p>
      </div>
    </div>
  </section>

  <!-- Admin Section -->
  <section v-if="isAdmin" class="admin-section">
    <div class="card">
      <h2>Admin Panel</h2>
      <p>Manage users and system settings</p>
      
      <div class="admin-actions">
        <button @click="fetchUsers" class="btn btn-primary">Load Users</button>
        <button @click="showAddUserForm = !showAddUserForm" class="btn btn-secondary">
          {{ showAddUserForm ? 'Cancel' : 'Add User' }}
        </button>
      </div>

      <!-- Add User Form -->
      <div v-if="showAddUserForm" class="add-user-form">
        <h3>Add New User</h3>
        <form @submit.prevent="addUser">
          <div class="form-group">
            <label for="newUserName">Name:</label>
            <input
              type="text"
              id="newUserName"
              v-model="newUser.name"
              required
            />
          </div>
          <div class="form-group">
            <label for="newUserEmail">Email:</label>
            <input
              type="email"
              id="newUserEmail"
              v-model="newUser.email"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary">Add User</button>
        </form>
      </div>

      <!-- Users List -->
      <div v-if="users.length > 0" class="users-list">
        <h3>All Users</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="user.role">
                    {{ user.role }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import axios from 'axios'

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const error = ref(null)
    const stats = ref(null)
    const profile = ref(null)
    const users = ref([])
    const showAddUserForm = ref(false)
    const newUser = ref({ name: '', email: '' })

    const user = computed(() => authStore.user)
    const isAdmin = computed(() => authStore.isAdmin)

    const fetchDashboardData = async () => {
      loading.value = true
      error.value = null

      try {
        const [statsResponse, profileResponse] = await Promise.all([
          axios.get('/api/dashboard-stats'),
          axios.get('/api/profile')
        ])

        stats.value = statsResponse.data
        profile.value = profileResponse.data
      } catch (err) {
        error.value = 'Failed to load dashboard data'
        console.error('Dashboard error:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users')
        users.value = response.data
      } catch (err) {
        error.value = 'Failed to load users'
        console.error('Users error:', err)
      }
    }

    const addUser = async () => {
      try {
        const response = await axios.post('/api/users', newUser.value)
        users.value.push(response.data)
        newUser.value = { name: '', email: '' }
        showAddUserForm.value = false
      } catch (err) {
        error.value = 'Failed to add user'
        console.error('Add user error:', err)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      loading,
      error,
      stats,
      profile,
      users,
      showAddUserForm,
      newUser,
      user,
      isAdmin,
      fetchUsers,
      addUser,
      formatDate
    }
  }
}
</script>
<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #6c757d;
}

.profile-section,
.admin-section {
  margin-top: 2rem;
}

.admin-actions {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.add-user-form {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.add-user-form h3 {
  margin-bottom: 1rem;
  color: #495057;
}

.users-list {
  margin-top: 2rem;
}

.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
}

.role-badge.admin {
  background-color: #dc3545;
  color: white;
}

.role-badge.user {
  background-color: #28a745;
  color: white;
}

@media (max-width: 768px) {
  .admin-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 0.875rem;
  }
  
  th,
  td {
    padding: 0.5rem;
  }
}
</style>