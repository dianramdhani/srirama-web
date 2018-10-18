angular.module('srirama')
    .component('datasetsContainer', {
        bindings: {
            addTabs: '&'
        },
        controller: ['$scope', 'api', class datasetsContainer {
            constructor($scope, api) {
                this.scope = $scope;
                this.api = api;
                this.datasetKeysFilter = [
                    'ts',
                    'rhscrn',
                    'rnet',
                    'alb_ave',
                    'rnd24',
                    'd10',
                    'cld',
                    'convh_ave',
                    'hfls',
                    'hfss',
                    'mrros',
                    'pmsl_ave',
                    'theta',
                    'tsea',
                    'dustwd_ave',
                    'dustdd_ave',
                    'u200',
                    'u850',
                    'sfcwind'
                ];
            }

            $onInit() {
                this.api.getDatasets()
                    .then((res) => {
                        res[0].keys = res[0].keys.filter(o => this.datasetKeysFilter.includes(o.key));
                        this.scope.datasets = res;
                    });

                this.scope.plot = (id, key) => {
                    this.addTabs({
                        tab: {
                            title: `Plot - ${key.long_name}`,
                            content: `plot.html?process=plot&id=${id}&key=${key.key}`
                        }
                    });
                }

                this.scope.anomali = (id, key) => {
                    this.addTabs({
                        tab: {
                            title: `Anomali - ${key.long_name}`,
                            content: `plot.html?process=anomali&id=${id}&key=${key.key}`
                        }
                    });
                }
            }
        }],
        template: require('./datasets-container.html')
    })