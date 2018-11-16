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
                        info: 'Surface Temperature adalah suhu pada permukaan bumi tanpa memperhitungkan perbedaan tekanan antar permukaan.'
                    },
                    {
                        id: 0,
                        key: 'rhscrn',
                        select: {},
                        info: 'Screen relative humidity adalah kelembaban relatif untuk permukaan bumi.'
                    },
                    {
                        id: 0,
                        key: 'rnet',
                        select: {},
                        info: 'Net radiation adalah radiasi yang diserap bumi.'
                    },
                    {
                        id: 0,
                        key: 'alb_ave',
                        select: {},
                        info: 'Avg albedo adalah rata-rata pantulan permukaan.'
                    },
                    {
                        id: 0,
                        key: 'rnd24',
                        select: {},
                        info: '24hr precipitation adalah akumulasi curah hujan selama 24 jam terakhir.'
                    },
                    {
                        id: 0,
                        key: 'd10',
                        select: {},
                        info: '10m wind direction adalah arah angin pada ketinggian 10m.'
                    },
                    {
                        id: 0,
                        key: 'cld',
                        select: {},
                        info: 'Total cloud ave adalah rata-rata total fraksi awan.'
                    },
                    {
                        id: 0,
                        key: 'convh_ave',
                        select: { lev: 200 },
                        info: 'Covective heating adalah panas yang menyebabkan konveksi per hari.'
                    },
                    {
                        id: 0,
                        key: 'hfls',
                        select: {},
                        info: 'Avg latent heat flux adalah rata-rata flux panas laten.'
                    },
                    {
                        id: 0,
                        key: 'hfss',
                        select: {},
                        info: 'Avg sensible heat flux adalah rata-rata flux panas sensible.'
                    },
                    {
                        id: 0,
                        key: 'mrros',
                        select: {},
                        info: 'Runoff adalah aliran air permukaan yang dihasilkan oleh hujan yang tidak terserap oleh tanah.'
                    },
                    {
                        id: 0,
                        key: 'pmsl_ave',
                        select: {},
                        info: 'Avg mean sea level pressure adalah tekanan rata-rata permukaan laut.'
                    },
                    {
                        id: 0,
                        key: 'tsea',
                        select: {},
                        info: 'Sea surface temperature adalah suhu permukaan laut.'
                    },
                    {
                        id: 0,
                        key: 'dustwd_ave',
                        select: {},
                        info: 'Dust wet deposition adalah endapan debu basah.'
                    },
                    {
                        id: 0,
                        key: 'dustdd_ave',
                        select: {},
                        info: 'Dust dry deposition adalah endapan debu kering.'
                    },
                    {
                        id: 0,
                        key: 'u200',
                        select: {},
                        info: 'Zonal wind at 200hPa adalah pergerakan vektor angin zonal (timur ke barat atau barat ke timur) 200hPa.'
                    },
                    {
                        id: 0,
                        key: 'u850',
                        select: {},
                        info: 'Zonal wind at 850hPa adalah pergerakan vektor angin zonal (timur ke barat atau barat ke timur) 850hPa.'
                    },
                    {
                        id: 0,
                        key: 'sfcwind',
                        select: {},
                        info: '10m wind speed adalah pergerakan angin pada permukaan bumi.'
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