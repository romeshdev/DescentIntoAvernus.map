let hexagonComponent = {
  template: "#hexagon-template",
  props: {
    name: String,
    hex: String,
  },
  computed: {
    urlMaker() {
      return "/dm/locations/avernus/hex/" + this.hex;
    },
  },
};

let rowComponent = {
  template: "#row-template",
  props: {
    printable: Array,
    element: Array,
    hex: String,
  },
  components: {
    hexagon: hexagonComponent,
  },
};

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
  },
  components: {
    row: rowComponent,
  },
  methods: {
    //Saves the readable content of the locations array (from JSON) to the less-intuitive printable array
    //requested by the hexagon grid format
    fetchData() {
      fetch('/api/data/locations/avernus')
        .then(response => response.json())
        .then(data => {
          locations = data;
          
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
        })
        .catch(error => {
          console.error('Error loading locations:', error);
          showError('Failed to load locations. Check console for details.');
        });
    },
    //Swaps the DiA poster map with the hexagon tiles terrain map made by The Alexandrian and vice versa
    swapMap() {
      if (this.showTerrain) this.showTerrain = false;
      else this.showTerrain = true;
    },
    todos() {
      //Remove on release, just useful for debug
      let i = 0;

      this.printable.forEach((element) => {
        element.forEach((item) => {
          if (item.text.includes("TODO")) {
            console.log(item.hex + " - " + item.name);
            i++;
          }
        });
      });

      return i;
    },
  },
  beforeMount: function () {
    this.fetchData();
  },
});
