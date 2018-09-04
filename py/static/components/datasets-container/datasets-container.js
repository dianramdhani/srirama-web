angular.module('srirama')
    .component('datasetsContainer', {
        bindings: {
            addTabs: '&'
        },
        controller: ['$scope', 'api', class datasetsContainer {
            constructor($scope, api) {
                this.scope = $scope;
                this.api = api;
            }

            $onInit() {
                this.api.getDatasets()
                    .then((res) => {
                        this.scope.datasets = res;
                    });

                this.scope.plot = (id, key) => {
                    this.addTabs({
                        tab: {
                            title: key.long_name,
                            content: `plot.html?id=${id}&key=${key.key}`
                        }
                    });
                }
            }
        }],
        template: require('./datasets-container.html')
    })