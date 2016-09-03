'use strict';

angular.module('swimmerApp').factory('visualizer', ['_', 'd3', function (_, d3) {

    this.drawVis = function (data, callback) {
        console.log('---vis data recieved', _, d3);
        callback();
    };

    return this;
}]);
