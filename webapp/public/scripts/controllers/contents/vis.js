'use strict';

angular.module('swimmerApp')
    .controller('VisCtrl', [
        '$scope', '$anchorScroll',
        '_',
        'visualizer', 'processor', 'storage',
    function (
        $scope, $anchorScroll,
        _,
        visualizer, processor, storage) {

    $scope.isLinkedVisible = 0;

    //update focused athletes after selected on the network vis
    function updateToDefaultView() {

        //reset results in table
        $scope.athletesOnFocus = processor.athletesOnFocus;
        $scope.sharedRaces = processor.sharedRaces;
        $scope.sharedRacesWinner = processor.sharedRacesWinner;

        //revert the vis to the status that linked nodes are not highlighted
        if ($scope.isLinkedVisible === 1) {
            $scope.isLinkedVisible = 0;
            visualizer.hideLinkedNodes();
        }
    }

    $scope.updateToDefaultView = updateToDefaultView();

    function completeMainInit() {
        console.log('7.vis, vis animation done');

        $scope.$emit('updatedClicked', false);

        $scope.$apply(function () {
            $scope.$parent.openTab = '';
            $scope.$parent.optionChanged = false;
            $scope.$parent.isLoadingStarted.panels = false;
            $scope.$parent.isLoadingStarted.vis = false;
            $scope.$parent.$parent.isLoaded.content = true;
        });
    }

    /* vis control */

    //toggle all linked nodes of the focused athletes
    $scope.toggleLinkedNodes = function (isNetwork) {
        if (isNetwork) {
            $scope.isLinkedVisible = 1;
            var mutualIds = processor.getMutualLinkedNodes();
            visualizer.highlightLinkedNodes(mutualIds);
        } else {
            $scope.isLinkedVisible = 0;
            visualizer.hideLinkedNodes();
        }
    };

    /* vis-table control */

    //callbacks sent to processor and vis
    //use scope.$apply for callbacked functions

    //show/hide athlete functions are used callbacks from vis.js
    function showAthlete(athlete) {
        processor.addFocusedAthlete(athlete);
        $scope.$apply(function () {
            updateToDefaultView();
        });
        if ('ontouchstart' in document) {
            return false;
        } else {
            $anchorScroll('results');
        }
    }

    function hideAthlete(index) {
        processor.removeFocusedAthlete(index);
        $scope.$apply(function () {
            updateToDefaultView();
        });
    }

    //from html Result table
    $scope.hideAllAthletes = function () {
        visualizer.revertToDefault();
        processor.resetSelection(updateToDefaultView);
        $anchorScroll('vis');
    };

    $scope.hideAthlete = function (index, id) {
        visualizer.revertFocusedAthlete(index, id);
        processor.removeFocusedAthlete(index);
        updateToDefaultView();
    };

    //highlight athlete(s) by select list in the result
    function updateResultsAndVis() {
        visualizer.resetClickedAthletes();
        updateToDefaultView();
        visualizer.updateFocusedAthletes($scope.athletesOnFocus);
    }

    $scope.showAthletesByRace = function (val) {
        processor.addAthletesByRace(val);
        updateResultsAndVis();
    };

    $scope.showAllSearchedAthletes = function () {
        processor.addAllSearchedAthletes();
        updateResultsAndVis();
    };

    $scope.showAthletesByName = function (val) {
        processor.addAthletesByAthlete($scope.topAthletes[val]);
        updateResultsAndVis();
    };

    $scope.$parent.$watch('isLoadingStarted.vis', function (val) {
        if (val) {
            //get filtered athlete data for vis
            $scope.selectedRaces = processor.selectedRaces;
            $scope.topAthletes = processor.topAthletes;

            //get graph data of the selected athletes
            processor.getGraphData(visualizer.drawVis, completeMainInit, showAthlete, hideAthlete);
            processor.resetSelection(updateToDefaultView);
        }
    }, true);

}]);
