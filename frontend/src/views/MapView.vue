<template>
  <div id="hexcrawl" class="honeycomb" :style="{ backgroundImage: mapId ? `url('../${mapId}-map.jpg')` : '' }" v-if="mapId == 'avernus'">
    <div v-for="(element, rowIndex) in printable" :key="rowIndex">
      <Row :element="element" @open-modal="openLocationModal" />
      <div :class="invisTerr" style="position: absolute">
        <img
          class="hexImg noselect"
          v-for="terr in element"
          :key="terr.id"
          :id="terr.id"
          :src="'/avernus-tiles/' + terr.terrain[0] + '.png'"
        />
      </div>
    </div>

    <!-- Location Modal -->
    <LocationModal
      v-if="showLocationModal"
      :region="mapId"
      :hex="selectedHex"
      @close-modal="closeLocationModal"
      @location-updated="handleLocationUpdate"
      :editable="true"
    />
  </div>
  <div id="nodes" class="honeycomb" :style="{ backgroundImage: mapId ? `url('../${mapId}-map.jpg')` : '' }" v-if="mapId != 'avernus'">
    <!-- Render location markers -->
    <LocationMarker v-for="location in locations" 
                      :key="`node${location.id}`"
                      :x="location.x" 
                      :y="location.y" 
                      :status="location.status"
                      :numId="location.id" 
                      :locName="location.name"
                      @open-modal="$emit('open-modal', $event)">
    </LocationMarker>

    <!-- Render connecting lines -->
    <div v-for="location in locations" :key="location.id">
        <div v-for="connectedId in location.connectedTo" :key="connectedId"
              :style="calculateLineStyle(location, locations.find(loc => loc.id === connectedId), location.id, connectedId)"
              class="line"></div>
    </div>
</div>
</template>

<script>
import Row from '../components/Row.vue'
import LocationModal from '../components/LocationModal.vue'
import LocationMarker from '../components/LocationMarker.vue';

export default {
  name: "MapView",
  components: { Row, LocationModal, LocationMarker },
  data() {
    return {
      mapId: "",
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
        const response = await fetch(`/api/data/maps/${this.mapId}`);
        const data = await response.json();
        this.locations = data;
        if (this.mapId == 'avernus')
          this.filterData();
      } catch (error) {
        console.error('Error loading locations:', error);
        this.showError('Failed to load locations. Check console for details.');
      }
    },

    filterData() {
      let prevH = {};
      const rows = Number(this.locations.at(-1).id.charAt(1));
      this.printable = Array.from({ length: rows }, () => []);

      this.locations.forEach((item, index) => {
        const rowIdx = Number(item.id.charAt(1)) - 1;
        const colIdx = parseInt(item.id.charAt(0), 36) - 10; // 'a' = 10

        if (item.id !== prevH.id) {
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
          if (location.id === hex) {
            Object.assign(location, data);
            break;
          }
        }
      }

      // this.filterData();
    },

    showError(message) {
      console.error(message);
    },
    
    calculateLineStyle(location1, location2, numId, numId2) {
      if (!location2 || numId > numId2) {
        // If no matching location is found, return an empty style object or handle the error as needed
        return {};
      }

      const x1 = location1.x;
      const y1 = location1.y;
      const x2 = location2.x;
      const y2 = location2.y;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

      return {
        position: "absolute",
        top: y1 + "px",
        left: x1 + "px",
        width: length + "px",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 0",
        height: "4px",
        border: "1px solid black",
        backgroundColor: "white",
        zIndex: 20,
      };
    },
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        this.mapId = newId;
        // Re-fetch data if needed
        this.fetchData();
      },
      immediate: true, // Run the handler immediately when the component is created
    },
  },
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
</style>