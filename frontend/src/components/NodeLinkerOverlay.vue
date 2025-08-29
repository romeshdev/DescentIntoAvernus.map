<template>
  <div v-if="enabled" class="placement-overlay" @mousemove="handleMouseMove" @mouseleave="hide" @mousedown="startHold($event)" @mouseup="endHold($event)">
    <!-- Tooltip -->
    <div v-if="showTooltip" class="coord-tooltip" :style="{ top: `${mouseY + 12}px`, left: `${mouseX + 12}px` }">
      x: {{ gridX }}, y: {{ gridY }}
    </div>

    <div :style="calculateLineStyle(startPoint, target)" class="line"></div>

    <!-- Crosshairs -->
    <div v-if="showTooltip" class="crosshair-vertical" :style="{ left: `${mouseX}px` }" />
    <div v-if="showTooltip" class="crosshair-horizontal" :style="{ top: `${mouseY}px` }" />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const enabled = inject('editMode')
const emit = defineEmits(['startPoint', 'endPoint', 'dragTarget'])

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
  startPoint.value = { x: gridX.value, y: gridY.value }
  emit('startPoint', startPoint.value)
}

function endHold(e) {
  emit('endPoint', target.value)
  startPoint.value = null
  target.value = null
}

const handleClick = () => {
  if (!isMouseDownActive.value) {
    // Only execute click logic if mousedown didn't prevent it
    console.log('Click event triggered');
  } else {
    console.log('Click event prevented by mousedown');
  }
};

const calculateLineStyle = (location1, location2) => {
  if (!location1 || !location2) return {}
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