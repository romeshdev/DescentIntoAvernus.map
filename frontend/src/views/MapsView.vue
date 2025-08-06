<template>
  <div class="maps-container">
    <!-- Header Section -->
    <header class="maps-header">
      <h1 class="title">Descent into Avernus Maps</h1>
      <p class="subtitle">Select a map to explore the layers of hell</p>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading maps...</p>
    </div>

    <!-- Maps Grid -->
    <div v-else class="maps-grid">
      <div 
        v-for="map in maps" 
        :key="map.id"
        class="map-card"
        @click="navigateToMap(map.id)"
        :class="{ 'featured': map.featured }"
      >
        <!-- Map Thumbnail -->
        <div class="map-thumbnail">
          <img :src="map.thumbnail" :alt="map.name" />
          <div class="overlay">
            <span class="view-text">View Map</span>
          </div>
        </div>

        <!-- Map Info -->
        <div class="map-info">
          <h3 class="map-name">{{ map.name }}</h3>
          <p class="map-description">{{ map.description }}</p>
          
          <!-- Map Stats -->
          <div class="map-stats">
            <div class="stat">
              <span class="stat-label">Hexes:</span>
              <span class="stat-value">{{ map.hexCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Terrain Types:</span>
              <span class="stat-value">{{ map.terrainTypes.length }}</span>
            </div>
            <div class="stat" v-if="map.dreamMachineComponents > 0">
              <span class="stat-label">Components:</span>
              <span class="stat-value">{{ map.dreamMachineComponents }}</span>
            </div>
          </div>

          <!-- Map Tags -->
          <div class="map-tags">
            <span 
              v-for="tag in map.tags" 
              :key="tag"
              class="tag"
              :class="`tag-${tag.toLowerCase()}`"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && maps.length === 0" class="empty-state">
      <div class="empty-icon">🗺️</div>
      <h3>No Maps Available</h3>
      <p>Check back later for new maps or contact your DM.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'MapsView',
  setup() {
    const router = useRouter()
    const maps = ref([])
    const loading = ref(true)

    // Sample map data - in a real app, this would come from an API or data store
    const sampleMaps = [
      {
        id: 'avernus',
        name: 'Avernus - First Layer of Hell',
        description: 'The primary battleground of the Blood War, featuring ash plains, bone brambles, and infernal war machines.',
        thumbnail: '/avernus-map.jpg',
        hexCount: 156,
        terrainTypes: ['ash', 'bog', 'brambles', 'cracks', 'fire', 'hills', 'mountains', 'volcano', 'waste'],
        // dreamMachineComponents: 12,
        tags: ['Primary', 'Hexcrawl', 'Combat'],
        featured: true
      },
      {
        id: 'elturel',
        name: 'Elturel Ruins',
        description: 'The fallen city, now trapped in Avernus. Navigate the ruins and rescue survivors.',
        thumbnail: '/elturel-map.jpg',
        // hexCount: 32,
        terrainTypes: ['ruins', 'fire', 'ash'],
        // dreamMachineComponents: 5,
        tags: ['Ruins', 'Rescue Mission'],
        featured: false
      },
      {
        id: 'baldurs-gate',
        name: "Baldur's Gate",
        description: 'The city where it all begins. Explore the upper and lower city before descending into hell.',
        thumbnail: '/baldurs-gate-map.jpg',
        // hexCount: 45,
        terrainTypes: ['urban', 'docks', 'residential'],
        // dreamMachineComponents: 3,
        tags: ['City'],
        featured: false
      },
      // {
      //   id: 'styx-river',
      //   name: 'River Styx',
      //   description: 'The cursed river that flows through all layers of hell. Navigate its treacherous waters.',
      //   thumbnail: '/images/styx-thumb.jpg',
      //   hexCount: 89,
      //   terrainTypes: ['water', 'bog', 'fire'],
      //   dreamMachineComponents: 8,
      //   tags: ['River', 'Travel', 'Dangerous'],
      //   featured: false
      // }
    ]

    const loadMaps = async () => {
      try {
        loading.value = true
        // Simulate API call delay
        // await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In a real app, you would fetch from an API:
        // const response = await fetch('/api/maps')
        // maps.value = await response.json()
        
        maps.value = sampleMaps
      } catch (error) {
        console.error('Failed to load maps:', error)
        maps.value = []
      } finally {
        loading.value = false
      }
    }

    const navigateToMap = (mapId) => {
      // Navigate to the individual map page
      router.push(`/maps/${mapId}`)
    }

    const handleImageError = (event) => {
      // Replace broken images with a placeholder
      event.target.src = '/images/map-placeholder.jpg'
    }

    onMounted(() => {
      loadMaps()
    })

    return {
      maps,
      loading,
      navigateToMap,
      handleImageError
    }
  }
}
</script>

<style scoped>
.maps-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d1b0e 100%);
  min-height: 100vh;
  color: #e0e0e0;
}

.maps-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #ff6b35;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #cccccc;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.maps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.map-card {
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.map-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
  border-color: #ff6b35;
}

.map-card.featured {
  border-color: #ff6b35;
  background: linear-gradient(145deg, #3a2a1a, #2e1e0e);
}

.map-thumbnail {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.map-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.map-card:hover .map-thumbnail img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 107, 53, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.map-card:hover .overlay {
  opacity: 1;
}

.view-text {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.map-info {
  padding: 1.5rem;
}

.map-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ff6b35;
  margin: 0 0 0.5rem 0;
}

.map-description {
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.map-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  color: #999;
  font-size: 0.9rem;
}

.stat-value {
  color: #fff;
  font-weight: bold;
}

.map-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}


.empty-state {
  text-align: center;
  padding: 4rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #ff6b35;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #999;
}

@media (max-width: 768px) {
  .maps-container {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .maps-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .map-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>