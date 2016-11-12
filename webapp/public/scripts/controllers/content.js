'use strict';

angular.module('swimmerApp')
    .controller('ContentCtrl', [
        '$scope', '$timeout', '$anchorScroll',
        '_',
        'visualizer', 'processor', 'storage',
    function (
        $scope, $timeout, $anchorScroll,
        _,
        visualizer, processor, storage) {

    //used for children scopes
    $scope.isLoadingStarted = {
        panels: false,
        vis: false
    };

    //when one of the tabs is opened
    $scope.openTab = '';
    //currently selected menu
    $scope.selectedTab = '';

    //default values when original data loaded or gender switched
    //event(meets-event category selection) is for men, name(name search) is women
    var defaultEvents = {
        meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
        events: ['0IND-50Fr', '0IND-100Fr', '0IND-200Fr', '0IND-400Fr', '0IND-1500Fr',
            '1TEAM-4X100Fr', '1TEAM-4X200Fr']
    };
    var defaultName = 'Kathleen Ledecky';

    /* init vis after all data loading */

    function setDefaultContent() {

        //set data by gender
        var g = $scope.$parent.isLoaded.men ? 'men' : 'women';
        storage.setAthletes(g);

        //panel selection all fault and empty searched athletes
        storage.setPanelDefault();

        //set category selection, searched name, and tab status differently by gender
        if (g === 'men') {
            storage.setSel(defaultEvents);
        } else {
            var defaultAthletes = _.filter(angular.copy(storage.allAthletes), function (a) {
                return a.name === defaultName;
            });
            storage.setSearched(defaultAthletes);
        }

        $scope.isLoadingStarted.panels = true;
    }

    /* swtich view by gender */

    $scope.switchGender = function () {
        $scope.isUpdating = true;
        $timeout(function () {
            $scope.$parent.isLoaded.men = !$scope.$parent.isLoaded.men;
            setDefaultContent();
        }, 100);
    };

    /* check vis loading started -> generate data first - */

    $scope.$parent.$watch('isLoadingStarted.content', function (val) {
        if (val) {
            setDefaultContent();
        }
    });

    $scope.$on('updatedClicked', function (evt, data) {
        $scope.isUpdating = data;
    });
}]);
