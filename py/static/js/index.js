angular.module('srirama', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                template: '<dashboard-container></dashboard-container>'
            })
            .when('/analisis', {
                template: '<tabs-container></tabs-container>'
            })
            .when('/bantuan', {
                template: 'bantuan'
            });
    }]);
require('./api');
require('../components/dashboard-container/dashboard-container');
require('../components/dashboard-graph/dashboard-graph');
require('../components/dashboard-map/dashboard-map');
require('../components/dashboard-info/dashboard-info');
require('../components/header-container/header-container');
require('../components/tabs-container/tabs-container');
require('../components/datasets-container/datasets-container');