<template>
    <div class="ibws-fix noselect">
        <Hexagon v-for="location in element" :key="location.id" :hex="location.id" :name="location.name" :status="location.status" @open-modal="$emit('open-modal', $event)"></Hexagon>
    </div>
</template>
<script>
import Hexagon from './Hexagon.vue'

export default {
  name: "Row",
  components: { Hexagon },
  props: {
    printable: Array,
    element: Array,
    hex: String,
    status: String
  },
}
</script>
<style scoped>
.ibws-fix {
  /* inline-block whitespace fix */
  font-size: 0;
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
</style>