<template>
  <div class="home">
    <div style="height:100vh;">
      <HeroImages />
      <div class="page-container">
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading maps...</p>
        </div>
        <div v-else>
          <header class="page-header">
            <h1 class="title">[Session: {{ latestRecap.nodeLabel }}] {{ latestRecap.name }}</h1>
          </header>
          <div style="max-width: 1000px; text-align: left; margin: 0 auto; min-height: 100vh; color:#e0e0e0">
            <div v-html="latestRecap.text"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import HeroImages from '../components/HeroImages.vue'
import { useAuthStore } from '../store/auth'
import { ref, computed, onMounted } from 'vue'
import { getLocations } from '../services/api-service';

const authStore = useAuthStore()
const latestRecap = ref(null)
const loading = ref(true)

const loadLatestRecap = async () => {
  try {
    loading.value = true
    let locations = await getLocations('avernus')
    latestRecap.value = locations.reduce((max, loc) => loc.nodeLabel > max.nodeLabel ? loc : max)
    loading.value = false
  } catch (error) {
    console.error('Failed to load recaps:', error)
  }
}

onMounted(() => loadLatestRecap())

</script>
<style scoped>

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #ff6b35;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
  margin-top: 0px;
}

.subtitle {
  font-size: 1.2rem;
  color: #cccccc;
  margin: 0;
}

.page-header {
  text-align: center;
  /* margin-bottom: 3rem; */
}

.page-container {
  max-width: 1292.4px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  /* border-radius: 15px; */
  min-height: 100vh;
  color: #e0e0e0;
}

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