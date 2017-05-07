import { Injectable } from '@angular/core';
import { Data } from './loader.js';

@Injectable()
export class DataService {

  isDataLoaded = false;

  //data that isn't changed, but use for calculation
  allGenderAthletes: any;
  allGenderLinks: any;
  allRaces: any;

  competitions: any;
  category: any;

  constructor() {
    console.log('Original data', Data);

    this.allGenderAthletes = Data.athletes;
    this.allGenderLinks = Data.graph;
    this.allRaces = Data.race;
    const { meets, events, competitions } = Data;
    this.category = { meets, events };
    this.competitions = competitions;

    this.isDataLoaded = true;
  }
}
