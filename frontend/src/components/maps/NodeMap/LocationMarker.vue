<template>
  <a @click.prevent="openModal" style="cursor: pointer;">
    <div class="mapNode" :style="styleObject" :class="statusClass" :title="locName">
        <div v-if="type == null">{{ label }}</div>
        <div v-else-if="type == 'poi'">❕</div>
        <!-- <div v-else-if="type == 'recap'">📝</div> -->
        <div v-else-if="type == 'unknown'">❔</div>
    </div>
  </a>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  x: Number,
  y: Number,
  numId: String,
  locName: String,
  label: String,
  status: String,
  type: String
})

const emit = defineEmits(['open-modal', 'mouse-enter', 'mouse-leave'])

const styleObject = computed(() => {
  return {
    position: "absolute",
    top: props.y + "px",
    left: props.x + "px",
  };
})

const parsedNumId = computed(() => {
  return typeof props.numId === 'string' ? props.numId.replace(/\D/g, '') : ''
})

const statusClass = computed(() => {
  if (!props.status) return 'status-unknown';
  switch (props.status.toLowerCase()){
    case "u":
      return 'status-unknown';
    case "e":
      return 'status-explored';
    case "k":
      return 'status-known';
  }
})

const openModal = () => {
  emit('open-modal', props.numId);
}
</script>

<style scoped>
.mapNode {
  width: 55px;
  height: 55px;
  background-color: black;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  font-size: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  z-index: 100;
  font-weight: bold;
  user-select:none;
}

.mapNode.status-explored {
  border-color: #579304; /* Green for explored */
  color: #579304; /* Yellow for known */
}

.mapNode.status-known {
  border-color: #936f04; /* Yellow for known */
  color: #936f04; /* Yellow for known */
}
</style>