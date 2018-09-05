angular.module('srirama')
    .component('footerMinMaxTables', {
        bindings: {
            map: '=',
            footers: '=',
            modalCariNilaiMinMaxShow: '=',
            selectDimension: '&',
            selectLocation: '&'
        },
        controller: ['$scope', '$timeout', 'api', class footerMinMaxTables {
            constructor($scope, $timeout, api) {
                this.scope = $scope;
                this.timeout = $timeout;
                this.api = api;
            }

            $onInit() {
                this.scope.footerMinMaxTablesStyle = {
                    height: '400px',
                    zIndex: 9999999
                };

                this.tables = [];
                this.scope.countTab = 0;

                this.timeout(() => {
                    this.chromeTabs = new ChromeTabs();
                    const el = document.getElementById('tabs-min-max-tables');
                    this.chromeTabs.init(el, {
                        tabOverlapDistance: 14,
                        minWidth: 45,
                        maxWidth: 243
                    });

                    // remove tab default
                    this.chromeTabs.removeTab(el.querySelector('.chrome-tab-current'));

                    el.addEventListener('activeTabChange', ({ detail }) => {
                        let id = Number(detail.tabEl.id.replace('tab-min-max-table-', ''));
                        this.scope.idTabActiveNow = id;
                        this.scope.$apply();
                    });

                    el.addEventListener('tabRemove', ({ detail }) => {
                        this.scope.countTab--;
                        this.scope.$apply();
                    });
                });

                this.scope.plot = (id, i) => {
                    angular.forEach(this.tables, (table) => {
                        if (table.id === id) {
                            let _table = angular.copy(table);
                            _table.dims.splice(-2, 2);  // remove lat, lng

                            let selected = {}
                            _table.dims.forEach((dim) => {
                                selected[dim] = _table.data[i][dim];
                            });
                            this.selectDimension({ selected });

                            _table = angular.copy(table);
                            let latlng = {
                                lat: _table.data[i][_table.dims[_table.dims.length - 1]],
                                lng: _table.data[i][_table.dims[_table.dims.length - 2]]
                            };
                            this.selectLocation({ latlng });
                        }
                    });
                }
            }

            selectMinMax(selected) {
                this.showContainer();
                this.addTab(selected);
            }

            showContainer() {
                angular.forEach(this.footers, (footer) => {
                    if (footer.componentName === 'footer-min-max-tables') {
                        footer.show = true;
                    } else {
                        footer.show = false;
                    }
                });
            }

            addTab(selected) {
                this.addTables(selected);

                let title = ''
                for (const key in selected) {
                    if (key === 'minOrMax') {
                        title = `${selected.minOrMax === 'min' ? 'Min ' : 'Max '}`;
                        continue;
                    }

                    if (selected[key].length) {
                        title = title + `${key.toUpperCase()}: ${selected[key][0]}-${selected[key][1]}`;
                        continue;
                    } else {
                        title = title + `; ${key.toUpperCase()}: ${selected[key]}`;
                    }
                }
                this.timeout(() => {
                    this.chromeTabs.addTab({
                        title,
                        id: `tab-min-max-table-${this.tables.length - 1}`
                    });
                });

                this.scope.countTab++;
            }

            addTables(selected) {
                let id = this.tables.length,
                    dimStr = '';
                for (const key in selected) {
                    if (key === 'minOrMax') {
                        continue;
                    }

                    if (selected[key].length) {
                        dimStr = dimStr + `${key.toUpperCase()}: ${selected[key][0]} s/d ${selected[key][1]}`;
                        continue;
                    } else {
                        dimStr = dimStr + `, ${key.toUpperCase()}: ${selected[key]}`;
                    }
                }
                this.tables.push({ id, selected, dimStr });

                this.modalLoadingShow = true;
                this.api.getDataPointMinOrMax(selected)
                    .then((res) => {
                        this.modalLoadingShow = false;

                        angular.forEach(this.tables, (table) => {
                            if (table.id === id) {
                                table['dims'] = res.dims;
                                table['data'] = res.data;
                            }
                        });
                    })
                    .catch(() => {
                        this.modalLoadingShow = false;
                    });
            }
        }],
        template: require('./footer-min-max-tables.html')
    })