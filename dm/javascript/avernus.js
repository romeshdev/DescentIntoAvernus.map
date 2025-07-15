var app = new Vue({
  el: "#app",
  data: {
    printable: [],
    showTerrain: false,
    map: "mapClass",
    visTerr: "visTerrain",
    invisTerr: "invisTerrain",
    upLv: "upperLev",
    lowLv: "lowerLev",
    showLocationModal: false,
    selectedHex: null,
  },
  methods: {
    //Saves the readable content of the locations array (from JSON) to the less-intuitive printable array
    //requested by the hexagon grid format
    fetchData() {
      fetch('/api/data/locations/avernus')
        .then(response => response.json())
        .then(data => {
          locations = data;
          this.filterData();
        })
        .catch(error => {
          console.error('Error loading locations:', error);
          this.showError('Failed to load locations. Check console for details.');
        });
    },
    
    //Swaps the DiA poster map with the hexagon tiles terrain map made by The Alexandrian and vice versa
    swapMap() {
      if (this.showTerrain) this.showTerrain = false;
      else this.showTerrain = true;
    },

    filterData() {
        let vm = this;
        let prevH = Object();
        let rows = Number(locations.at(-1).hex.charAt(1));

        for (i = 0; i < rows; i++) vm.printable[i] = [];

        locations.forEach((item, index) => {
          if (item.hex !== prevH.hex) {
            vm.printable[Number(item.hex.charAt(1)) - 1].push(item);
          } else {
            vm.printable[
              Number(item.hex.charAt(1)) - 1 //2 in 'b2' -1 cause array start at 0
            ][
              parseInt(item.hex.charAt(0), 36) - 9 - 1 //a = 0, b = 1, c = 2
            ].name += "\n" + locations.at(index).name;
          }
          prevH = item;
        });
        this.showTerrain = true;
    },
    
    openLocationModal(hex) {
      this.selectedHex = hex;
      this.showLocationModal = true;
    },
    
    closeLocationModal() {
      this.showLocationModal = false;
      this.selectedHex = null;
    },
    
    handleLocationUpdate(event) {
      // Update the local data in the printable array
      const { hex, data } = event;
      
      // Find the location in printable array and update it
      for (let row of this.printable) {
        for (let location of row) {
          if (location.hex === hex) {
            for (let prop in data) {
              location[prop] = data[prop];
            }
            break;
          }
        }
      }
      this.filterData();
    },
    
    showError(message) {
      // You can implement a global error display here if needed
      console.error(message);
    }
  },
  beforeMount: function () {
    this.fetchData();
  },
});