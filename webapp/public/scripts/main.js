'use strict';

angular.module('swimmerApp')
    .controller('MainCtrl', ['$scope', '$http', '_', 'visualizer', 'processor',
    function ($scope, $http, _, visualizer, processor) {

    /* initial setting */
    $scope.openTab = '';
    $scope.selectedTab = 'event';
    $scope.updateTab = function (v) {
        $scope.selectedTab = v;
        $scope.openTab = $scope.openTab === v ? '' : v;
    };

    $scope.category = {};
    $scope.allRaces = null;
    //pre-selected meets and events
    var selected = {
        'men': {
            meets: ['0OG-2016', '0OG-2012', '1WC-2015', '1WC-2013', '1WC-2011'],
            events: ['0IND-200Fr', '0IND-100Fly', '0IND-200Fly', '0IND-200IM']
        },
        'women': {
            meets: ['0OG-2016', '0OG-2012'],
            events: ['0IND-200Fr', '0IND-400Fr', '0IND-800Fr', '1TEAM-1X100Fr']
        }
    };

    /* loading and updating */
    //loading
    //TODO: intro passed by user selection
    $scope.introPassed = false;
    $scope.loaded = false;
    function completeLoading() {
        var showStart;
        console.log('7.main, loading done');
        $scope.athletesOnFocus = [];
        $scope.$apply(function () {
            $scope.loaded = true;
            $scope.introPassed = true;
        });
    }
    //vis update by user
    $scope.visUpdating = false;
    function completeUpdating() {
        console.log('---user update.main, ---vis update done');
        $scope.$apply(function () {
            $scope.visUpdating = false;
            $scope.openTab = '';
        });
    }

    /* option-vis-table control */
    /** TODO: figure out when to use $apply or not **/
    //callbacks sent to processor and vis
    function updateFocusedAthletes() {
        $scope.athletesOnFocus = processor.athletesOnFocus;
        $scope.sharedRaces = processor.sharedRaces;
        $scope.sharedRacesWinner = processor.sharedRacesWinner;
    }
    function showAthlete(athlete) {
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
    //from html table
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

    //reselect options from html
    $scope.optionChanged = false;
    $scope.reselectAthletes = function () {
        if ($scope.optionChanged) {
            console.log('---main, start updating meet/events');
            $scope.visUpdating = true;
            processor.resetSelection(updateFocusedAthletes);
            processor.getGraphData(visualizer.drawVis, completeUpdating, showAthlete, hideAthlete);
            $scope.optionChanged = false;
        }
    };
    $scope.$watch('sel', function (newVal, oldVal) {
        if (!_.isUndefined(oldVal) && newVal !== oldVal) {
            $scope.optionChanged = true;
        }
    }, true);

    /* swtich view by gender */
    $scope.genders = ['men', 'women'];
    $scope.selectedGenderId = 0;

    function initMVC() {
        var g = $scope.genders[$scope.selectedGenderId];
        processor.getSelSets(angular.copy($scope.category), selected[g]);
        processor.getSelParentSets(angular.copy($scope.category), selected[g]);
        $scope.sel = processor.sel;
        $scope.selParent = processor.selParent;

        //get filtered athlete data for vis
        processor.getFilteredAthletes();
        $scope.selectedAthletes = processor.selectedAthletes;

        //get graph data of the selected athletes
        processor.getGraphData(visualizer.drawVis, completeLoading, showAthlete, hideAthlete);
    }

    $scope.switchGender = function () {
        //switch between 0 and 1
        $scope.selectedGenderId = $scope.selectedGenderId * -1 + 1;
        console.log('------------- switch gender to ' + $scope.genders[$scope.selectedGenderId]);
        processor.switchGender($scope.genders[$scope.selectedGenderId]);
        processor.resetSelection(updateFocusedAthletes);
        //reset selections
        $scope.openTab = '';
        $scope.selectedTab = 'event';
        initMVC();
    };

    //get data and draw SVG
    $http.get('data/data.json').then(function (d) {

        console.log('1.main, data receiverd', d.data);

        //selection menu - applies to both genders
        $scope.category = {
            meets: d.data.meets,
            events: d.data.events
        };

        //selected gender
        var g = $scope.genders[$scope.selectedGenderId];

        //pass all data
        processor.setAllAthletes(d.data.athletes, d.data.graph, g);

        //race info
        $scope.allRaces = d.data.race[g];

        //init data process and visualization
        initMVC();
    });
}]);