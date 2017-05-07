import { Injectable } from '@angular/core';
import _ from 'lodash';
import { DataService } from './data.service';
import { getRaces, getAthletesData, getTopAthletes, getAthletesLinks } from './processor';

@Injectable()
export class StoreService {

  //types
  gender: string;
  visType: string;

  //source by gender
  allAthletes: any;
  allLinks: any;
  raceDates: any;

  //panel or name search data
  sel = {};
  selParent = {};
  searchedAthletes = [];

  //for radial visualization
  pointRange = []; //for vis node size
  athletes = []; //athletes filtered by meet/event or name search - used in panel (athlete count)
  races = []; //races filtered by meets/event, for HTML
  topAthletes = []; //top athletes by meets/event, for HTML
  graph: any;

  constructor(private dataService: DataService) {
    //set default sel and sellParent as all false;
    _.each(this.dataService.category, (val, kind) => {
        this.selParent[kind] = {};
        const vals = _.fromPairs(_.map(val, (d, typeId) => {
            const children = _.fromPairs(_.map(d.children, (d) => [d[0], false]));
            this.selParent[kind][typeId] = false;
            return [typeId, children];
        }));
        this.sel[kind] = vals;
    });
  }

  getAthletesData() {
    const { athletes, pointRange } = getAthletesData(this.allAthletes, this.races);
    this.athletes = athletes;
    this.pointRange = pointRange;
    const links = getAthletesLinks(athletes, this.allLinks, this.races);
    this.graph = {
      nodes: this.athletes,
      links
    };
    // console.log(this.graph, this.pointRange);
  }

  setSel(selected) {
    _.each(selected, (vals, kind) => {
        //example: kind(meets): '0OG-a2016', kind(eventts): '0IND-50Fr'
      _.each(vals, (val) => {
        const sep = val.split('-');
        this.selParent[kind][sep[0]] = true;
        this.sel[kind][sep[0]][sep[1]] = true;
      });
    });
    this.races = getRaces(this.sel);
    this.topAthletes = getTopAthletes(this.allAthletes);
    this.getAthletesData();
  }

  setSearched(athletes) {
    this.searchedAthletes = athletes;
    this.topAthletes = athletes;
    this.races = _.uniq(_.flatten(_.map(athletes, (a) => _.map(a.records, 'race_id'))));
    this.getAthletesData();
  }

  //from intro
  setGender(gender, visType) {
    this.gender = gender;
    this.visType = visType || 'radial';
    this.allAthletes = this.dataService.allGenderAthletes[gender];
    this.allLinks = this.dataService.allGenderLinks[gender];
    this.raceDates = this.dataService.allRaces[gender];

    //default setting for men and women
    if (gender === 'men') {
      const defaultEvents = {
        meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
        // events: ['0IND-50Fr', '0IND-100Fr', '0IND-200Fr', '0IND-400Fr', '0IND-1500Fr',
        //   '1TEAM-4X100Fr', '1TEAM-4X200Fr']
        // meets: ['0OG-a2016'],
        events: ['0IND-50Fr', '0IND-100Fr', '0IND-200Fr', '0IND-400Fr', '0IND-1500Fr']
      };
      this.setSel(defaultEvents);
    } else {
      const defaultAthletes = _.filter(this.allAthletes, ['name', 'Kathleen Ledecky']);
      this.setSearched(defaultAthletes);
    }
  }
}
