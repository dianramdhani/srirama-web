angular.module('srirama')
    .component('modalPilihDimensi', {
        bindings: {
            modalPilihDimensiShow: '=',
            selectDimension: '&'
        },
        controller: ['$scope', 'api', class modalPilihDimensi {
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
                    this.scope.select = {};

                    angular.forEach(this.scope.dims, ({ key, values }) => {
                        this.scope.select[key] = values[0];
                    });

                    this.scope.style.display = 'block';
                });
            }
        }],
        template: require('./modal-pilih-dimensi.html')
    })