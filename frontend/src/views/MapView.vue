<template>
  <div class="honeycomb" :class="map" :style="{ backgroundImage: `url('../avernus-map.jpg')` }">
    <div v-for="(element, rowIndex) in printable" :key="rowIndex">
      <Row :element="element" @open-modal="openLocationModal" />
      <div :class="invisTerr" style="position: absolute">
        <img
          class="hexImg noselect"
          v-for="terr in element"
          :key="terr.hex"
          :id="terr.hex"
          :src="'/avernus-tiles/' + terr.terrain[0] + '.png'"
        />
      </div>
    </div>

    <!-- Location Modal -->
    <location-modal
      v-if="showLocationModal"
      :region="'avernus'"
      :hex="selectedHex"
      @close-modal="closeLocationModal"
      @location-updated="handleLocationUpdate"
      :editable="true"
    />
  </div>
</template>

<script>
import Row from '../components/Row.vue'

export default {
  name: "MapView",
  components: { Row },
  data() {
    return {
      printable: [],
      showTerrain: false,
      map: "mapClass",
      visTerr: "visTerrain",
      invisTerr: "invisTerrain",
      upLv: "upperLev",
      lowLv: "lowerLev",
      showLocationModal: false,
      selectedHex: null,
      locations: []
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch('/api/data/maps/avernus');
        const data = await response.json();
        this.locations = data;
        this.filterData();
      } catch (error) {
        console.error('Error loading locations:', error);
        this.showError('Failed to load locations. Check console for details.');
      }
    },

    filterData() {
      let prevH = {};
      const rows = Number(this.locations.at(-1).hex.charAt(1));
      this.printable = Array.from({ length: rows }, () => []);

      this.locations.forEach((item, index) => {
        const rowIdx = Number(item.hex.charAt(1)) - 1;
        const colIdx = parseInt(item.hex.charAt(0), 36) - 10; // 'a' = 10

        if (item.hex !== prevH.hex) {
          this.printable[rowIdx].push(item);
        } else {
          this.printable[rowIdx][colIdx].name += "\n" + item.name;
        }

        prevH = item;
      });

      this.showTerrain = true;
    },

    swapMap() {
      this.showTerrain = !this.showTerrain;
    },

    openLocationModal(hex) {
      this.selectedHex = hex;
      this.showLocationModal = true;
    },

    closeLocationModal() {
      this.selectedHex = null;
      this.showLocationModal = false;
    },

    handleLocationUpdate(event) {
      const { hex, data } = event;

      for (let row of this.printable) {
        for (let location of row) {
          if (location.hex === hex) {
            Object.assign(location, data);
            break;
          }
        }
      }

      this.filterData();
    },

    showError(message) {
      console.error(message);
    }
  },
  beforeMount() {
    this.fetchData();
  }
};
</script>

<style scoped>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


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

.hexImg {
  position: relative;
  display: inline-block;
  /* left/right margin approx. 25% of .hexagon width + spacing */
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

.visTerrain {
  position: absolute;
}

.invisTerrain {
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

html {
  font-family: "MedievalSharp", cursive;
}

.u-section-1 {
  background-color: #69171c;
  padding: 20px 0;
  min-height: 100vh;
  background-image: url("../avernus3.png");
  background-blend-mode: multiply;
  background-size: cover;
  background-position: bottom;
}

.u-section-1 .u-sheet-1 {
  min-height: 600px;
  min-width: 1292.4px;
  background-color: #262626;
  border: 1px solid #404040;
  padding: 20px;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 8px ridge #69171c;

  background-image: url("../slab.jpg");
  background-blend-mode: multiply;
  background-size: cover;
  background-position: bottom;
}

.u-section-1 .u-sheet-1::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(
    -50%,
    -50%
  ); /* Center the image horizontally and move it up by half its height */
  width: 100px;
  height: 100px;
  background-image: url("../skull.png");
  background-size: contain; /* Keeps the aspect ratio */
  background-repeat: no-repeat;
}

.u-section-1 .u-text-1 {
  font-size: 3rem;
  color: #f4f4f4;
  margin-bottom: 20px;
  margin-top: 40px;
}

.u-section-1 .u-text-2 {
  font-size: 1.25rem;
  color: #e0e0e0;
  margin: 20px auto;
  height: 40px;
}

.u-section-1 .u-text-3 {
  line-height: 1.6;
  font-size: 1rem;
  color: #ccc;
  width: 800px;
  padding: 0 20px;
}

.u-section-1 .u-btn-1 {
  background-color: #ad5c3d;
  color: #fff;
  border-radius: 5px;
  padding: 10px 20px;
  margin-top: 30px;
  text-transform: none;
}

@media (max-width: 767px) {
  .u-section-1 .u-text-1 {
    font-size: 2rem;
  }

  .u-section-1 .u-text-3 {
    font-size: 0.9rem;
  }
}

@media (max-width: 575px) {
  .u-section-1 .u-sheet-1 {
    min-height: auto;
  }
  .u-section-1 .u-text-1,
  .u-section-1 .u-text-2,
  .u-section-1 .u-text-3 {
    width: auto;
  }
}

h5 {
  font-size: 1.1rem;
  color: #f4f4f4;
  margin: 15px 0;
}

ul {
  margin-top: 10px;
  padding-left: 20px;
  list-style-type: disc;
  color: #e0e0e0;
}



</style>