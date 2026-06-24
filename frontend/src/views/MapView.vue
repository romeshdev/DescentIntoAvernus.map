<template>
  <div>
    <HeroImages />
    <MapControls />

    <!-- Map View -->
    <HexCrawl v-if="map != null && map.type == 'hexcrawl'" :locations="locations" :map="map" @open-modal="openLocationModal" />
    <NodeMap v-if="map != null && map.type == 'nodemap'" :locations="locations" :map="map" @open-modal="openLocationModal" :filter="nodeFilter" />

    <!-- <EditControls /> -->

    <!-- Node Modal Popup -->
    <LocationModal
      v-if="showLocationModal"
      :region="mapId"
      :locationId="selectedLocation"
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
import { getMap, getLocations } from '../services/api-service';
import LocationModal from '../components/maps/LocationModal.vue'
import EditControls from '../components/edit-controls/EditControls.vue'
import MapControls from '../components/edit-controls/MapControls.vue'
import HexCrawl from '../components/maps/HexCrawl/HexCrawl.vue'
import NodeMap from '../components/maps/NodeMap/NodeMap.vue'
import HeroImages from '../components/HeroImages.vue'

const isAuthenticated = inject('isAuthenticated')

const mapId = ref('')
const map = ref([])
provide('mapId', mapId)
provide('map', map)
const locations = ref([])
const showLocationModal = ref(false)
const selectedLocation = ref(null)
const route = useRoute()

const placingMarker = ref(false)
const placingPOI = ref(false)
const placingPOIType = ref(null)
const linkingPoints = ref(false)
const nodeFilter = ref('poi')
provide('placingMarker', placingMarker)
provide('placingPOI', placingPOI)
provide('placingPOIType', placingPOIType)
provide('linkingPoints', linkingPoints)
provide('nodeFilter', nodeFilter)

const locationTypes = ref([
  { name: 'Point of Interest', type: "poi",      icon: "mdi-exclamation-thick", nodeFilter: "poi",    allowedActions: ["add"] },
  { name: 'Danger!',           type: "danger",   icon: "mdi-skull",             nodeFilter: "poi",    allowedActions: ["add"] },
  { name: 'Treasure',          type: "treasure", icon: "mdi-treasure-chest",    nodeFilter: "poi",    allowedActions: ["add"] },
  { name: 'Note',              type: "note",     icon: "mdi-note-text-outline", nodeFilter: "poi",    allowedActions: ["add"] },
  // { name: 'Sub-Map',           type: "map",      icon: "mdi-map",               nodeFilter: "poi",    allowedActions: ["add"] },
  
  { name: 'Unknown',           type: "unknown",  icon: "mdi-help",              nodeFilter: "poi",    allowedActions: ["add"] },

  { name: 'Recap',             type: "recap",    icon: "mdi-note-text-outline", nodeFilter: "recaps", allowedActions: ["add", "link"] },
])
provide('locationTypes', locationTypes)


// Computed property to get the selected location model
const selectedLocationModel = computed(() => {
  if (!selectedLocation.value) return null
  return locations.value.find(loc => loc.id === selectedLocation.value)
})

// Updated script section with fixed reactivity
const fetchData = async () => {
  try {
    map.value = await getMap(mapId.value)
    const locationResponse = await getLocations(mapId.value)
    locations.value = [...locationResponse]
  } catch (error) {
    locations.value = []
  }
}

const openLocationModal = (hex) => {
  selectedLocation.value = hex
  showLocationModal.value = true
}

const closeLocationModal = () => {
  selectedLocation.value = null
  showLocationModal.value = false
}

const handleLocationUpdate = (event) => {
  const { hex, data } = event
  
  const locationIndex = locations.value.findIndex(loc => loc.id === hex)
  if (locationIndex !== -1) {
    if (data === null){
      locations.value.splice(locationIndex, 1);
      return;
    } 
    Object.assign(locations.value[locationIndex], data)
  }
}

// Enhanced watch statements with better debugging
watch(() => route.params.id, async (newId, oldId) => {
  console.log('Route changed from', oldId, 'to', newId)
  mapId.value = newId

  // Reset state first
  locations.value = []
  
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
</script>

<style scoped>
</style>