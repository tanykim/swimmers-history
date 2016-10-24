'use strict';

angular.module('swimmerApp').service('processor', ['_', 'storage', function (_, storage) {

    //athletes filtered by meet/event or name search - used in panel (athlete count)
    this.selectedAthletes = [];

    //for vis
    this.graph = {}; //node and edge data structure for vis
    this.pointRange = []; //for vis node size
    this.selectedRaces = []; //races filtered by meets/event, for HTML
    this.topAthletes = []; //top athletes by meets/event, for HTML

    //vis investigation data - focused athletes from vis or result HTML
    this.athletesOnFocus = [];
    this.sharedRaces = [];
    this.sharedRacesWinner = [];

    var self = this;

    /* filter athletes */

    function getSelectedRaces(sel) {
        // var sel = storage.sel;
        var races = [];
        for (var meet in sel.meets) {
            for (var year in sel.meets[meet]) {
                if (sel.meets[meet][year]) {
                    for (var type in sel.events) {
                        for (var race in sel.events[type]) {
                            if (sel.events[type][race]) {
                                races.push(meet + '-' + year + '--' + type + '-' + race);
                            }
                        }
                    }
                }
            }
        }
        return races;
    }

    function getAthletesData() {

        var athletes = [];
        var allTotalPoints = [];

        //check records are included in the selected meets and events
        _.each(angular.copy(storage.allAthletes), function (athlete) {
            var totalPoint = 0;
            var validRecords = [];
            _.each(athlete.records, function (r) {
                if (_.contains(self.selectedRaces, r.race_id)) {
                    totalPoint = totalPoint + r.point;
                    validRecords.push(r);
                }
            });
            if (validRecords.length > 0) {
                allTotalPoints.push(totalPoint);
                athlete.records = validRecords;
                athlete.totalPoint = totalPoint;
                athletes.push(athlete);
            }
        });

        self.selectedAthletes = athletes;
        self.pointRange = [_.min(allTotalPoints), _.max(allTotalPoints)];
    }

    this.getVisDataBySel = function (sel) {
        self.selectedRaces = getSelectedRaces(sel);
        getAthletesData();
        self.topAthletes = _.sortBy(angular.copy(self.selectedAthletes), function (a) {
            return a.totalPoint;
        }).reverse().slice(0, Math.min(30, Math.round(self.selectedAthletes.length / 10)));

        console.log('3.processor, filter athletes - by selection');
    };

    this.getVisDataByNames = function (searchedAthletes) {
        self.selectedRaces = _.unique(_.flatten(_.map(angular.copy(searchedAthletes), function (a) {
            return _.pluck(a.records, 'race_id');
        })));
        self.topAthletes = searchedAthletes;
        getAthletesData();

        console.log('3.processor, filter athletes - by names');
    };

    /* get graph data */

    this.getGraphData = function (drawVis, completeLoadingCb, showAthleteCb, hideAthleteCb) {
        //selected athletes' id
        var aIds = _.pluck(self.selectedAthletes, 'id');
        var links = [];
        _.each(angular.copy(storage.allLinks), function (d) {
            //check if both source and target are in the selected ids
            if (aIds.indexOf(d.source) > -1 && aIds.indexOf(d.target) > -1) {
                var validRecords = [];
                _.each(d.value, function (r) {
                    if (_.contains(self.selectedRaces, r)) {
                        validRecords.push(r);
                    }
                });
                if (validRecords.length > 0) {
                    links.push({
                        source: d.source,
                        target: d.target,
                        value: validRecords.length
                    });
                }
            }
        });

        self.graph = {
            nodes: self.selectedAthletes,
            links: links
        };

        console.log('4.processor, graph data done');
        drawVis(self.graph, self.pointRange, completeLoadingCb, showAthleteCb, hideAthleteCb);
    };

    /* add and remove athletes */

    function getSharedRaces() {
        var raceIdsByA = _.map(self.athletesOnFocus, function (a) {
            return _.keys(a.records);
        });
        var shared = raceIdsByA[0];
        for (var i = 1; i < raceIdsByA.length; i++) {
            shared = _.intersection(shared, raceIdsByA[i]);
        }
        return shared;
    }

    function getWinnersIndex() {

        return _.map(self.sharedRaces, function (raceId) {
            var athletesOfRace = _.map(self.athletesOnFocus, function (a, i) {
                if (a.records[raceId]) {
                    //i: index of column
                    return [a.records[raceId].place, i];
                } else {
                    return null;
                }
            });
            //sort by place
            var sorted = _.sortBy(_.compact(athletesOfRace), function (a) {
                return a[0];
            });

            //highest place among all swimmers
            var highestPlace = sorted[0][0];

            //return top athlete's index
            //there may be multiple swimmers with the top place, thus return array
            return _.map(_.filter(sorted, function (s) {
                return s[0] === highestPlace;
            }), function (f) {
                return f[1];
            });
        });
    }

    function getAthleteObj(athlete) {
        return {
            id: athlete.id,
            name: athlete.name,
            country: athlete.country,
            count: athlete.records.length,
            records: _.object(_.map(athlete.records, function (d) {
                return [ d.race_id, { place: d.place, swimtime: d.swimtime }];
            }))
        };
    }

    function isAlreadyFocused(athlete) {
        var result = false;
        for (var i in self.athletesOnFocus) {
            if (self.athletesOnFocus[i].id === athlete.id) {
                result = true;
            }
        }
        return result;
    }

    this.addFocusedAthlete = function (athlete) {

        //check if previously added
        if (isAlreadyFocused(athlete)) {
            return false;
        }
        var raceIds = _.pluck(athlete.records, 'race_id');

        //find shared races among all focused athletes
        //very first select - check athletesOnFocus because sharedRaces can be empty later
        if (self.athletesOnFocus.length === 0) {
            self.sharedRaces = raceIds;
        } else {
            self.sharedRaces = _.intersection(self.sharedRaces, raceIds);
        }

        self.athletesOnFocus.push(getAthleteObj(athlete));

        //get shared races winner index after adding all athletes
        self.sharedRacesWinner = getWinnersIndex();
    };

    this.removeFocusedAthlete = function (index) {

        self.athletesOnFocus.splice(index, 1);

        if (self.athletesOnFocus.length > 0) {
            self.sharedRaces = getSharedRaces();
            self.sharedRacesWinner = getWinnersIndex();
        } else {
            self.sharedRaces = [];
            self.sharedRacesWinner = [];
        }
    };

    this.addAthletesByRace = function (race) {
        self.athletesOnFocus = _.sortBy(_.map(_.filter(self.selectedAthletes, function (a) {
            return _.contains(_.pluck(a.records, 'race_id'), race);
        }), function (athlete) {
            return getAthleteObj(athlete);
        }), function (a) { //sort by place
            return a.records[race].place;
        });
        self.sharedRaces = [race];
        self.sharedRacesWinner = getWinnersIndex();
    };

    this.addAllSearchedAthletes = function () {
        self.athletesOnFocus = _.map(angular.copy(storage.searchedAthletes), function (a) {
            return getAthleteObj(a);
        });
        self.sharedRaces = getSharedRaces();
        self.sharedRacesWinner = getWinnersIndex();
    };

    this.addAthletesByAthlete = function (athlete) {
        if (isAlreadyFocused(athlete)) {
            return false;
        }
        self.athletesOnFocus.push(getAthleteObj(athlete));
        self.sharedRaces = getSharedRaces();
        self.sharedRacesWinner = getWinnersIndex();
    };

    //athletes who competed with ALL of the focused athletes
    this.getMutualLinkedNodes = function () {

        var focusedAIds = _.pluck(self.athletesOnFocus, 'id');
        var linksByFIds = []; //links by focused ID

        _.each(self.graph.links, function (l) {
            //id pair from each link
            var idPair = [l.source.id, l.target.id];
            //compare the ID pair and the focused athletes IDs
            _.each(focusedAIds, function (id, i) {
                //if one of the pair is a focused athlete, get the other one of the pair
                if (idPair.indexOf(id) > -1) {
                    var linked = idPair[idPair.indexOf(id) * -1 + 1];
                    //exclude the focused id
                    if (!_.contains(focusedAIds, linked)) {
                        if (!linksByFIds[i]) {
                            linksByFIds[i] = [linked];
                        } else {
                            linksByFIds[i].push(linked);
                        }
                    }
                }
            });
        });

        //get athletes who competed all of the focused ones
        var linkedToAll = [];
        _.each(linksByFIds, function (links, i) {
            if (i === 1) {
                linkedToAll = _.intersection(linksByFIds[i - 1], links);
            } else if (i !== 0) {
                linkedToAll = _.intersection(linkedToAll, links);
            }
        });

        return _.flatten(linkedToAll);
    };

    /* reset selection */

    this.resetSelection = function(updateToDefaultView) {
        self.athletesOnFocus = [];
        self.sharedRaces = [];
        self.sharedRacesWinner = [];
        updateToDefaultView();
    };

}]);
