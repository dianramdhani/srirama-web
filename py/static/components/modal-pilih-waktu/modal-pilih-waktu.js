angular.module('srirama')
    .component('modalPilihWaktu', {
        bindings: {
            modalPilihWaktuShow: '=',
            selectTime: '&'
        },
        controller: ['$scope', 'api', class modalPilihWaktu {
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

                    angular.forEach(this.scope.dims, ({ key, values }, i) => {
                        if (i === 0) {
                            this.scope.select[key] = [values[0], values[0]];
                        } else {
                            this.scope.select[key] = values[0];
                        }
                    });

                    this.scope.dimTime = res[0];
                    this.scope.time1 = this.scope.dimTime.values[0];
                    this.scope.time2 = this.scope.dimTime.values[0];

                    this.scope.style.display = 'block';
                });
            }
        }],
        template: require('./modal-pilih-waktu.html')
    })