<template>
    <a @click.prevent="openModal" style="cursor: pointer;">
      <div class="mapNode" :style="styleObject" :class="statusClass" :title="locName">
          <div>{{ parsedNumId }}</div>
      </div>
    </a>
</template>
<script>
export default {
  name: "LocationMarker",
  props: {
    x: Number,
    y: Number,
    numId: String,
    locName: String,
    status: String
  },
  computed: {
    styleObject() {
      return {
        position: "absolute",
        top: this.y + "px",
        left: this.x + "px",
      };
    },
    parsedNumId() {
      // Using a regular expression to retain only numbers
      return this.numId.replace(/\D/g, "");
    },
    statusClass() {
      if (!this.status) return 'status-unknown';
      switch (this.status.toLowerCase()){
        case "u":
          return 'status-unknown';
        case "e":
          return 'status-explored';
        case "k":
          return 'status-known';
      }
    }
  },  
  methods: {
    openModal() {
      this.$emit('open-modal', this.numId);
    }
  }
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
  font-size: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  z-index: 100;
}

.mapNode.status-explored {
  background-color: #579304; /* Green for explored */
}

.mapNode.status-known {
  background-color: #936f04; /* Yellow for known */
}

.status-known {
    background-color: #ffc107; /* Yellow for known */
}

.status-explored {
    background-color: #28a745; /* Green for explored */
}
</style>