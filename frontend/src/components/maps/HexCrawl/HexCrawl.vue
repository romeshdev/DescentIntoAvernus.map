<template>
    <div id="hexcrawl" class="honeycomb" :style="{ backgroundImage: map.id ? `url('../${map.id}-map.jpg')` : '' }">
      <div v-for="(element, rowIndex) in printable" :key="rowIndex">
        <Row :element="element" @open-modal="openModal" />
      </div>
    </div>
</template>

<script setup>
import { ref, provide, watch } from 'vue'
import Row from './Row.vue'

const props = defineProps({
  locations: Array,
  map: Object
})
provide('map', props.map)

const printable = ref([])
const emit = defineEmits(['open-modal'])

const createPrintable = () => {
  let prevH = {}
  const rows = Number(props.locations.at(-1)?.id.charAt(1) || 0)
  const newPrintable = Array.from({ length: rows }, () => [])

  props.locations.forEach((item) => {
    const rowIdx = Number(item.id.charAt(1)) - 1
    const colIdx = parseInt(item.id.charAt(0), 36) - 10

    if (item.id !== prevH.id) {
      newPrintable[rowIdx].push({ ...item }) // Create new object reference
    } else {
      newPrintable[rowIdx][colIdx].name += "\n" + item.name
    }

    prevH = item
  })
  
  return newPrintable
}

function openModal(hex) {
  emit('open-modal', hex)
}

watch(() => props.locations, (newLocations) => {
  console.log('Locations updated:', newLocations.length, 'items')
  printable.value = createPrintable()
}, { deep: true })

</script>

<style scoped>
/* *,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
} */


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