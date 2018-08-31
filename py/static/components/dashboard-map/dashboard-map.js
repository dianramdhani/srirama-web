angular.module('srirama')
    .component('dashboardMap', {
        template: require('./dashboard-map.html'),
        bindings: {
            latlng: '<'
        },
        controller: [class dashboardMap {
            $onInit() {
                this.latlng = {
                    lat: -6.894,
                    lng: 107.586
                };
                this.map = L.map('dashboard-map', { attributionControl: false, dragging: false, tap: false }).setView(this.latlng, 13);
                this.map.on('zoomend', () => {
                    this.map.setView(this.latlng);
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
            }

            $onChanges(e) {
                if (e.latlng) {
                    if (this.latlng) {
                        this.map.setView(this.latlng);
                        L.marker(this.latlng).addTo(this.map);
                    }
                }
            }
        }]
    });