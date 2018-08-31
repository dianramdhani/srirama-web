angular.module('srirama')
    .component('dashboardInfo', {
        template: require('./dashboard-info.html'),
        bindings: {
            info: '='
        }
    });