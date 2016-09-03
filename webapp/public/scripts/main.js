'use strict';

angular.module('swimmerApp')
    .controller('MainCtrl', ['$scope', '$http', 'd3', '_', 'visualizer',
    function ($scope, $http, d3, _, visualizer) {

    $scope.loaded = false;

    //get data and draw SVG
    $http.get('data/Men.json').then(function (d) {

        console.log(d);
        $scope.loaded = true;
        // //draw vis first
        // visualizer.drawVis(d.data);
        //
        // $scope.loaded = true;
        //
        // //sorting options
        // $scope.sort = 'name-asc';
        // $scope.sortSport = function () {
        //     visualizer.sortVis(d.data, $scope.sort);
        // };
        //
        // //get count
        // var allAthletes = _.flatten(_.pluck(d.data, 'athletes'));
        // var all = _.size(allAthletes);
        // var women = _.size(_.filter(allAthletes, function (d) {
        //     return d.gender === 'F';
        // }));
        // var rookies = _.size(_.filter(allAthletes, function (d) {
        //     return d.prev === 'NA';
        // }));
        // $scope.count = {
        //     all: all,
        //     women: women,
        //     men: all - women,
        //     rookies: rookies,
        //     prev: all - rookies
        // };
        //
        // //when option selected
        // $scope.$watch('highlight', function (newVal, oldVal) {
        //
        //     if (newVal !== oldVal) {
        //         var ages = null;
        //         if (newVal !== 'all') {
        //             ages = getAthleteAges(d.data, newVal);
        //         }
        //         visualizer.showHighlights(ages, newVal);
        //     }
        // });

    });


}]);