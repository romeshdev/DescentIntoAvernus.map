<template>
  <div>
    <div id="hexcrawl" class="honeycomb" :style="{ backgroundImage: mapId ? `url('../${mapId}-map.jpg')` : '' }" v-if="map != null && map.type == 'hexcrawl'">
      <div v-for="(element, rowIndex) in printable" :key="rowIndex">
        <Row :element="element" @open-modal="openLocationModal" />
        <!-- <div :class="invisTerr" style="position: absolute">
          <span class="hexImg noselect" v-for="terr in element" style="z-index: 999;top: -80px;">{{ terr.name }}</span>
        </div> -->
      </div>

      <!-- Location Modal -->

    </div>
    <div id="nodes" class="honeycomb" :style="{ backgroundImage: mapId ? `url('../${mapId}-map.jpg')` : '' }" v-if="map != null && map.type == 'nodemap'">
        <!-- Render location markers -->
        <LocationMarker v-for="location in locations" 
                          :key="`node${location.id}`"
                          :x="location.x" 
                          :y="location.y" 
                          :status="location.status"
                          :numId="location.id" 
                          :locName="location.name"
                          @open-modal="openLocationModal">
        </LocationMarker>

        <!-- Render connecting lines -->
        <div v-for="location in locations" :key="location.id">
            <div v-for="connectedId in location.connectedTo" :key="connectedId"
                  :style="calculateLineStyle(location, locations.find(loc => loc.id === connectedId), location.id, connectedId)"
                  class="line"></div>
        </div>
        
        <MarkerPlacementOverlay v-if="placingMarker" @place="handleMapClickFromOverlay" />
        <NodeLinkerOverlay v-if="linkingPoints" @startPoint="setNodeLinkerStart" @endPoint="setNodeLinkerEnd" @dragTarget="setNodeLinkerTarget" />
    </div>
    <EditControls />
    <LocationModal
      v-if="showLocationModal"
      :region="mapId"
      :hex="selectedHex"
      :locationModel="selectedLocationModel"
      @close-modal="closeLocationModal"
      @location-updated="handleLocationUpdate"
      :editable="true"
    />
  </div>
</template>

<script setup>
import { nextTick, ref, inject, provide, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import Row from '../components/Row.vue'
import LocationModal from '../components/LocationModal.vue'
import LocationMarker from '../components/LocationMarker.vue'
import EditControls from '../components/EditControls.vue'
import MarkerPlacementOverlay from '../components/MarkerPlacementOverlay.vue'
import NodeLinkerOverlay from '../components/NodeLinkerOverlay.vue'

// Inject edit mode and authentication state
const editMode = inject('editMode')
const isAuthenticated = inject('isAuthenticated')
const placingMarker = ref(false)
const pendingMarker = ref(null)

provide('placingMarker', placingMarker)
provide('startPlacingMarker', () => placingMarker.value = true)

const linkingPoints = ref(false)
const pendingPointLink = ref(null)

provide('linkingPoints', linkingPoints)
provide('startLinkingPoints', () => linkingPoints.value = true)

const handleMapClickFromOverlay = ({ x, y }) => {
  if (!editMode?.value) return

  const ids = locations.value.map(item => item.id);
  const id = ids.length === 0 ? "1" : Math.max(...ids.map(id => parseInt(String(id).match(/^\d+/)?.[0] ?? 0))) + 1; 
  const name = 'New Location'
  const newLocation = {
    "x": x, 
    "y": y, 
    "id": `${id}`, 
    "name": name,
    "text": "",
    "status": "U",
    "connectedTo": []
  }
  
  locations.value.push(newLocation)
  placingMarker.value = false
  openLocationModal(`${id}`)
}

const setNodeLinksetNodeLinkerStarterEnd = ({ x, y }) => {}
const setNodeLinkerTarget = ({ x, y }) => {}
const setNodeLinkerEnd = ({ x, y }) => {}

// Standard component state and logic
const mapId = ref('')
provide('mapId', mapId)
const printable = ref([])
const locations = ref([])
const map = ref([])

const showLocationModal = ref(false)
const selectedHex = ref(null)

// Computed property to get the selected location model
const selectedLocationModel = computed(() => {
  if (!selectedHex.value) return null
  
  // First check if it's in the locations array (for node maps)
  let location = locations.value.find(loc => loc.id === selectedHex.value)
  
  // If not found and we have avernus printable data, search there
  if (!location && mapId.value === 'avernus') {
    for (let row of printable.value) {
      location = row.find(loc => loc.id === selectedHex.value)
      if (location) break
    }
  }
  
  return location || null
})

const route = useRoute()

// Updated script section with fixed reactivity
const fetchData = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // Add authorization header if user is authenticated
    if (isAuthenticated?.value) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    const mapsResponse = await fetch(`/api/data/maps`, { headers });
    const mapsData = await mapsResponse.json();
    map.value = mapsData.find(x => x.id == mapId.value);
    
    const response = await fetch(`/api/data/maps/${mapId.value}`, { headers })
    const data = await response.json()
    
    // Force reactivity by replacing the entire array
    locations.value = [...data] // Create new array reference
    
    if (mapId.value === 'avernus') {
      // Clear printable first to ensure reactivity
      printable.value = []
      await nextTick() // Wait for DOM update
      filterData()
    }
  } catch (error) {
    console.error('Error loading locations:', error)
    // Reset on error to ensure clean state
    locations.value = []
    if (mapId.value === 'avernus') {
      printable.value = []
    }
  }
}

const filterData = () => {
  let prevH = {}
  const rows = Number(locations.value.at(-1)?.id.charAt(1) || 0)
  
  // Create completely new array structure
  const newPrintable = Array.from({ length: rows }, () => [])

  locations.value.forEach((item) => {
    const rowIdx = Number(item.id.charAt(1)) - 1
    const colIdx = parseInt(item.id.charAt(0), 36) - 10

    if (item.id !== prevH.id) {
      newPrintable[rowIdx].push({ ...item }) // Create new object reference
    } else {
      newPrintable[rowIdx][colIdx].name += "\n" + item.name
    }

    prevH = item
  })
  
  // Replace entire printable array
  printable.value = newPrintable
}

const openLocationModal = (hex) => {
  selectedHex.value = hex
  showLocationModal.value = true
}

const closeLocationModal = () => {
  selectedHex.value = null
  showLocationModal.value = false
  pendingMarker.value = null
}

const handleLocationUpdate = (event) => {
  const { hex, data } = event
  
  // Update in locations array (for node maps)
  const locationIndex = locations.value.findIndex(loc => loc.id === hex)
  if (locationIndex !== -1) {
    if (data === null){
      locations.value.splice(locationIndex, 1);
      return;
    } 
    Object.assign(locations.value[locationIndex], data)
  }

  // Update in printable array (for avernus hex maps)
  if (mapId.value === 'avernus') {
    for (let row of printable.value) {
      for (let location of row) {
        if (location.id === hex) {
          Object.assign(location, data)
          break
        }
      }
    }
  }
}

const calculateLineStyle = (location1, location2, numId, numId2) => {
  if (!location2 || numId > numId2) return {}
  const x1 = location1.x
  const y1 = location1.y
  const x2 = location2.x
  const y2 = location2.y
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI

  return {
    position: 'absolute',
    top: y1 + 'px',
    left: x1 + 'px',
    width: length + 'px',
    transform: `rotate(${angle}deg)`,
    transformOrigin: '0 0',
    height: '4px',
    border: '1px solid black',
    backgroundColor: 'white',
    zIndex: 20,
  }
}

// Enhanced watch statements with better debugging
watch(() => route.params.id, async (newId, oldId) => {
  console.log('Route changed from', oldId, 'to', newId)
  mapId.value = newId
  
  // Reset state first
  locations.value = []
  printable.value = []
  
  // Wait for next tick to ensure DOM is updated
  await nextTick()
  
  // Then fetch new data
  await fetchData()
  console.log('Data fetched, locations count:', locations.value.length)
}, { immediate: true })

// Watch authentication state and re-fetch data when user authenticates
watch(() => isAuthenticated?.value, async (newAuth, oldAuth) => {
  console.log('Auth changed from', oldAuth, 'to', newAuth)
  // Only re-fetch if authentication state changed from false to true
  if (newAuth && !oldAuth && mapId.value) {
    console.log('Re-fetching data due to auth change')
    await fetchData()
    console.log('Auth-triggered fetch complete, locations count:', locations.value.length)
  }
})

// Add this for debugging - watch locations changes
watch(() => locations.value, (newLocations) => {
  console.log('Locations updated:', newLocations.length, 'items')
}, { deep: true })

// Add this for debugging - watch printable changes  
watch(() => printable.value, (newPrintable) => {
  console.log('Printable updated:', newPrintable.length, 'rows')
}, { deep: true })

</script>

<style scoped>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.ibws-fix {
  /* inline-block whitespace fix */
  font-size: 0;
}

.honeycomb {
  position: relative;
  background-repeat: no-repeat;
  background-size: 100%;
  margin: 0 auto;
  text-align: center;
  height: 918px;
  width: 1292.4px;
  padding-top: 10px;
  padding-right: 30px;
}

.mapClass {
  background-image: url("../avernus-map.jpg");
}

.noselect {
  -webkit-touch-callout: none;
  /* iOS Safari */
  -webkit-user-select: none;
  /* Safari */
  -khtml-user-select: none;
  /* Konqueror HTML */
  -moz-user-select: none;
  /* Old versions of Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
  user-select: none;
  /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}

.idImg {
  position: relative;
  display: inline-block;
  /* left/right margin approx. 25% of .idagon width + spacing */
  text-align: center;
  height: 145px;
  width: 169.5px;
  margin-top: -6px;
  top: -139.5px;
  left: 48.5px;
  margin-left: -48px;
}

.idImg:nth-child(even) {
  /* top approx. 50% of .idagon height + spacing */
  top: -71px;
}

.visTerrain {
  position: absolute;
}

.invisTerrain {
  position: absolute;
  opacity: 0;
}

.hexTitle {
  position: absolute;
  opacity: 0;
}

.lowerLev {
  background-image: url("../lower.png");
}

.upperLev {
  position: absolute;
  z-index: 85;
  margin-top: -854px;
  margin-left: -632px;
  width: 1292px;
}

.hexImg {
  position: relative;
  display: inline-block;
  /* left/right margin approx. 25% of .idagon width + spacing */
  text-align: center;
  height: 145px;
  width: 169.5px;
  margin-top: -6px;
  top: -139.5px;
  left: 48.5px;
  margin-left: -48px;
}

.hexImg:nth-child(even) {
  /* top approx. 50% of .hexagon height + spacing */
  top: -71px;
}
</style>