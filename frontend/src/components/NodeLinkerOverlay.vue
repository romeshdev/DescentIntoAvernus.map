<template>
  <div v-if="enabled" class="placement-overlay" @mousemove="handleMouseMove" @mouseleave="hide" @mousedown="startHold($event)" @mouseup="endHold($event)">
    <!-- Tooltip -->
    <div v-if="showTooltip" class="coord-tooltip" :style="{ top: `${mouseY + 12}px`, left: `${mouseX + 12}px` }">
      x: {{ gridX }}, y: {{ gridY }}
    </div>

    <div :style="calculateLineStyle(startPoint, target)"></div>
    <div v-for="node in nodes" :key="node.id">
      <div v-for="connectedId in node.connectedTo" 
            :key="connectedId" 
            :style="calculateLineButton(node, nodes.find(loc => loc.id === connectedId))"
            @click="deleteLink(node.id, connectedId)"
      >x</div>
    </div>

    <!-- Crosshairs -->
    <div v-if="showTooltip" class="crosshair-vertical" :style="{ left: `${mouseX}px` }" />
    <div v-if="showTooltip" class="crosshair-horizontal" :style="{ top: `${mouseY}px` }" />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { updateLocation } from '../services/api-service';

const enabled = inject('editMode')
const emit = defineEmits(['startPoint', 'endPoint', 'dragTarget'])
const props = defineProps({
  mapId: String,
  nodes: Array,
})

const mouseX = ref(0)
const mouseY = ref(0)
const showTooltip = ref(false)

const gridX = computed(() => Math.round(mouseX.value))
const gridY = computed(() => Math.round(mouseY.value))

const startPoint = ref(null)
const target = ref(null)

function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
  showTooltip.value = true
  target.value = { x: gridX.value, y: gridY.value }
  emit('dragTarget', target.value)
}

function hide() {
  showTooltip.value = false
}

function startHold(e) {
  let possiblePoint = findClosestPoint(gridX.value, gridY.value)
  if (Math.abs(possiblePoint.distance) < 30) {
    startPoint.value = possiblePoint.point
  }
}

async function endHold(e) {
  try {
    let endPoint = findClosestPoint(target.value.x, target.value.y)
    if (Math.abs(endPoint.distance) < 30 && startPoint.value) {
      const fromId = startPoint.value.id
      const toId = endPoint.point.id
      if(fromId !== toId && !startPoint.value.connectedTo.find(x => x === toId) && !endPoint.point.connectedTo.find(x => x === fromId)) {
        startPoint.value.connectedTo.push(toId)
        await updateLocation(props.mapId, startPoint.value.id, { connectedTo: startPoint.value.connectedTo })
      }
    } 
  } finally {
    startPoint.value = null
    target.value = null
  }
}

async function deleteLink(nodeId, connectionId) {
  let node = props.nodes.find(n => n.id == nodeId)
  node.connectedTo = node.connectedTo.filter(x => x !== connectionId)
  await updateLocation(props.mapId, nodeId, { connectedTo: node.connectedTo })
}

const findClosestPoint = (x, y) => { 
  let targetPoint = { x, y }
  let closestPoint = props.nodes[0];
  let shortestDistance = Math.sqrt((targetPoint.x - closestPoint.x) ** 2 + (targetPoint.y - closestPoint.y) ** 2);
  
  for (let i = 1; i < props.nodes.length; i++) {
    const point = props.nodes[i];
    const distance = Math.sqrt((targetPoint.x - point.x) ** 2 + (targetPoint.y - point.y) ** 2);
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestPoint = point;
    }
  }
  
  return {
    point: closestPoint,
    distance: shortestDistance
  };
}

const calculateLineStyle = (location1, location2) => {
  if (!location1 || !location2 ) return {} // || location1.status !== "E" || location2.status !== "E"
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

const calculateLineButton = (location1, location2) => {
  if (!location1 || !location2 ) return {} // || location1.status !== "E" || location2.status !== "E"
  const mx = (location1.x + location2.x) / 2
  const my = (location1.y + location2.y) / 2
  const middle = { x: mx, y: my }
  return {
    position: 'absolute',
    width: '20px',
    height: '20px',
    top: middle.y + 'px',
    left: middle.x + 'px',
    backgroundColor: '#e54646',
    borderRadius: '50%',
    // border: '2px solid white',
    transform: 'translate(-50%, -50%)',
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    zIndex: '100',
    fontWeight: 'bold',
    userSelect: 'none'
  }
}

</script>

<style scoped>
.placement-overlay {
  position: absolute;
  inset: 0;
  cursor: crosshair;
  z-index: 150;
}

.coord-tooltip {
  position: absolute;
  background: black;
  color: white;
  padding: 4px 6px;
  font-size: 12px;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
}

.crosshair-vertical,
.crosshair-horizontal {
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9;
  pointer-events: none;
}

.crosshair-vertical {
  width: 1px;
  height: 100%;
}

.crosshair-horizontal {
  height: 1px;
  width: 100%;
}
</style>