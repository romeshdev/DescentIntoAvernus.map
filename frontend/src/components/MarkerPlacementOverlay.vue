<template>
  <div
    v-if="enabled"
    class="placement-overlay"
    @mousemove="handleMouseMove"
    @mouseleave="hide"
    @click="placeMarker"
  >
    <!-- Tooltip -->
    <div
      v-if="showTooltip"
      class="coord-tooltip"
      :style="{ top: `${mouseY + 12}px`, left: `${mouseX + 12}px` }"
    >
      x: {{ gridX }}, y: {{ gridY }}
    </div>

    <!-- Crosshairs -->
    <div
      v-if="showTooltip"
      class="crosshair-vertical"
      :style="{ left: `${mouseX}px` }"
    />
    <div
      v-if="showTooltip"
      class="crosshair-horizontal"
      :style="{ top: `${mouseY}px` }"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const enabled = inject('editMode') // assumes this is a ref
const emit = defineEmits(['place'])

const mouseX = ref(0)
const mouseY = ref(0)
const showTooltip = ref(false)

const gridX = computed(() => Math.round(mouseX.value))
const gridY = computed(() => Math.round(mouseY.value))

function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
  showTooltip.value = true
}

function hide() {
  showTooltip.value = false
}

function placeMarker() {
  emit('place', { x: gridX.value, y: gridY.value })
}
</script>

<style scoped>
.placement-overlay {
  position: absolute;
  inset: 0;
  cursor: crosshair;
  z-index: 10;
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