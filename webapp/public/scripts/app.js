'use strict';

angular.module('underscore', []).factory('_', ['$window', function($window) {
    return $window._;
}]);

angular.module('d3', []).factory('d3', ['$window', function($window) {
    return $window.d3;
}]);

angular.module('swimmerApp', ['underscore', 'd3']);