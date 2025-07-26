<template>
  <div>
    <div id="hexcrawl" class="honeycomb" :style="{ backgroundImage: mapId ? `url('../${mapId}-map.jpg')` : '' }" v-if="mapId == 'avernus'">
      <div v-for="(element, rowIndex) in printable" :key="rowIndex">
        <Row :element="element" @open-modal="openLocationModal" />
        <!-- <div :class="invisTerr" style="position: absolute">
          <img
            class="hexImg noselect"
            v-for="terr in element"
            :key="terr.id"
            :id="terr.id"
            :src="'/avernus-tiles/' + terr.terrain[0] + '.png'"
          />
        </div> -->
      </div>

      <!-- Location Modal -->

    </div>
    <div id="nodes" class="honeycomb" :style="{ backgroundImage: mapId ? `url('../${mapId}-map.jpg')` : '' }" v-if="mapId != 'avernus'">
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
        
    </div>
    <EditControls />
    <MarkerPlacementOverlay v-if="placingMarker" @place="handleMapClickFromOverlay" />
    <LocationModal
      v-if="showLocationModal"
      :region="mapId"
      :hex="selectedHex"
      :pendingLocation="pendingMarker"
      @close-modal="closeLocationModal"
      @location-updated="handleLocationUpdate"
      :editable="true"
    />
  </div>
</template>

<script setup>
import { ref, inject, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import Row from '../components/Row.vue'
import LocationModal from '../components/LocationModal.vue'
import LocationMarker from '../components/LocationMarker.vue'
import EditControls from '../components/EditControls.vue'
import MarkerPlacementOverlay from '../components/MarkerPlacementOverlay.vue'

// Inject edit mode
const editMode = inject('editMode')
const placingMarker = ref(false)
const pendingMarker = ref({ x: 0, y: 0 })

provide('placingMarker', placingMarker)
provide('startPlacingMarker', () => placingMarker.value = true)

const handleMapClickFromOverlay = ({ x, y }) => {
  if (!editMode?.value) return

  const ids = locations.value.map(item => item.id);
  const id = Math.max(...ids.map(id => parseInt(String(id).match(/^\d+/)?.[0] ?? 0))) + 1; 
  const name = 'New Location'
  pendingMarker.value = {
    "x": x, 
    "y": y, 
    "id": `${id}`, 
    "name": name
  }
  locations.value.push(pendingMarker.value)

  placingMarker.value = false
  openLocationModal(`${id}`)
}

// Standard component state and logic
const mapId = ref('')
const printable = ref([])
const locations = ref([])

const showLocationModal = ref(false)
const selectedHex = ref(null)

const route = useRoute()

const fetchData = async () => {
  try {
    const response = await fetch(`/api/data/maps/${mapId.value}`)
    const data = await response.json()
    locations.value = data
    if (mapId.value === 'avernus') {
      filterData()
    }
  } catch (error) {
    console.error('Error loading locations:', error)
  }
}

const filterData = () => {
  let prevH = {}
  const rows = Number(locations.value.at(-1).id.charAt(1))
  printable.value = Array.from({ length: rows }, () => [])

  locations.value.forEach((item) => {
    const rowIdx = Number(item.id.charAt(1)) - 1
    const colIdx = parseInt(item.id.charAt(0), 36) - 10

    if (item.id !== prevH.id) {
      printable.value[rowIdx].push(item)
    } else {
      printable.value[rowIdx][colIdx].name += "\n" + item.name
    }

    prevH = item
  })
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
  for (let row of printable.value) {
    for (let location of row) {
      if (location.id === hex) {
        Object.assign(location, data)
        break
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

// Watch route for changes
watch(() => route.params.id, (newId) => {
  mapId.value = newId
  fetchData()
}, { immediate: true })

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
  /* left/right margin approx. 25% of .hexagon width + spacing */
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