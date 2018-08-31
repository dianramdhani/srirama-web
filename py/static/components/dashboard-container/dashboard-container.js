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
                        select: {},
                        info: 'ts adalah ...'
                    },
                    {
                        id: 0,
                        key: 'rhscrn',
                        select: {},
                        info: 'rhscrn adalah ...'
                    },
                    {
                        id: 0,
                        key: 'rnet',
                        select: {},
                        info: 'rnet adalah ...'
                    },
                    {
                        id: 0,
                        key: 'alb_ave',
                        select: {},
                        info: 'alb_ave adalah ...'
                    },
                    {
                        id: 0,
                        key: 'rnd24',
                        select: {},
                        info: 'rnd24 adalah ...'
                    },
                    {
                        id: 0,
                        key: 'd10',
                        select: {},
                        info: 'd10 adalah ...'
                    },
                    {
                        id: 0,
                        key: 'cld',
                        select: {},
                        info: 'cld adalah ...'
                    },
                    {
                        id: 0,
                        key: 'convh_ave',
                        select: { lev: 200 },
                        info: 'convh_ave adalah ...'
                    },
                    {
                        id: 0,
                        key: 'hfls',
                        select: {},
                        info: 'hfls adalah ...'
                    },
                    {
                        id: 0,
                        key: 'hfss',
                        select: {},
                        info: 'hfss adalah ...'
                    },
                    {
                        id: 0,
                        key: 'mrros',
                        select: {},
                        info: 'mrros adalah ...'
                    },
                    {
                        id: 0,
                        key: 'pmsl_ave',
                        select: {},
                        info: 'pmsl_ave adalah ...'
                    },
                    {
                        id: 0,
                        key: 'tsea',
                        select: {},
                        info: 'tsea adalah ...'
                    },
                    {
                        id: 0,
                        key: 'dustwd_ave',
                        select: {},
                        info: 'dustwd_ave adalah ...'
                    },
                    {
                        id: 0,
                        key: 'dustdd_ave',
                        select: {},
                        info: 'dustdd_ave adalah ...'
                    },
                    {
                        id: 0,
                        key: 'u200',
                        select: {},
                        info: 'u200 adalah ...'
                    },
                    {
                        id: 0,
                        key: 'u850',
                        select: {},
                        info: 'u850 adalah ...'
                    },
                    {
                        id: 0,
                        key: 'sfcwind',
                        select: {},
                        info: 'sfcwind adalah ...'
                    },
                ];
                this.active = [];

                // Time di ambil dari time browser.
                this.data.forEach((data) => {
                    data.select = { ...data.select, ...{ time: [`${(new Date()).getFullYear()}-01`, `${(new Date()).getFullYear()}-12`] } };
                    data['active'] = false;
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
                                this.scope.info = [];

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
             * Mengambil data time series aktual. Update active button di dataset.
             * @param {Number} i - Index dari this.data.
             * @returns {Promise}
             */
            getTimeSeries(i) {
                this.data[i].active = true;
                this.active.unshift(this.data[i]);
                if (this.active[4]) {
                    angular.forEach(this.data, (data) => {
                        if (data === this.active[4]) {
                            data.active = false;
                        }
                    });
                }

                return this.api.getDataPointTimeSeries(
                    this.data[i].select,
                    this.latlng,
                    this.data[i].id,
                    this.data[i].key
                )
                    .then((res) => {
                        this.scope.graphs.unshift(res);
                        this.setInfo(res, this.data[i].info);
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

            /**
             * Update array info.
             * @param {Object} data - Data time series.
             * @param {String} info - Keterangan singkat data.
             */
            setInfo(data, info) {
                this.scope.info.unshift({ data, info });
            }
        }]
    });