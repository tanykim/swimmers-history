'use strict';

angular.module('swimmerApp')
    .controller('MainCtrl', ['$scope', '$http', '_', 'visualizer', 'processor',
    function ($scope, $http, _, visualizer, processor) {

    //loading
    $scope.loaded = false;
    function completeLoading() {
        $scope.loaded = true;
        console.log('---loading done');
    }

    //gender
    $scope.genderToSwitch = 'women';
    $scope.selectedGender = 'men';

    function getFilteredAthletes() {

        var all = angular.copy($scope.allAthletes);

        //get currently selected meets and events
        var selected = {};
        for (var kind in $scope.sel) {
            selected[kind] = [];
            for (var parent in $scope.sel[kind]) {
                for (var child in $scope.sel[kind][parent]) {
                    if ($scope.sel[kind][parent][child]) {
                        selected[kind].push(parent + '-' + child);
                    }
                }
            }
        }

        var athletes = [];
        var allTotalPoints = [];

        _.each(all, function (athlete) {
            //check records are included in the selected meets and events
            var validPoints = _.map(athlete.records, function (r) {
                if (_.contains(selected.meets, r.race_id.split('--')[0]) &&
                    _.contains(selected.events, r.race_id.split('--')[1])) {
                    r.valid = true;
                    return r.point;
                } else {
                    r.valid = false;
                    return 0;
                }
            });
            var totalPoints = _.reduce(validPoints, function (memo, num) {
                return memo + num;
            }, 0);

            if (totalPoints > 0) {
                allTotalPoints.push(totalPoints);
                athletes.push(athlete);
            }
        });

        $scope.selectedAthletes = athletes;
        console.log('--total', $scope.selectedAthletes.length, 'selected');
        $scope.maxPoint = _.max(allTotalPoints);
        //TODO: update visulization
    }

    //show athletes table
    $scope.athletesOnFocus = [];
    $scope.sharedRaces = [];
    $scope.sharedRacesWinner = [];

    function showAthlete(athlete) {

        var id = athlete.id;
        console.log(id, athlete);

        //add race id
        //TODO: highlight medals and highest place
        var raceIds = _.pluck(athlete.records, 'race_id');
        $scope.$apply(function (){

            //find shared races among all focused athletes
            //very first select - check athletesOnFocus because sharedRaces can be empty later
            if ($scope.athletesOnFocus.length === 0) {
                $scope.sharedRaces = raceIds;
            } else {
                $scope.sharedRaces = _.intersection($scope.sharedRaces, raceIds);
            }

            //check already added
            if (!_.contains(_.pluck($scope.athletesOnFocus, 'id'), id)) {
                $scope.athletesOnFocus.push({
                    index: $scope.athletesOnFocus.length,
                    id: id,
                    name: athlete.name,
                    country: athlete.country,
                    count: athlete.records.length,
                    //made records as records to show the result below
                    records: _.object(_.map(athlete.records, function (d) {
                        return [ d.race_id, { place: +d.place, swimtime: d.swimtime }];
                    }))
                });
            }

            //get shared races winner index after adding all athletes
            $scope.sharedRacesWinner = _.map($scope.sharedRaces, function (raceId) {
                var athletesOfRace = _.map($scope.athletesOnFocus, function (a) {
                    if (a.records[raceId]) {
                        return [a.records[raceId].place, a.index];
                    } else {
                        return null;
                    }
                });
                //sort by place
                var sorted = _.sortBy(_.compact(athletesOfRace), function (a) {
                    return a[0];
                });
                //highest place among all swimmers
                var highestPlace = sorted[0][0];

                //return top athlete's index
                //there may be multiple swimmers with the top place, thus return array
                return _.map(_.filter(sorted, function (s) {
                    return s[0] === highestPlace;
                }), function (f) {
                    return f[1];
                });
            });
        });
    }

    //option control
    $scope.filterParent = function (kind, parent) {
        $scope.selParent[kind][parent] = !$scope.selParent[kind][parent];
        var childrenKeys = _.keys($scope.sel[kind][parent]);
        _.each(childrenKeys, function (key) {
            var update = $scope.selParent[kind][parent] ? true : false;
            $scope.sel[kind][parent][key] = update;
        });
        //TODO: change it to add/remove later
        getFilteredAthletes();
    };

    $scope.updateParentStatus = function (kind, parent) {
        var childrenVals = _.values($scope.sel[kind][parent]);
        //if none of the children are selected, set the parent false
        if (childrenVals.indexOf(true) === -1) {
            $scope.selParent[kind][parent] = false;
        } else {
            $scope.selParent[kind][parent] = true;
        }
        //updated selected Athlete
        //TODO: change it to add/remove later
        getFilteredAthletes();
    };

    //get data and draw SVG
    $http.get('data/data.json').then(function (d) {

        console.log('data loded---', d.data);

        $scope.category = {
            meets: d.data.meets,
            events: d.data.events
        };
        $scope.sel = processor.getSelSets(angular.copy($scope.category));
        $scope.selParent = processor.getSelParentSets(angular.copy($scope.category));

        //for search
        $scope.allAthletes = d.data.athletes[$scope.selectedGender];

        //get athlete data for vis
        getFilteredAthletes();

        //draw vis
        var graph = d.data.graph[$scope.selectedGender];
        visualizer.sendData(graph, completeLoading, showAthlete);
        visualizer.drawVis(graph, $scope.maxPoint, completeLoading, showAthlete);
    });
}]);