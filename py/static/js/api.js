angular.module('srirama')
    .service('api', ['$http', '$q', class api {
        constructor($http, $q) {
            this.http = $http;
            this.q = $q;
            this.urlServer = '';
            this.projections = [
                '1980',
                '1990',
                '2000',
                '2005',
                '2020s',
                '2030s',
                '2040s',
                '2050s',
                '2060s'
            ];
        }

        /**
         * Mengambil seluruh datasets yang telah diinisialisasi di server.
         * Digunakan di:
         * dashboard-container
         * @returns {Promise}
         */
        getDatasets() {
            var q = this.q.defer();
            this.http.get(`${this.urlServer}/api/getdatasets`)
                .then((res) => {
                    res = res.data;
                    q.resolve(res);
                });
            return q.promise;
        }

        /**
         * Mengambil data time series aktual.
         * Digunakan di:
         * dashboard-container
         * @param {Object} select - Query data yang dicari dengan atribut waktu dan dimensi lainnya jika ada (contoh level).
         * @param {Object} latlng - Titik yang mau di ambil dengan atribut lat dan lng.
         * @param {Number} id - Id dari dataset. Jika tidak diisi akan mengambil id dari parameter di URL.
         * @param {String} key - Kunci variabel yang datanya mau di ambil. Jika tidak diisi akan mengambil kunci dari parameter di URL.
         * @returns {Promise}
         */
        getDataPointTimeSeries(select, latlng, id = null, key = null) {
            if (id !== null && key !== null) {
                this.id = id;
                this.key = key;
            }

            if (!this.process) {
                this.process = 'plot';
            }

            if (this.process === 'plot') {
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getdatapointtimeseries`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select),
                        latlng: JSON.stringify(latlng)
                    }
                })
                    .then((res) => {
                        res = res.data;
                        q.resolve(res);
                    });
                return q.promise;
            }

            if (this.process === 'anomali') {
                console.log(select);
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getdatapointtimeseriesanomali`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select.select),
                        latlng: JSON.stringify(latlng),
                        projection: select.projection
                    }
                })
                    .then((res) => {
                        res = res.data;
                        q.resolve(res);
                    });
                return q.promise;
            }
        }


        /**
         * Mengambil seluruh dimensi selain latitude dan longitude.
         * Digunakan di:
         * grafik-container
         * @returns {Promise}
         */
        getDimsWoLatLon() {
            const url = new URL(window.location.href);
            this.id = url.searchParams.get('id');
            this.key = url.searchParams.get('key');
            this.process = url.searchParams.get('process');

            var q = this.q.defer();
            this.http({
                url: `${this.urlServer}/api/getdimswolatlon`,
                method: 'GET',
                params: {
                    id: this.id,
                    key: this.key
                }
            })
                .then((res) => {
                    res = res.data;
                    q.resolve(res);
                });
            return q.promise;
        }

        /**
         * Mengambil header data spasial berupa bounding, legend, long_name, dan units.
         * Digunakan di:
         * map-container
         * @param {Object} select - Query data yang dicari dengan atribut waktu dan dimensi lainnya jika ada (contoh level).
         * @returns {Promise}
         */
        getLayerHeader(select) {
            if (this.process === 'plot') {
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getlayerheader`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select)
                    }
                })
                    .then((res) => {
                        res = res.data;
                        this.layerHeader = res;
                        q.resolve(res);
                    });
                return q.promise;
            }
            if (this.process === 'anomali') {
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getlayerheaderanomali`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select.select),
                        projection: select.projection
                    }
                })
                    .then((res) => {
                        res = res.data;
                        this.layerHeader = res;
                        q.resolve(res);
                    });
                return q.promise;
            }
        }

        /**
         * Mengambil data titik.
         * Digunakan di:
         * map-container
         * @param {Object} select - Query data yang dicari dengan atribut waktu dan dimensi lainnya jika ada (contoh level).
         * @param {Object} latlng - Titik yang mau di ambil dengan atribut lat dan lng.
         * @returns {Promise}
         */
        getDataPoint(select, latlng) {
            if (this.process === 'plot') {
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getdatapoint`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select),
                        latlng: JSON.stringify(latlng)
                    }
                })
                    .then((res) => {
                        res = res.data;
                        res.attrs.units = res.attrs.units === 'none' ? ' ' : res.attrs.units;
                        q.resolve(res);
                    });
                return q.promise;
            }
            if (this.process === 'anomali') {
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getdatapointanomali`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select.select),
                        latlng: JSON.stringify(latlng),
                        projection: select.projection
                    }
                })
                    .then((res) => {
                        res = res.data;
                        res.attrs.units = res.attrs.units === 'none' ? ' ' : res.attrs.units;
                        q.resolve(res);
                    });
                return q.promise;
            }
        }

        /**
         * Mengambil header data spasial yang telah di potong berupa bounding, legend, long_name, dan units. 
         * Digunakan di:
         * map-container
         * @param {Object} select - Query data yang dicari dengan atribut waktu dan dimensi lainnya jika ada (contoh level).
         * @param {Object} bounds - Bounding data yang mau di ambil.
         * @returns {Promise}
         */
        getLayerHeaderCropped(select, bounds) {
            if (this.process === 'plot') {
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getlayerheadercropped`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select),
                        bounds: JSON.stringify(bounds),
                    }
                })
                    .then((res) => {
                        res = res.data;
                        this.layerHeader = res;
                        q.resolve(res);
                    })
                return q.promise;
            }
            if (this.process === 'anomali') {
                console.log('getLayerHeaderCropped anomali', select)
                var q = this.q.defer();
                this.http({
                    url: `${this.urlServer}/api/getlayerheadercroppedanomali`,
                    method: 'GET',
                    params: {
                        id: this.id,
                        key: this.key,
                        select: JSON.stringify(select.select),
                        bounds: JSON.stringify(bounds),
                        projection: select.projection
                    }
                })
                    .then((res) => {
                        res = res.data;
                        this.layerHeader = res;
                        q.resolve(res);
                    })
                return q.promise;
            }
        }

        /**
         * Mengambil data time series min atau max.
         * Digunakan di:
         * footer-min-max-tables
         * @param {Object} select - Query data yang dicari dengan atribut waktu dan dimensi lainnya jika ada (contoh level).
         * @returns {Promise}
         */
        getDataPointMinOrMax(select) {
            let q = this.q.defer(),
                _select = Object.assign({}, select);
            delete _select.minOrMax;

            this.http({
                url: `${this.urlServer}/api/getdatapointminormax`,
                method: 'GET',
                params: {
                    id: this.id,
                    key: this.key,
                    minormax: select.minOrMax,
                    select: JSON.stringify(_select)
                }
            })
                .then((res) => {
                    res = res.data;
                    q.resolve(res);
                })
                .catch((res) => {
                    q.reject(res);
                });
            return q.promise;
        }
    }]);