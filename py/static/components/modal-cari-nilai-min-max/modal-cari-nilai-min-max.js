angular.module('srirama')
    .component('modalCariNilaiMinMax', {
        bindings: {
            modalCariNilaiMinMaxShow: '=',
            selectMinMax: "&"
        },
        controller: ['$scope', 'api', class modalCariNilaiMinMax {
            constructor($scope, api) {
                this.scope = $scope;
                this.api = api;
            }

            $onInit() {
                this.scope.style = {
                    display: 'none',
                    zIndex: 99999999
                };

                this.api.getDimsWoLatLon().then((res) => {
                    this.scope.dims = res;
                    this.scope.selectMin = { minOrMax: 'min' };
                    this.scope.selectMax = { minOrMax: 'max' };

                    angular.forEach(this.scope.dims, ({ key, values }, i) => {
                        if (i === 0) {
                            this.scope.selectMin[key] = [values[0], values[0]];
                            this.scope.selectMax[key] = [values[0], values[0]];
                        } else {
                            this.scope.selectMin[key] = values[0];
                            this.scope.selectMax[key] = values[0];
                        }
                    });

                    this.scope.style.display = 'block';
                });
            }
        }],
        template: require('./modal-cari-nilai-min-max.html')
    })