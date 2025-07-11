Vue.component("place", {
  template: "#place-template",
  props: {
    hex: String,
    name: String,
    item: String,
    terrain: String,
    text: String,
    end: Number,
    index: Number,
    status: String
  },
  methods: {
    updateStatus(hex, status) {
      console.log('Status update requested:', hex, status);
      // emit up to parent if needed
      this.$emit('status-updated', { hex, status });
    }
  }
});

var app = new Vue({
  el: "#app",
  data: {
    printable: [],
  },
  methods: {
    filter() {
      let hex = window.location.pathname.split("/hex/")[1];
      fetch(`/api/data/locations/avernus/hex/${hex}`)
        .then(response => response.json())
        .then(data => {
          this.printable.push(data.data);
          document.title = "Hex " + hex.toUpperCase();
        })
        .catch(error => {
          console.error('Error loading locations:', error);
          showError('Failed to load location. Check console for details.');
        });
    },
    renderTerrain(item) {
      switch (item.terrain[0]) {
        case "ash":
          return "ashlands";
        case "bog":
          return "caustic bogs";
        case "brambles":
          return "bone brambles";
        case "cracks":
          return "wasteland, cracked";
        case "fire":
          return "plains of fire";
        case "hills":
          return "hills, avernian";
        case "mountains":
          return "mountains, avernian";
        case "volcano":
          return "volcanic plains";
        case "waste":
          return "wastelands";
        default:
          console.log("Error, unknown terrain");
          return "???";
      }
    },
    handleStatusUpdate(e) {
      fetch(`/api/data/locations/avernus/hex/${e.hex}`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ status: e.status })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          app.showSuccess(`Location ${e.hex.toUpperCase()} updated to ${e.status === 'U' ? 'Unknown' : e.status === 'K' ? 'Known' : 'Explored'}`);
        } else {
          app.showError('Error updating status: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error updating status:', error);
        app.showError('Error updating status: ' + error.message);
      });
    },
    showSuccess(message) {
      const container = document.getElementById('message-container');
      container.innerHTML = `<div class="success">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = '';
      }, 3000);
    },
    showError(message) {
      const container = document.getElementById('message-container');
      container.innerHTML = `<div class="error">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    },
    status(status, ifis){
      return status === ifis;
    }
  },
  beforeMount: function () {
    this.filter();
  },
});
