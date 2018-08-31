angular.module('srirama')
    .component('dashboardMap', {
        template: require('./dashboard-map.html'),
        bindings: {
            latlng: '<'
        },
        controller: [class dashboardMap {
            $onInit() {
                this.map = L.map('dashboard-map').setView([51.505, -0.09], 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(this.map);
            }

            $onChanges(e) {
                if (e.latlng) {
                    if (this.latlng) {
                        this.map.setView(this.latlng);    
                        L.marker(this.latlng).addTo(this.map)
                            .bindPopup('Lokasi anda.')
                            .openPopup();
                    }
                }
            }
        }]
    });