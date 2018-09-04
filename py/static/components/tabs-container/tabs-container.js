angular.module('srirama')
    .component('tabsContainer', {
        controller: ['$scope', class tabsContainer {
            constructor($scope) {
                this.scope = $scope;

                // variable view
                this.scope.datasetContentShow = true;
                this.scope.tabs = [];

                this.countId = -1;
                this.chromeTabs = new ChromeTabs();

                const el = document.querySelector('.chrome-tabs');
                this.chromeTabs.init(el, {
                    tabOverlapDistance: 14,
                    minWidth: 45,
                    maxWidth: 243
                });

                el.addEventListener('activeTabChange', (e) => {
                    // mekanisme hide dataset
                    if (!e.detail.tabEl.id)
                        this.scope.datasetContentShow = true;
                    else
                        this.scope.datasetContentShow = false;

                    // mekanisme tampil tab
                    if (e.detail.tabEl.id) {
                        var idTabNowShow = Number(e.detail.tabEl.id);
                        // console.log('ada yang mau di show', idTabNowShow);

                        // jika idTabLastShow gak null
                        // berarti sebelumnya ada yang di show
                        angular.forEach(this.scope.tabs, (tab) => {
                            tab.show = false;
                        })

                        angular.forEach(this.scope.tabs, (tab) => {
                            if (tab.id === idTabNowShow) {
                                tab.show = true;
                            }
                        });
                    }

                    scopeApply();
                });

                function scopeApply() {
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                }
            }

            addTabs(tab) {
                this.countId++;
                tab.id = this.countId;
                this.scope.tabs.push(tab);

                this.chromeTabs.addTab({
                    title: tab.title,
                    id: tab.id
                });
            }
        }],
        template: require('./tabs-container.html')
    });