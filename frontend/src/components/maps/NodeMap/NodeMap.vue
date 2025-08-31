<template>
    <div id="nodes" class="honeycomb" :style="{ backgroundImage: map.id ? `url('../${map.id}-map.jpg')` : '' }" v-if="map != null && map.type == 'nodemap'">
        <LocationMarker v-for="location in locations" 
                          :key="`node${location.id}`"
                          :x="location.x" 
                          :y="location.y" 
                          :status="location.status"
                          :numId="location.id" 
                          :locName="location.name"
                          :label="location.nodeLabel"
                          @open-modal="emit('open-modal', location.id)">
        </LocationMarker>

        <div v-for="location in locations" :key="location.id">
            <div v-for="connectedId in location.connectedTo" :key="connectedId" :style="calculateLineStyle(location, locations.find(loc => loc.id === connectedId))"></div>
        </div>
        
        <MarkerPlacementOverlay v-if="placingMarker" @place="handleMapClickFromOverlay" />
        <NodeLinkerOverlay v-if="linkingPoints" :mapId="map.id" :nodes="locations" />
    </div>
</template>

<script setup>
import { inject, provide } from 'vue'
import LocationMarker from './LocationMarker.vue'
import MarkerPlacementOverlay from './MarkerPlacementOverlay.vue'
import NodeLinkerOverlay from './NodeLinkerOverlay.vue'

const emit = defineEmits(['open-modal'])
const props = defineProps({
  locations: Array,
  map: Object
})
provide('mapId', props.map.id)
provide('map', props.map)

const editMode = inject('editMode')
const placingMarker = inject('placingMarker')
const linkingPoints = inject('linkingPoints')

const handleMapClickFromOverlay = ({ x, y }) => {
  if (!editMode?.value || !placingMarker?.value) return

  const ids = props.locations.map(item => item.id);
  const id = ids.length === 0 ? "1" : Math.max(...ids.map(id => parseInt(String(id).match(/^\d+/)?.[0] ?? 0))) + 1; 
  const name = 'New Location'
  const newLocation = {
    "x": x, 
    "y": y, 
    "id": `${id}`, 
    "name": name,
    "nodeLabel": "",
    "text": "",
    "connectedTo": []
  }
  
  props.locations.push(newLocation)
  placingMarker.value = false
  emit('open-modal', `${id}`)
}

const calculateLineStyle = (location1, location2) => {
  if (!location2) return {}
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