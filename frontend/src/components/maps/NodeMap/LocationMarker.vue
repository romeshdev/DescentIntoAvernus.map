<template>
  <a @click.prevent="openModal" style="cursor: pointer;">
    <div v-if="type == null || type == 'recap'" class="mapNode" :style="positionObject" :class="statusClass" :title="locName">
        <div v-if="type == null || type == 'recap'">{{ label }}</div>
        <!-- <div v-else-if="type == 'poi'"><v-icon icon="mdi-exclamation-thick"></v-icon></div> -->
        <!-- <div v-else-if="type == 'unknown'"><v-icon icon="mdi-help"></v-icon></div>
        <div v-else-if="type == 'danger'"><v-icon icon="mdi-skull"></v-icon></div>
        <div v-else-if="type == 'treasure'"><v-icon icon="mdi-treasure-chest"></v-icon></div>
        <div v-else-if="type == 'note'"><v-icon icon="mdi-note-text-outline"></v-icon></div> -->
    </div>
    <v-icon v-for="(item, i) in locationTypes" :key="i" :style="positionObject" v-tooltip:bottom="locName">
      <v-icon size="55" color="grey-darken-4" v-if="item.type == type">mdi-map-marker</v-icon>
      <v-icon size="20" class="position-absolute" style="top: -5px;" color="grey-darken-4" v-if="item.type == type">mdi-circle</v-icon>
      <v-icon size="20" class="position-absolute" style="top: -3px;" color="white" v-if="item.type == type">{{item.icon}}</v-icon>
    </v-icon>
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

const locationTypes = inject('locationTypes')
const emit = defineEmits(['open-modal', 'mouse-enter', 'mouse-leave'])

const positionObject = computed(() => {
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