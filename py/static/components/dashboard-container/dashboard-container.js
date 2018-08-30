angular.module('srirama')
    .component('dashboardContainer', {
        template: require('./dashboard-container.html'),
        controller: ['api', '$q', '$scope', class dashboardContainer {
            constructor(api, $q, $scope) {
                this.api = api;
                this.q = $q;
                this.scope = $scope;

                this.data = [
                    {
                        id: 0,
                        key: 'ts',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'rhscrn',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'rnet',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'alb_ave',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'rnd24',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'd10',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'cld',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'convh_ave',
                        select: { lev: 200 }
                    },
                    {
                        id: 0,
                        key: 'hfls',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'hfss',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'mrros',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'pmsl_ave',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'tsea',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'dustwd_ave',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'dustdd_ave',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'u200',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'u850',
                        select: {}
                    },
                    {
                        id: 0,
                        key: 'sfcwind',
                        select: {}
                    },
                ];

                // Time di ambil dari time browser.
                this.data.forEach((data, i) => {
                    this.data[i].select = { ...data.select, ...{ time: [`${(new Date()).getFullYear()}-01`, `${(new Date()).getFullYear()}-12`] } };
                });
            }

            $onInit() {
                this.getLocation()
                    .then((res) => {
                        this.latlng = res;
                        this.updateDataFromDatasets()
                            .then(() => {
                                this.scope.data = this.data;
                                this.scope.graphs = [];

                                this.getTimeSeries(0)
                                    .then(() => {
                                        this.getTimeSeries(1)
                                            .then(() => {
                                                this.getTimeSeries(2)
                                                    .then(() => {
                                                        this.getTimeSeries(3);
                                                    });
                                            });
                                    });
                            });
                    });
            }

            /**
             * Update this.data menyesuaikan dengan datasets.
             * @returns {Promise}
             */
            updateDataFromDatasets() {
                let q = this.q.defer();
                this.api.getDatasets()
                    .then((res) => {
                        res.forEach(dataset => {
                            this.data.forEach((data, i) => {
                                if (dataset.id === data.id) {
                                    dataset.keys.forEach(key => {
                                        if (key.key === data.key) {
                                            this.data[i] = { ...this.data[i], ...key };
                                        }
                                    });
                                }
                            });
                        });
                        q.resolve(this.data);
                    });
                return q.promise;
            }

            /**
             * Mengambil data time series aktual.
             * @param {Number} i - Index dari this.data.
             * @returns {Promise}
             */
            getTimeSeries(i) {
                return this.api.getDataPointTimeSeries(
                    this.data[i].select,
                    this.latlng,
                    this.data[i].id,
                    this.data[i].key
                )
                    .then((res) => {
                        this.scope.graphs.unshift(res);
                        console.log('dashboardContainer getTimeSeries', res);
                    });
            }

            /**
             * Mengambil data koordinat browser.
             * @returns {Promise}
             */
            getLocation() {
                let q = this.q.defer();
                const defaultLocation = {
                    lat: -6.894,
                    lng: 107.586
                };
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(({ coords }) => {
                        q.resolve({
                            lat: coords.latitude,
                            lng: coords.longitude
                        });
                    }, e => {
                        q.resolve(defaultLocation);
                    });
                } else {
                    q.resolve(defaultLocation);
                }
                return q.promise;
            }
        }]
    });