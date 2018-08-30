angular.module('srirama')
    .component('dashboardGraph', {
        template: require('./dashboard-graph.html'),
        bindings: {
            data: '<',
            id: '='
        },
        controller: ['$scope', class dashboardGraph {
            constructor($scope) {
                this.scope = $scope;
            }

            $onInit() {

            }

            setGraph(data) {
                let dataArr = [];
                for (var i = 0; i < data.data.length; i++) {
                    dataArr.push([(new Date(data.coords[data.dims[0]].data[i])).getTime(), data.data[i]]);    //.push(xArr, yArr)
                }
                Highcharts.stockChart(`dashboard-graph-${this.id}`, {
                    title: {
                        text: data.attrs.long_name
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            formatter: function () {
                                return Highcharts.dateFormat('%Y %b', this.value);
                            }
                        }
                    },
                    yAxis: {
                        opposite: false
                    },
                    tooltip: {
                        formatter: function () {
                            return Highcharts.dateFormat('%Y %b', new Date(this.x)) +
                                `<br><b>${this.y}</b>`;
                        }
                    },
                    series: [{
                        data: dataArr
                    }]
                });
                console.log('dashboardGraph setGraph', data, this.id, dataArr);
            }

            $onChanges(e) {
                if (e.data) {
                    if (this.data) {
                        this.setGraph(this.data);
                    }
                }
            }
        }]
    });