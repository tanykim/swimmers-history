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
    //$scope.allRaces = null;
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
    $scope.loaded = false;
    $scope.introPassed = false;
    function completeLoading() {
        console.log('7.main, loading done');
        $scope.athletesOnFocus = [];
        $scope.$apply(function () {
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

    /* vis-table control */

    var mainWidth; //vis and table width
    $scope.hiddenAthSId = 0; //hidden athletes index in the focused athletes array
    $scope.isRightOn = false; //right arrow button

    //check the table fits in the layout width
    function checkIsFit() {
        var tR = document.getElementById('table-races');
        var tA = document.getElementById('table-athletes');
        var tableWidth = tR.clientWidth + tA.clientWidth;
        //console.log(tableWidth, mainWidth - 20 - tableWidth);
        return tableWidth <= mainWidth - 20;
    }

    function updateTable() {
        if (checkIsFit()) {
            $scope.$apply(function () {
                $scope.hiddenAthSId = 0;
                $scope.isRightOn = false;
            });
        } else {
            $scope.$apply(function () {
                $scope.hiddenAthSId++;
            });
        }
    }

    //when left and right button clicked
    $scope.updateTable = function (dir) {
        $scope.hiddenAthSId = $scope.hiddenAthSId + dir;
        _.defer(function () {
            if (checkIsFit()) {
                //console.log('----after button click, it is fit');
                $scope.isRightOn = false;
            } else {
                //console.log('----after button click, it is NOT fit');
                $scope.isRightOn = true;
            }
        });
    };

    //callbacks sent to processor and vis
    //update focused athletes after selected on the network vis
    //use scope.$apply for callbacked functions
    function updateFocusedAthletes() {
        $scope.athletesOnFocus = processor.athletesOnFocus;
        $scope.sharedRaces = processor.sharedRaces;
        $scope.sharedRacesWinner = processor.sharedRacesWinner;
    }
    function showAthlete(athlete) {
        processor.addFocusedAthlete(athlete);
        $scope.$apply(function () {
            updateFocusedAthletes();
            _.defer(updateTable);
        });

    }
    function hideAthlete(index) {
        processor.removeFocusedAthlete(index);
        $scope.$apply(function () {
            updateFocusedAthletes();
            _.defer(updateTable);
        });
    }
    //from html table
    $scope.hideAthlete = function (index, id) {
        visualizer.revertFocusedAthlete(index, id);
        processor.removeFocusedAthlete(index);
        updateFocusedAthletes();
        _.defer(updateTable);
    };

    /* option-vis control */

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
            processor.getGraphData(visualizer.drawVis, null, completeUpdating, showAthlete, hideAthlete);
            $scope.optionChanged = false;
        }
    };
    $scope.$watch('sel', function (newVal, oldVal) {
        if (!_.isUndefined(oldVal) && newVal !== oldVal) {
            $scope.optionChanged = true;
        }
    }, true);

    function initVis() {

        //pass all data
        var g = $scope.genders[$scope.selectedGenderId];
        processor.setAthletes(g);

        processor.getSelSets(angular.copy($scope.category), selected[g]);
        processor.getSelParentSets(angular.copy($scope.category), selected[g]);
        $scope.sel = processor.sel;
        $scope.selParent = processor.selParent;

        //get filtered athlete data for vis
        processor.getFilteredAthletes();
        $scope.selectedAthletes = processor.selectedAthletes;

        //get graph data of the selected athletes
        processor.getGraphData(visualizer.drawVis, mainWidth, completeLoading, showAthlete, hideAthlete);
    }

    //update button when clicked;
    var bElm = document.getElementById('init-button');
    bElm.addEventListener('click', function () {
        bElm.innerHTML='Generating Visualization...';
        bElm.className = 'animate-flicker';
        setTimeout(function () {
            initVis();
        }, 100);
    });

    /* swtich view by gender */
    $scope.genders = ['men', 'women'];
    $scope.selectedGenderId = 0;
    $scope.switchGender = function () {
        //switch between 0 and 1
        $scope.selectedGenderId = $scope.selectedGenderId * -1 + 1;
        console.log('------------- switch gender to ' + $scope.genders[$scope.selectedGenderId]);
        processor.switchGender($scope.genders[$scope.selectedGenderId]);
        processor.resetSelection(updateFocusedAthletes);
        //reset selections
        $scope.openTab = '';
        $scope.selectedTab = 'event';
        initVis();
    };

    //get data and draw SVG
    $http.get('data/data.json').then(function (d) {

        console.log('1.main, data receiverd', d.data);

        //selection menu - applies to both genders
        $scope.category = {
            meets: d.data.meets,
            events: d.data.events
        };

        //pass all data
        processor.setAllAthletes(d.data.athletes, d.data.graph);

        //set vis area size; 90 is left tab area, 200 is right menu
        var calMainWidth = document.documentElement.clientWidth - 90 - 200;
        var maxMainWidth = 860;
        mainWidth = Math.min(calMainWidth, maxMainWidth);
        var mainDom = document.getElementById('main');
        mainDom.style.width = mainWidth + 'px';
        mainDom.style.height = document.documentElement.clientHeight + 'px';
        mainDom.style['margin-left'] = Math.max((calMainWidth - 30 - maxMainWidth) / 2, 0) + 'px';
        document.getElementById('top').style.left = mainWidth + 'px';

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