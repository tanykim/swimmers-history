'use strict';

angular.module('swimmerApp')
	.controller('IntroCtrl', ['timeline', 'storage', function (timeline, storage) {

    	timeline.drawVis(storage.competition);

}]);
