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
    $scope.filterParent = function (kind, parent) {
        $scope.selParent[kind][parent] = !$scope.selParent[kind][parent];
        var childrenKeys = _.keys($scope.sel[kind][parent]);
        _.each(childrenKeys, function (key) {
            var update = $scope.selParent[kind][parent] ? true : false;
            $scope.sel[kind][parent][key] = update;
        });
    };

    $scope.updateParentStatus = function (kind, parent) {
        var childrenVals = _.values($scope.sel[kind][parent]);
        //if none of the children are selected, set the parent false
        if (childrenVals.indexOf(true) === -1) {
            $scope.selParent[kind][parent] = false;
        } else {
            $scope.selParent[kind][parent] = true;
        }
    };

    function getSelSets(obj) {
        return _.object(_.map(obj, function (val, key) {
            var vals = _.object(_.map(val, function (d, key) {
                var children = _.object(_.map(d.children, function (d) {
                    return [d[0], true];
                }));
                return [key, children];
            }));
            return [key, vals];
        }));
    }

    function getSelParentSets(obj) {
        return _.object(_.map(obj, function (val, key) {
            var vals = _.object(_.map(_.keys(val), function (d) {
                return [d, true];
            }));
            return [key, vals];
        }));
    }

    //get data and draw SVG
    $http.get('data/data.json').then(function (d) {

        console.log(d.data);

        //for search
        $scope.athletes = d.data.athletes[$scope.selectedGender];

        //for option
        $scope.category = {
            meets: d.data.meets,
            events: d.data.events
        };
        $scope.sel = getSelSets(angular.copy($scope.category));
        $scope.selParent = getSelParentSets(angular.copy($scope.category));

        //draw vis
        visualizer.drawVis(d.data.graph[$scope.selectedGender], completeLoading);
    });


}]);