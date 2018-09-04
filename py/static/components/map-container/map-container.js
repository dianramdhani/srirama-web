angular.module('srirama')
    .component('mapContainer', {
        controller: ['$scope', '$filter', '$timeout', 'api', class mapContainer {
            constructor($scope, $filter, $timeout, api) {
                this.scope = $scope;
                this.filter = $filter;
                this.api = api;
                this.timeout = $timeout;
            }

            $onInit() {
                this.footers = [
                    {
                        componentName: 'footer-graphs',
                        title: 'Grafik',
                        show: false
                    },
                    {
                        componentName: 'footer-min-max-tables',
                        title: 'Tabel Min dan Max',
                        show: false
                    }
                ];
                this.footerShow = (componentName) => {
                    angular.forEach(this.footers, (footer) => {
                        if (footer.componentName === componentName) {
                            footer.show = true;
                        } else {
                            footer.show = false;
                        }
                    });
                };

                this.map = {
                    map: L.map('map', { attributionControl: false }).setView([0, 115], 4),
                    bounds: L.latLngBounds([0, 0], [0, 0]),
                };
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map['map']);
                this.map['imageOverlay'] = L.imageOverlay('', this.map.bounds, { opacity: 0.5 });
                this.map.imageOverlay.addTo(this.map.map);
            }

            selectDimension(selected) {
                this.api.getLayerHeader(selected).then((res) => {
                    this.map.map.closePopup();
                    this.map.imageOverlay.setUrl('');
                    this.map.bounds = L.latLngBounds(res.bounds);
                    this.map.imageOverlay.setBounds(this.map.bounds);
                    this.map.imageOverlay.setUrl(`${this.api.urlServer}/api/getlayer?id=${this.api.id}&key=${this.api.key}&select=${JSON.stringify(selected)}`);

                    this.legend = {
                        legendText: res.legends,
                        unit: res.units
                    };
                    this.scope.title = res.long_name;
                });

                // dimensi yang dipilih
                this.dimSelected = selected;
            }

            selectLocation(latlng) {
                this.timeout(() => {
                    this.map.map.fireEvent('click', { latlng });
                });
            }

            spatialCrop(bounds = null) {
                if (this.dimSelected) {
                    if (bounds === null) {
                        bounds = {
                            lat: [this.map.map.getBounds()._southWest.lat, this.map.map.getBounds()._northEast.lat],
                            lng: [this.map.map.getBounds()._southWest.lng, this.map.map.getBounds()._northEast.lng]
                        };
                    }
                    this.api.getLayerHeaderCropped(this.dimSelected, bounds).then((res) => {
                        this.map.map.closePopup();
                        this.map.imageOverlay.setUrl('');
                        this.map.bounds = L.latLngBounds(res.bounds);
                        this.map.imageOverlay.setBounds(this.map.bounds);
                        this.map.imageOverlay.setUrl(`${this.api.urlServer}/api/getlayercropped?id=${this.api.id}&key=${this.api.key}&select=${JSON.stringify(this.dimSelected)}&bounds=${JSON.stringify(bounds)}`);

                        this.legend = {
                            legendText: res.legends,
                            unit: res.units
                        };
                    });
                }
            }

            restoreSpatialCropped() {
                if (this.dimSelected) {
                    this.selectDimension(this.dimSelected);
                }
            }
        }],
        template: require('./map-container.html')
    })