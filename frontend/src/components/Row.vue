<template>
    <div class="ibws-fix noselect">
        <Hexagon v-for="location in element" :key="location.id" :hex="location.id" :name="location.name" :status="location.status" @open-modal="$emit('open-modal', $event)"></Hexagon>
    </div>
</template>
<script>
import Hexagon from '../components/Hexagon.vue'

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

</style>