'use strict';

angular.module('swimmerApp')
    .controller('MainCtrl', ['$scope', '$http', '_', 'visualizer', 'processor',
    function ($scope, $http, _, visualizer, processor) {

    //loading
    $scope.loaded = false;
    function completeLoading() {
        console.log('5.main ---loading done');
        $scope.athletesOnFocus = [];
        $scope.$apply(function () {
            $scope.loaded = true;
        });
    }

    //vis update by user
    $scope.visUpdating = false;
    function completeUpdating() {
        console.log('5.main ---vis update done');
        $scope.$apply(function () {
            $scope.visUpdating = false;
        });
    }

    //gender
    $scope.genderToSwitch = 'women';
    $scope.selectedGender = 'men';

    //race info
    $scope.allRaces = null;

    function updateFocusedAthletes() {
        $scope.athletesOnFocus = processor.athletesOnFocus;
        $scope.sharedRaces = processor.sharedRaces;
        $scope.sharedRacesWinner = processor.sharedRacesWinner;
    }

    /** TODO: figure out when to use $apply or not **/
    function showAthlete(athlete) {
        //TODO: highlight medals and highest place
        processor.addFocusedAthlete(athlete);
        $scope.$apply(function () {
            updateFocusedAthletes();
        });
    }
    function hideAthlete(index) {
        console.log(index);
        processor.removeFocusedAthlete(index);
        $scope.$apply(function () {
            updateFocusedAthletes();
        });
    }
    $scope.hideAthlete = function (index, id) {
        visualizer.revertFocusedAthlete(index, id);
        processor.removeFocusedAthlete(index);
        updateFocusedAthletes();
    };

    //option control
    $scope.filterParent = function (kind, parent) {
        processor.filterParent(kind, parent);
        $scope.selectedAthletes = processor.selectedAthletes;
    };
    $scope.updateParentStatus = function (kind, parent) {
        processor.updateParentStatus(kind, parent);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    //reselect options
    $scope.reselectAthletes = function () {
        $scope.visUpdating = true;
        processor.resetSelection(updateFocusedAthletes);
        processor.getGraphData(visualizer.drawVis, completeUpdating, showAthlete, hideAthlete);
    };

    //get data and draw SVG
    $http.get('data/data.json').then(function (d) {

        console.log('1.main data receiverd---', d.data);

        //for search
        processor.setAllAthletes(
            d.data.athletes[$scope.selectedGender],
            d.data.graph[$scope.selectedGender]
        );

        //race info
        $scope.allRaces = d.data.race[$scope.selectedGender];

        /* selection menu */
        $scope.category = {
            meets: d.data.meets,
            events: d.data.events
        };
        //pre-selected meets and events
        var selected = {
            meets: ['0OG-2016', '0OG-2012', '1WC-2015', '1WC-2013', '1WC-2011'],
            events: ['0IND-200Fr', '0IND-100Fly', '0IND-200Fly', '0IND-200IM']
        };
        processor.getSelSets(angular.copy($scope.category), selected);
        processor.getSelParentSets(angular.copy($scope.category), selected);
        $scope.sel = processor.sel;
        $scope.selParent = processor.selParent;

        //get filtered athlete data for vis
        processor.getFilteredAthletes();
        $scope.selectedAthletes = processor.selectedAthletes;

        //get graph data of the selected athletes
        processor.getGraphData(visualizer.drawVis, completeLoading, showAthlete, hideAthlete);
    });
}]);