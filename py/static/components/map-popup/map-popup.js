angular.module('srirama')
    .component('mapPopup', {
        bindings: {
            map: '=',
            dimSelected: '=',
            footers: '='
        },
        controller: ['$scope', '$compile', 'api', class mapPopup {
            constructor($scope, $compile, api) {
                this.scope = $scope;
                this.compile = $compile;
                this.api = api;
            }

            $onInit() {
                this.map.map.on('click', ({ latlng }) => {
                    const dataPointToTemplatePopup = (latlng, dataPoint) => {
                        let popupTemplate = `
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
                            <button class="w3-button w3-block w3-round w3-border" ng-click='$ctrl.lastPointMarker = ${angular.toJson(latlng)}'>Lihat grafik lokasi ini</button>
                        </div>
                        `;
                        return this.compile(popupTemplate)(this.scope)[0];
                    };

                    if (this.map.bounds.contains(latlng)) {
                        this.api.getDataPoint(this.dimSelected, latlng)
                            .then((res) => {
                                let popup = L.popup()
                                    .setLatLng(latlng)
                                    .setContent(dataPointToTemplatePopup(latlng, res))
                                    .openOn(this.map.map);
                            });
                    }
                });
            }

            dimSelectedToTemplatePopup() {
                let selectedTemplate = '';
                for (const propertyName in this.dimSelected) {
                    selectedTemplate = selectedTemplate + `${(string => string.charAt(0).toUpperCase() + string.slice(1))(propertyName)}: ${this.dimSelected[propertyName]}`;
                    selectedTemplate = selectedTemplate + `<br>`;
                }
                return selectedTemplate;
            }
        }],
        template: '<map-markers map="$ctrl.map" dim-selected="$ctrl.dimSelected" footers="$ctrl.footers" last-point-marker="$ctrl.lastPointMarker" dim-selected-to-template-popup="$ctrl.dimSelectedToTemplatePopup()"></map-markers>'
    })