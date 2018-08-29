angular.module('srirama')
    .service('api', ['$http', '$q', class api {
        constructor($http, $q) {
            this.http = $http;
            this.q = $q;
            this.urlServer = 'http://localhost:4343';
        }

        /**
         * Mengambil seluruh datasets yang telah diinisialisasi di server.
         * @returns {Object}
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
         * @param {Object} select - Query data yang dicari dengan atribut waktu dan dimensi lainnya jika ada (contoh level).
         * @param {Object} latlng - Titik yang mau di ambil dengan atribut lat dan lng.
         * @param {Number} id - Id dari dataset. Jika tidak diisi akan mengambil id dari parameter di URL.
         * @param {String} key - Kunci variabel yang datanya mau di ambil. Jika tidak diisi akan mengambil kunci dari parameter di URL.
         * @returns {Object}
         */
        getDataPointTimeSeries(select, latlng, id = null, key = null) {
            if (id !== null && key !== null) {
                this.id = id;
                this.key = key;
            }

            var q = this.q.defer();
            this.http({
                'url': `${this.urlServer}/api/getdatapointtimeseries`,
                'method': 'GET',
                'params': {
                    'id': this.id,
                    'key': this.key,
                    'select': JSON.stringify(select),
                    'lat': latlng.lat,
                    'lon': latlng.lng
                }
            })
                .then((res) => {
                    res = res.data;
                    q.resolve(res);
                });
            return q.promise;
        }
    }]);