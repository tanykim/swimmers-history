'use strict';

angular.module('swimmerApp')
    .controller('MainCtrl', ['$scope', '$http', '_', 'visualizer',
    function ($scope, $http, _, visualizer) {

    //loading
    $scope.loaded = false;
    function completeLoading() {
        $scope.loaded = true;
        console.log('---loading done');
    }

    //gender
    $scope.genderToSwitch = 'women';
    $scope.selectedGender = 'men';

    //option control
    //TODO: parent - child control
    // $scope.$watch('sel', function (newVal, oldVal) {
    //     console.log(newVal, oldVal);
    // }, true);
    $scope.filter = function (opt, parent, child) {
        console.log(opt, parent, child);
    };

    //get data and draw SVG
    $http.get('data/data.json').then(function (d) {

        console.log(d.data);

        $scope.athletes = d.data.athletes[$scope.selectedGender];

        $scope.meets = d.data.meets;
        $scope.events = d.data.events;

        $scope.sel = {
            meets: _.object(_.map(d.data.meets, function (d, key) {
                var years = _.object(_.map(angular.copy(d.years), function (d) {
                    return [d[2], true];
                }));
                return [key, years];
            })),
            meetsParent: _.object(_.map(_.keys(d.data.meets), function (d) {
                return [d, true];
            })),
            events: _.object(_.map(d.data.events, function (group, key) {
                var eventsInGroup = _.object(_.map(group, function (event, id) {
                    return [id, true];
                }));
                return [key, eventsInGroup];
            })),
            eventsParent: _.object(_.map(_.keys(d.data.events), function (d) {
                return [d, true];
            }))
        };

        //draw vis
        visualizer.drawVis(d.data.graph[$scope.selectedGender], completeLoading);



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