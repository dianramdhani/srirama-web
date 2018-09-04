angular.module('srirama')
    .component('mapMarkers', {
        bindings: {
            map: '=',
            dimSelected: '=',
            footers: '=',
            lastPointMarker: '<',
            dimSelectedToTemplatePopup: '&'
        },
        controller: ['$scope', '$compile', '$q', 'api', class mapMarkers {
            constructor($scope, $compile, $q, api) {
                this.scope = $scope;
                this.compile = $compile;
                this.api = api;
                this.q = $q;
            }

            $onInit() {
                this.markers = [];
            }

            $onChanges(e) {
                if (e.lastPointMarker) {
                    if (e.lastPointMarker.currentValue) {
                        this.addMarker();
                    }
                }
            }

            addMarker() {
                let id = this.markers.length;
                this.dataPointToTemplateMarkerPopup(this.lastPointMarker, this.lastIdMarker)
                    .then(({ dataPoint, templateMarkerPopup }) => {
                        var marker = new L.marker(this.lastPointMarker).bindPopup(templateMarkerPopup).addTo(this.map.map).openPopup();
                        this.markers.push({ id, marker, dataPoint });

                        marker.on('click', () => {
                            this.updateMarker(id);
                        });

                        this.lastPointMarkerAndId = { latlng: this.lastPointMarker, id };
                    });
            }

            updateMarker(id) {
                this.map.map.closePopup();
                angular.forEach(this.markers, (marker) => {
                    if (marker.id === id) {
                        this.dataPointToTemplateMarkerPopup(marker.marker._latlng, marker.id)
                            .then(({ dataPoint, templateMarkerPopup }) => {
                                marker.dataPoint = dataPoint;
                                marker.marker.bindPopup(templateMarkerPopup).openPopup();
                            });
                    }
                });
            }

            dataPointToTemplateMarkerPopup(latlng, id) {
                var q = this.q.defer();

                this.api.getDataPoint(this.dimSelected, latlng)
                    .then((res) => {
                        let dataPoint = res,
                            popupTemplate = `
                        <div>
                            <h5>${dataPoint.attrs.long_name}</h5>
                            <p>
                                Latitude: ${latlng.lat}
                                <br>
                                Longitude: ${latlng.lng}
                                <br>
                                ${this.dimSelectedToTemplatePopup()}
                                <b>Data: ${dataPoint.data} ${dataPoint.attrs.units}</b>
                            </p>
                            <button class="w3-button w3-block w3-round w3-border" ng-click="$ctrl.idGraphWillOpen=${id}">Lihat grafik yang telah dibuka</button>
                        </div>
                        `;

                        q.resolve({
                            dataPoint,
                            templateMarkerPopup: this.compile(popupTemplate)(this.scope)[0]
                        });
                    });

                return q.promise;
            }

            removeMarker(id) {
                angular.forEach(this.markers, (marker) => {
                    if (marker.id === id) {
                        this.map.map.removeLayer(marker.marker);
                    }
                });
            }
        }],
        template: '<footer-graphs footers="$ctrl.footers" last-point-marker-and-id="$ctrl.lastPointMarkerAndId" id-graph-will-open="$ctrl.idGraphWillOpen" update-marker="$ctrl.updateMarker(id)" remove-marker="$ctrl.removeMarker(id)"></footer-graphs>'
    })  