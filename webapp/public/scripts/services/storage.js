'use strict';

angular.module('swimmerApp').service('storage', ['$http', '_', function ($http, _) {

    var self = this;

    //for intro
    this.competition = {};

    var allGenderAthletes;
    var allGenderLinks;

    this.allAthletes = []; //entire athletes of the selected gender
    this.allLinks = []; //entire athletes links
    this.category = {}; //fixed values;

    //for panels
    this.selParent = {};
    this.sel = {};
    this.searchedAthletes = []; //searched athletes

    /* when data is loaded, set all data */

   this.loadData = function (completeDataLoadingCb) {
        $http.get('../data/data.json').then(function (d) {
            console.log('1.storage, data receiverd', d);

            self.competition = d.data.competition;

            allGenderAthletes = d.data.athletes;
            allGenderLinks = d.data.graph;

            self.category = {
                meets: d.data.meets,
                events: d.data.events
            };
            completeDataLoadingCb();
        });
    };

    /* when gender is selected on Intro, start main */

    this.setAthletes = function (gender) {
        self.allAthletes = allGenderAthletes[gender];
        self.allLinks = allGenderLinks[gender];
        console.log('2.storage, save original objects');
    };

    /* set default panel data (sel, selParent & searchedAthletes) */

    this.setPanelDefault = function () {
        _.each(self.category, function (val, kind) {
            self.selParent[kind] = {};
            var vals = _.object(_.map(val, function (d, typeId) {
                var children = _.object(_.map(d.children, function (d) {
                    return [d[0], false];
                }));
                self.selParent[kind][typeId] = false;
                return [typeId, children];
            }));
            self.sel[kind] = vals;
        });

        self.searchedAthletes = [];
    };

    /* set panel data */

    this.setSel = function (selected) {
        _.each(selected, function (vals, kind) {
            //example: kind(meets): '0OG-2016', kind(eventts): '0IND-50Fr'
            _.each(vals, function (val) {
                var sep = val.split('-');
                self.selParent[kind][sep[0]] = true;
                self.sel[kind][sep[0]][sep[1]] = true;
            });
        });
    };

    this.setSearched = function (athletes) {
        self.searchedAthletes = athletes;
    };
}]);
