'use strict';

angular.module('swimmerApp')
    .controller('PanelsCtrl', [
        '$scope', '$timeout', '$anchorScroll',
        '_',
        'visualizer', 'processor', 'storage',
    function (
        $scope, $timeout, $anchorScroll,
        _,
        visualizer, processor, storage) {

    //for meets & events menu
    $scope.selParent = {};
    $scope.sel = {};

    //for name search menu
    $scope.searchedAthletes = [];

    //check if user updated options in the opened tab
    $scope.optionChanged = false;

    /* option control */

    //when tab is selected
    $scope.toggleTabs = function (v) {
        $scope.$parent.openTab = $scope.$parent.openTab === v ? '' : v;
        $scope.optionChanged = false;
    };

    //canceling the update -> reset the changed value with storage data
    $scope.$parent.$watch('openTab', function(newVal, oldVal) {
        if (newVal === '' && oldVal === 'event') {
            $scope.sel = angular.copy(storage.sel);
            $scope.selParent = angular.copy(storage.selParent);
        } else if (newVal === '' && oldVal === 'name') {
            $scope.searchedAthletes = angular.copy(storage.searchedAthletes);
        }
    });

    //+, - button from HTML
    $scope.filterParent = function (kind, parent) {
        $scope.selParent[kind][parent] = !$scope.selParent[kind][parent];

        var childrenKeys = _.keys($scope.sel[kind][parent]);
        _.each(childrenKeys, function (key) {
            var status = $scope.selParent[kind][parent] ? true : false;
            $scope.sel[kind][parent][key] = status;
        });
        processor.getVisDataBySel($scope.sel);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    //each checkbox is selected
    $scope.updateParentStatus = function (kind, parent) {
        var childrenVals = _.values($scope.sel[kind][parent]);

        //if none of the children are selected, set the parent false
        if (childrenVals.indexOf(true) === -1) {
            $scope.selParent[kind][parent] = false;
        } else {
            $scope.selParent[kind][parent] = true;
        }
        processor.getVisDataBySel($scope.sel);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    $scope.$watch('sel', function (newVal, oldVal) {
        if (!_.isUndefined(oldVal) && newVal !== oldVal) {
            $scope.optionChanged = true;
        }
    }, true);

    //athlete search
    $scope.addAthletes = function (a) {
        //check if previously added
        for (var i in $scope.searchedAthletes) {
            if ($scope.searchedAthletes[i].id === a.id) {
                return false;
            }
        }
        $scope.optionChanged = true;
        $scope.searchedAthletes.push(a);
        processor.getVisDataByNames($scope.searchedAthletes);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    $scope.removeSearchedAthlete = function (index) {
        $scope.optionChanged = true;
        $scope.searchedAthletes.splice(index, 1);
        processor.getVisDataByNames($scope.searchedAthletes);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    //update button clicked: update athletes from the meets-event or search panel
    $scope.updateAthletes = function () {
        if (!$scope.optionChanged) {
            return false;
        }

        $scope.$emit('updatedClicked', true);

        //data is already updated througn inputs on panel
        //swap scope and storage data
        $timeout(function () {
            storage.setPanelDefault();
            if ($scope.$parent.openTab === 'event') {
                storage.sel = angular.copy($scope.sel);
                storage.selParent = angular.copy($scope.selParent);
                $scope.searchedAthletes = [];
                $scope.$parent.selectedTab = 'event';
            } else {
                $scope.sel = angular.copy(storage.sel);
                $scope.selParent = angular.copy(storage.selParent);
                storage.setSearched($scope.searchedAthletes);
                $scope.$parent.selectedTab = 'name';
            }
            $scope.athletesCount = processor.selectedAthletes.length;
            $scope.$parent.isLoadingStarted.vis = true; //chnage the innerHTML of the update button
        }, 100);
    };

    //vis generation from the intro
    function setVisData() {
        //already set form the parent scope
        $scope.category = storage.category;
        $scope.allAthletes = storage.allAthletes;
        $scope.sel = angular.copy(storage.sel);
        $scope.selParent = angular.copy(storage.selParent);
        $scope.searchedAthletes = angular.copy(storage.searchedAthletes);

        var g = $scope.$parent.isLoaded.men ? 'men' : 'women';
        if (g === 'men') {
            processor.getVisDataBySel($scope.sel);
        } else {
            processor.getVisDataByNames($scope.searchedAthletes);
        }

        $scope.athletesCount = processor.selectedAthletes.length;

        //generate data first --> then start vis
        $scope.$parent.isLoadingStarted.vis = true;
    }

    $scope.$parent.$watch('isLoadingStarted.panels', function (newVal, oldVal) {
        if (!_.isUndefined(oldVal) && newVal) {
            setVisData();
        }
    }, true);


}]);
