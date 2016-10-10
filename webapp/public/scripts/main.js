'use strict';

angular.module('swimmerApp')
    .controller('MainCtrl', ['$scope', '$http', '$anchorScroll', '_', 'visualizer', 'processor',
    function ($scope, $http, $anchorScroll, _, visualizer, processor) {

    /* initial setting */

    function initIntro() {
        $scope.genders = ['men', 'women'];
        $scope.selectedGenderId = 0;
        $scope.openTab = '';
        $scope.selectedTab = '';
        $scope.introPassed = false;
        $scope.visUpdating = false;
        $scope.mainLoading = false;
        //user-typed names in option-name
        $scope.searchedAthletes = [];
        //enable update button only when option is changed
        $scope.optionChanged = false;
    }

    initIntro();
    $scope.goToIntro = initIntro;

    //left menu
    $scope.sub = { data: false, insights: false };
    $scope.hideSub = function () {
        $scope.sub.data = false;
        $scope.sub.insights = false;
        $anchorScroll();
    };
    $scope.$watch('sub', function (val) {
        if (val.data || val.insights) {
            $anchorScroll();
        }
    }, true);
    /* loading and updating vis */

    //default values when original data loaded or gender switched
    //event(meets-event category selection) is for men, name(name search) is women
    $scope.category = {}; //for option-events $scope.sel, selParent in processor
    var defaultEvents = {
        meets: ['0OG-2016', '0OG-2012', '0OG-2008'],
        events: ['0IND-50Fr', '0IND-100Fr', '0IND-200Fr', '0IND-400Fr', '0IND-1500Fr',
            '1TEAM-4X100Fr', '1TEAM-4X200Fr']
    };
    var defaultName = 'Kathleen Ledecky';

    function completeMainInit() {
        console.log('7.main, loading done');
        $scope.athletesOnFocus = [];
        $scope.$apply(function () {
            $scope.visUpdating = false;
            $scope.introPassed = true;
        });
    }

    //vis update by user through tab menu
    function completeUpdating() { //used for callback
        console.log('---user update.main, ---vis update done');
        $scope.$apply(function () {
            $scope.visUpdating = false;
            //set the tab
            $scope.optionChanged = false;
            $scope.selectedTab = $scope.openTab; //currently selected tab (used for processing/vis)
            $scope.openTab = ''; //currently open tab (used for HTML)
        });
    }

    /* vis control */

    //toggle all linked nodes of the focused athletes
    $scope.toggleLinkedNodes = function () {
        $scope.isLinkedVisible = !$scope.isLinkedVisible;
        if ($scope.isLinkedVisible) {
            var mutualIds = processor.getMutualLinkedNodes();
            visualizer.highlightLinkedNodes(mutualIds);
        } else {
            visualizer.hideLinkedNodes();
        }
    };

    /* vis-table control */

    //callbacks sent to processor and vis
    //update focused athletes after selected on the network vis
    //use scope.$apply for callbacked functions

    function updateToDefaultView() {

        //reset results in table
        $scope.athletesOnFocus = processor.athletesOnFocus;
        $scope.sharedRaces = processor.sharedRaces;
        $scope.sharedRacesWinner = processor.sharedRacesWinner;

        //revert the vis to the status that linked nodes are not highlighted
        if ($scope.isLinkedVisible) {
            $scope.isLinkedVisible = false;
            visualizer.hideLinkedNodes();
        }
    }

    //show/hide athlete functions are used callbacks from vis.js
    function showAthlete(athlete) {
        processor.addFocusedAthlete(athlete);
        $scope.$apply(function () {
            updateToDefaultView();
        });
        $anchorScroll('results');
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

    /* option control */

    //when tab is selected
    $scope.toggleTabs = function (v) {
        $scope.openTab = $scope.openTab === v ? '' : v;
        $scope.optionChanged = false;
    };

    //+, - button from HTML
    $scope.filterParent = function (kind, parent) {
        processor.filterParent(kind, parent);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    //each checkbox is selected
    $scope.updateParentStatus = function (kind, parent) {
        processor.updateParentStatus(kind, parent);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    //update button clicked: update athletes from the meets-event or search panel
    $scope.updateAthletes = function () {
        if ($scope.optionChanged) {
            $scope.visUpdating = true; //chnage the innerHTML of the update button
            setTimeout(function () {
                processor.getSelectedAthletes($scope.openTab === 'name' ? $scope.searchedAthletes : []);

                //reset selected races and searched athletes
                $scope.selectedRaces = processor.selectedRaces;
                $scope.topAthletes = processor.topAthletes;

                if ($scope.openTab === 'event') {
                    $scope.searchedAthletes = [];
                } else {
                    processor.getSelDefault($scope.category);
                    $scope.sel = processor.sel;
                    $scope.selParent = processor.selParent;
                }

                processor.resetSelection(updateToDefaultView);
                processor.getGraphData(visualizer.drawVis, completeUpdating, showAthlete, hideAthlete);
            }, 100);
        }
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
        processor.getSelectedAthletes($scope.searchedAthletes);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    $scope.removeSearchedAthlete = function (index) {
        $scope.optionChanged = true;
        $scope.searchedAthletes.splice(index, 1);
        processor.getSelectedAthletes($scope.searchedAthletes);
        $scope.selectedAthletes = processor.selectedAthletes;
    };

    /* init vis after all data loading */

    function initVis() {

        //pass all data
        var g = $scope.genders[$scope.selectedGenderId];
        processor.setAthletes(g);

        //for search by name
        $scope.allAthletes = _.sortBy(processor.allAthletes, function (a) {
            return a.records.length;
        }).reverse();

        //set category selection, searched name, and tab status differently by gender
        var defaultAthletes = [];
        if (g === 'men') {
            processor.setSel(defaultEvents);
            $scope.selectedTab = 'event';
        } else {
            processor.getSelDefault($scope.category);
            defaultAthletes = _.filter(angular.copy(processor.allAthletes), function (a) {
                return a.name === defaultName;
            });
            $scope.selectedTab = 'name';
        }

        $scope.sel = processor.sel;
        $scope.selParent = processor.selParent;
        $scope.searchedAthletes = defaultAthletes;

        //get filtered athlete data for vis
        processor.getSelectedAthletes(defaultAthletes);
        $scope.selectedRaces = processor.selectedRaces;
        $scope.selectedAthletes = processor.selectedAthletes;
        $scope.topAthletes = processor.topAthletes;

        //get graph data of the selected athletes
        processor.getGraphData(visualizer.drawVis, completeMainInit, showAthlete, hideAthlete);
    }

    //intro visualize button clicked
    $scope.startMainLoading = function (genderId) {
        $scope.selectedGenderId = genderId;
        $scope.mainLoading = true;
        setTimeout(function () {
            initVis();
        }, 100);
    };

    /* swtich view by gender */

    $scope.switchGender = function () {
        //switch between 0 and 1
        $scope.visUpdating = true;
        $scope.openTab = '';
        console.log('-- switch gender');
        setTimeout(function () {
            $scope.selectedGenderId = $scope.selectedGenderId * -1 + 1;
            var g = $scope.genders[$scope.selectedGenderId];
            processor.switchGender(g);
            processor.resetSelection(updateToDefaultView);
            //reset selections
            if (g === 'men') {
                $scope.selectedTab = 'event';
            } else {
                $scope.selectedTab = 'name';
            }
            initVis();
        }, 100);
    };

    //get data and draw SVG
    $http.get('data/data.json').then(function (d) {

        console.log('1.main, data receiverd', d.data);

        //selection menu - applies to both genders
        $scope.category = {
            meets: d.data.meets,
            events: d.data.events
        };
        processor.getSelDefault($scope.category);

        //pass all data
        processor.setAllAthletes(d.data.athletes, d.data.graph);

        //loading done after 1 second
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.loaded = true;
            });
        }, 1000);
        // $scope.loaded = true;
        // $scope.introPassed = true;
        // initVis();
    });
}]);