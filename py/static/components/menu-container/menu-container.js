angular.module('srirama')
    .component('menuContainer', {
        bindings: {
            selectDimension: '&',
            footerShow: '&',
            selectLocation: '&',
            modalCariNilaiMinMaxShow: '=',
            modalPotongDataShow: '='
        },
        controller: ['$scope', 'api', class menuContainer {
            constructor($scope, api) {
                this.scope = $scope;
                this.api = api;
            }

            $onInit() {
                this.api.getDimsWoLatLon()
                    .then(() => {
                        this.scope.process = this.api.process;
                    });
            }
        }],
        template: require('./menu-container.html')
    })