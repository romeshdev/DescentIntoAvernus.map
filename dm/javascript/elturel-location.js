Vue.component("place", {
  template: "#place-template",
  props: {
    node: Object,
  },
});

var app = new Vue({
  el: "#app",
  data: {
    locationData: {}
  },
  methods: {
    loadData() {
      let nodeId = window.location.pathname.split("/hex/")[1];
      fetch(`/api/data/locations/elturel/hex/${nodeId}`)
      .then(response => response.json())
      .then(data => {
        this.locationData = data.data;
        document.title = "Location " + nodeId;
      })
      .catch(error => {
        console.error('Error loading locations:', error);
        showError('Failed to load location. Check console for details.');
      });
    },
  },
  beforeMount: function () {
    this.loadData();
  },
});
