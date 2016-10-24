'use strict';

angular.module('swimmerApp')
    .controller('MainCtrl', ['$scope', '$anchorScroll', '_', 'visualizer', 'processor', 'storage',
    function ($scope, $anchorScroll, _, visualizer, processor, storage) {

    /* initial setting */

    // $scope.selectedGenderId = 0;
    $scope.isLoaded = {
        men: true,
        data: false, //loading JSON data file
        content: false //for switching intro - content view
    };
    $scope.isLoadingStarted = {
        content: false //for the next steps in child scope - prompt data generation and vis
    };

    /* left menu */

    $scope.goToIntro = function () {
        $scope.isLoadingStarted.content = false;
        $scope.isLoaded.content = false;
    };

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

    /* load data */

    function completeDataLoading(d) {
        storage.setPanelDefault();
        $scope.isLoaded.data = true;
    }

    storage.loadData(completeDataLoading);

    //intro visualize button clicked
    $scope.startMainLoading = function () {
        // console.log($scope.selectedGenderId);
        // $scope.selectedGenderId = genderId;
        $scope.isLoadingStarted.content = true;
    };
}]);