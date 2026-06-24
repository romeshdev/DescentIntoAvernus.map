<template>
  <a @click.prevent="openModal" style="cursor: pointer;">
    <div v-if="type == null || type == 'recap'" class="mapNode" :style="positionObject" :class="statusClass" :title="locName">
        <div v-if="type == null || type == 'recap'">{{ label }}</div>
    </div>
    <div v-else-if="type != 'recap'">
      <v-icon v-for="(item, i) in locationTypes" :key="i" :style="positionObject" v-tooltip:bottom="locName">
        <v-icon size="45" class="position-absolute" color="#76d3e2" v-if="item.type == type">mdi-map-marker</v-icon>
        <v-icon size="35" color="grey-darken-4" v-if="item.type == type">mdi-map-marker</v-icon>
        <v-icon size="20" class="position-absolute" style="top: -5px;" color="grey-darken-4" v-if="item.type == type">mdi-circle</v-icon>
        <v-icon size="20" class="position-absolute" style="top: -2px;" color="#76d3e2" v-if="icon">{{icon}}</v-icon>
        <v-icon size="20" class="position-absolute" style="top: -2px;" color="#76d3e2" v-if="!icon && item.type == type">{{item.icon}}</v-icon>
      </v-icon>
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
  type: String,
  icon: String
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
  width: 30px;
  height: 30px;
  background-color: black;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  font-size: 15px;
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