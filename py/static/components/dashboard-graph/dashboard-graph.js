angular.module('srirama')
    .component('dashboardGraph', {
        template: require('./dashboard-graph.html'),
        bindings: {
            data: '<',
            id: '='
        },
        controller: [class dashboardGraph {
            $onChanges(e) {
                if (e.data) {
                    if (this.data) {
                        this.setGraph(this.data);
                    }
                }
            }

            /**
             * Mengubah data time series menjadi grafik.
             * @param {Object} data - Data time series.
             */
            setGraph(data) {
                let dataArr = [];
                for (let i = 0; i < data.data.length; i++) {
                    dataArr.push([(new Date(data.coords[data.dims[0]].data[i])).getTime(), data.data[i]]);    //.push(xArr, yArr)
                }
                Highcharts.chart(`dashboard-graph-${this.id}`, {
                    chart:{
                        height: 220
                    },
                    title: {
                        text: null,
                        style: {
                            display: 'none'
                        }
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
                        opposite: false,
                        title: {
                            text: `${data.attrs.long_name} (${data.attrs.units})`
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            return Highcharts.dateFormat('%Y %b', new Date(this.x)) +
                                `<br><b>${this.y}</b>`;
                        }
                    },
                    series: [{
                        showInLegend: false,
                        data: dataArr
                    }],
                    credits: {
                        enabled: false
                    }
                });
            }
        }]
    });