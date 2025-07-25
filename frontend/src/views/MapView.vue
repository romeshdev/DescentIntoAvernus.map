<template>
  <div class="map-view-container">
    <!-- Navigation Bar -->
    <nav class="map-nav">
      <button @click="goBack" class="back-button">
        <span class="back-icon">←</span>
        Back to Maps
      </button>
      
      <div class="map-title-section">
        <h1 class="map-title">{{ map?.name || 'Loading...' }}</h1>
        <div v-if="map" class="map-subtitle">
          {{ map.description }}
        </div>
      </div>

      <div class="view-controls">
        <button 
          @click="toggleView" 
          class="view-toggle"
          :class="{ active: showTerrainView }"
        >
          {{ showTerrainView ? 'Poster Map' : 'Terrain Map' }}
        </button>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading map data...</p>
    </div>

    <!-- Map Content -->
    <div v-else-if="map" class="map-content">
      <!-- Map Canvas Container -->
      <div class="map-canvas-container">
        <div 
          class="map-canvas" 
          :class="{ 'terrain-view': showTerrainView }"
          ref="mapCanvas"
        >
          <!-- Background Map Image -->
          <img 
            :src="showTerrainView ? map.terrainMapUrl : map.posterMapUrl" 
            :alt="map.name"
            class="background-map"
            @load="onMapImageLoad"
          />
          
          <!-- Hex Grid Overlay -->
          <div class="hex-grid">
            <div
              v-for="hex in map.hexes"
              :key="hex.id"
              class="hex-location"
              :class="[
                `hex-${hex.terrain[0]}`,
                { 
                  'has-component': hex.dreamMachineComponent,
                  'explored': hex.status === 'E',
                  'known': hex.status === 'K'
                }
              ]"
              :style="getHexPosition(hex.coordinates)"
              @click="selectHex(hex)"
            >
              <div class="hex-shape">
                <div class="hex-inner">
                  <span class="hex-label">{{ hex.name }}</span>
                  <span v-if="hex.dreamMachineComponent" class="component-indicator">⚙</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Panel -->
      <div class="sidebar" :class="{ 'sidebar-open': selectedHex }">
        <div v-if="selectedHex" class="hex-details">
          <!-- Close Button -->
          <button @click="closeHexDetails" class="close-button">×</button>
          
          <!-- Hex Header -->
          <div class="hex-header">
            <h2 class="hex-name">{{ selectedHex.name }}</h2>
            <div class="hex-coordinates">{{ selectedHex.id.toUpperCase() }}</div>
          </div>

          <!-- Hex Terrain Info -->
          <div class="terrain-info">
            <h3>Terrain</h3>
            <div class="terrain-types">
              <span 
                v-for="terrain in selectedHex.terrain" 
                :key="terrain"
                class="terrain-tag"
                :class="`terrain-${terrain}`"
              >
                {{ formatTerrain(terrain) }}
              </span>
            </div>
          </div>

          <!-- Dream Machine Component -->
          <div v-if="selectedHex.dreamMachineComponent" class="component-info">
            <h3>Dream Machine Component</h3>
            <div class="component-details">
              <span class="component-icon">⚙</span>
              <span class="component-name">{{ selectedHex.dreamMachineComponent }}</span>
            </div>
          </div>

          <!-- Hex Description -->
          <div class="hex-description">
            <h3>Description</h3>
            <div class="description-text" v-html="selectedHex.description"></div>
          </div>

          <!-- Hex Status (for DM view) -->
          <div v-if="isDMView" class="hex-status">
            <h3>Status</h3>
            <select v-model="selectedHex.status" @change="updateHexStatus">
              <option value="U">Unknown</option>
              <option value="K">Known</option>
              <option value="E">Explored</option>
            </select>
          </div>
        </div>

        <!-- Default Sidebar Content -->
        <div v-else class="sidebar-default">
          <h3>Map Information</h3>
          <div class="map-stats-detailed">
            <div class="stat-item">
              <strong>Total Hexes:</strong> {{ map.hexes.length }}
            </div>
            <div class="stat-item">
              <strong>Terrain Types:</strong> {{ uniqueTerrains.length }}
            </div>
            <div class="stat-item">
              <strong>Dream Machine Components:</strong> {{ dreamMachineCount }}
            </div>
            <div v-if="!isDMView" class="stat-item">
              <strong>Explored:</strong> {{ exploredCount }}/{{ map.hexes.length }}
            </div>
          </div>

          <div class="legend">
            <h4>Terrain Legend</h4>
            <div class="legend-items">
              <div 
                v-for="terrain in uniqueTerrains" 
                :key="terrain"
                class="legend-item"
              >
                <div class="legend-color" :class="`terrain-${terrain}`"></div>
                <span>{{ formatTerrain(terrain) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <h2>Map Not Found</h2>
      <p>The requested map could not be loaded.</p>
      <button @click="goBack" class="back-button">Return to Maps</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'MapView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const map = ref(null)
    const loading = ref(true)
    const selectedHex = ref(null)
    const showTerrainView = ref(false)
    const isDMView = ref(true) // This would come from user auth/settings

    // Sample map data - in real app, this would be fetched based on route.params.mapid
    const sampleMapData = {
      id: 'avernus-layer-1',
      name: 'Avernus - First Layer of Hell',
      description: 'The primary battleground of the Blood War',
      posterMapUrl: '/images/avernus-poster.jpg',
      terrainMapUrl: '/images/avernus-terrain.jpg',
      hexes: [
        {
          id: 'a1',
          name: 'Fort Knucklebone',
          coordinates: { x: 10, y: 15 },
          terrain: ['ash', 'hills'],
          status: 'E',
          dreamMachineComponent: 'Infernal Ignition',
          description: '<p>A crumbling fortress built from the bones of ancient titans. The fort serves as a waystation for devils and adventurers alike.</p><p>The walls are constructed from massive knucklebones, each the size of a building. Strange fires burn eternally in the courtyards.</p>'
        },
        {
          id: 'b2',
          name: 'Bone Brambles',
          coordinates: { x: 25, y: 30 },
          terrain: ['brambles'],
          status: 'K',
          dreamMachineComponent: null,
          description: '<p>Twisted thorny vegetation made of bone and sinew. The brambles move and writhe, grabbing at passersby.</p>'
        },
        {
          id: 'c3',
          name: 'Ash Dunes',
          coordinates: { x: 40, y: 45 },
          terrain: ['ash', 'waste'],
          status: 'U',
          dreamMachineComponent: 'Soul Coin Mechanism',
          description: '<p>Rolling hills of fine ash that shift constantly in the sulfurous winds. Hidden treasures and dangers lie buried beneath.</p>'
        }
      ]
    }

    const uniqueTerrains = computed(() => {
      if (!map.value) return []
      const terrains = new Set()
      map.value.hexes.forEach(hex => {
        hex.terrain.forEach(t => terrains.add(t))
      })
      return Array.from(terrains)
    })

    const dreamMachineCount = computed(() => {
      if (!map.value) return 0
      return map.value.hexes.filter(hex => hex.dreamMachineComponent).length
    })

    const exploredCount = computed(() => {
      if (!map.value) return 0
      return map.value.hexes.filter(hex => hex.status === 'E').length
    })

    const loadMap = async () => {
      try {
        loading.value = true
        const mapId = route.params.mapid
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // In real app: const response = await fetch(`/api/maps/${mapId}`)
        // map.value = await response.json()
        
        if (mapId === 'avernus-layer-1') {
          map.value = sampleMapData
        } else {
          throw new Error('Map not found')
        }
      } catch (error) {
        console.error('Failed to load map:', error)
        map.value = null
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.push('/maps')
    }

    const toggleView = () => {
      showTerrainView.value = !showTerrainView.value
    }

    const getHexPosition = (coordinates) => {
      return {
        left: `${coordinates.x}%`,
        top: `${coordinates.y}%`
      }
    }

    const selectHex = (hex) => {
      selectedHex.value = hex
    }

    const closeHexDetails = () => {
      selectedHex.value = null
    }

    const formatTerrain = (terrain) => {
      return terrain.charAt(0).toUpperCase() + terrain.slice(1)
    }

    const updateHexStatus = () => {
      // In real app, this would save to backend
      console.log('Hex status updated:', selectedHex.value.status)
    }

    const onMapImageLoad = () => {
      // Handle map image loading completion
      console.log('Map image loaded')
    }

    onMounted(() => {
      loadMap()
    })

    return {
      map,
      loading,
      selectedHex,
      showTerrainView,
      isDMView,
      uniqueTerrains,
      dreamMachineCount,
      exploredCount,
      goBack,
      toggleView,
      getHexPosition,
      selectHex,
      closeHexDetails,
      formatTerrain,
      updateHexStatus,
      onMapImageLoad
    }
  }
}
</script>

<style scoped>
.map-view-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #e0e0e0;
}

.map-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: linear-gradient(90deg, #2d1b0e, #1a1a1a);
  border-bottom: 2px solid #ff6b35;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 2px solid #ff6b35;
  color: #ff6b35;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #ff6b35;
  color: white;
}

.back-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.map-title-section {
  flex: 1;
  text-align: center;
}

.map-title {
  margin: 0;
  font-size: 1.8rem;
  color: #ff6b35;
}

.map-subtitle {
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.view-toggle {
  background: #333;
  border: 2px solid #555;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-toggle:hover,
.view-toggle.active {
  background: #ff6b35;
  border-color: #ff6b35;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.map-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.map-canvas-container {
  flex: 1;
  position: relative;
  overflow: auto;
}

.map-canvas {
  position: relative;
  min-width: 800px;
  min-height: 600px;
}

.background-map {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.hex-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hex-location {
  position: absolute;
  pointer-events: all;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.hex-shape {
  width: 60px;
  height: 60px;
  background: rgba(255, 107, 53, 0.3);
  border: 2px solid #ff6b35;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.hex-location:hover .hex-shape {
  background: rgba(255, 107, 53, 0.6);
  transform: scale(1.1);
}

.hex-location.explored .hex-shape {
  background: rgba(255, 107, 53, 0.7);
  border-color: #ff6b35;
}

.hex-location.known .hex-shape {
  background: rgba(139, 69, 19, 0.5);
  border-color: #8b4513;
}

.hex-inner {
  text-align: center;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
}

.hex-label {
  display: block;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.component-indicator {
  display: block;
  font-size: 1rem;
  margin-top: 2px;
}
</style>