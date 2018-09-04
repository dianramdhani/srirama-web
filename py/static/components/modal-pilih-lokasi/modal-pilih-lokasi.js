angular.module('srirama')
    .component('modalPilihLokasi', {
        bindings: {
            modalPilihLokasiShow: '=',
            selectLocation: '&'
        },
        controller: ['$scope', '$timeout', class modalPilihLokasi {
            constructor($scope, $timeout) {
                this.scope = $scope;
                this.timeout = $timeout;
            }

            $onInit() {
                this.scope.style = {
                    zIndex: 99999999
                };

                this.timeout(() => {
                    let autocomplete = new google.maps.places.Autocomplete(document.getElementById('search-location'));
                    autocomplete.addListener('place_changed', () => {
                        let lat = autocomplete.getPlace().geometry.location.lat(),
                            lng = autocomplete.getPlace().geometry.location.lng();
                        this.selectLocation({ latlng: { lat, lng } });

                        this.modalPilihLokasiShow = false;
                        document.getElementById('search-location').value = '';
                    });
                });
            }
        }],
        template: require('./modal-pilih-lokasi.html')
    })