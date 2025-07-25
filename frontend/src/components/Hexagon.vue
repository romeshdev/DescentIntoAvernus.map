<template>
  <a @click.prevent="openModal" :id="hex" class="hexagon" :class="statusClass" style="cursor: pointer;">
    <div class="hexagontent">{{ name }}</div>
  </a>
</template>
<script>
export default {
  name: "Hexagon",
  props: {
    name: String,
    hex: String,
    status: String
  },
  computed: {
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
      this.$emit('open-modal', this.hex);
    }
  }
}
</script>
<style scoped>
.hexagon {
    position: relative;
    display: inline-block;
    /* left/right margin approx. 25% of .hexagon width + spacing */
    margin: 1px 20px;
    background-color: hsl(0, 20%, 50%);
    opacity: 0.4;
    text-align: center;
}

.hexagon,
.hexagon::before,
.hexagon::after {
    /* easy way: height is width * 1.732
    actual formula is 2*(width/(2*Math.tan(Math.PI/6)))
    remove border-radius for sharp corners on hexagons */
    width: 81px;
    height: 138.6px;
    /*border-radius: 20%/5%;*/
    z-index: 90;
}

.hexagon::before {
    background-color: inherit;
    content: "";
    position: absolute;
    left: 0;
    transform: rotate(-60deg);
}

.hexagon::after {
    background-color: inherit;
    content: "";
    position: absolute;
    left: 0;
    transform: rotate(60deg);
}

.hexagon:nth-child(even) {
    /* top approx. 50% of .hexagon height + spacing */
    top: 70.2px;
}

.hexagon:hover {
    background-color: hsla(60, 75%, 75%, 1);
    cursor: pointer;
    opacity: 0.8;
    z-index: 105;
    font-weight: 501;
}

.hexagon:active {
    background-color: hsla(60, 75%, 50%, 1);
    z-index: 110;
}

.hexagontent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140%;
    font-size: 1rem;
    line-height: 1.2;
    z-index: 100;
    color: #000;
    text-shadow: 1px 1px 2px #fff;
}
    
    /* Status Colors */
    .hexagon.status-unknown {
    background-color: #6c757d; /* Gray for unknown */
    }
    
    .hexagon.status-known {
    background-color: #ffc107; /* Yellow for known */
    }
    
    .hexagon.status-explored {
    background-color: #28a745; /* Green for explored */
    }
    
</style>