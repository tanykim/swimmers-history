'use strict';

angular.module('swimmerApp').factory('timeline', ['_', 'd3', function (_, d3) {

    var dim;
    var svg;
    var w;

    var self = this;

    /* vis drawing - called from MainCtrl when 1) initial loading 2) update from options */

    this.drawVis = function (data) {

        console.log(data);

        svg = d3.select('#intro-vis-g');
        svg.append('line')
            .attr('x1', 0)
            .attr('x2', 100)
            .attr('y1', 0)
            .attr('y2', 100);
    };


    return this;
}]);
