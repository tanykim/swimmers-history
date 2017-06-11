import {
  getCategory,
  getYearInfo,
  getRaces,
  getTopAthletes,
  getAthletesData,
  getCountryList,
  sortCountries,
  sortAthletesPerCountry,
  getAthletesByRace,
  getAthletesLinks,
} from '../helpers/processor';

/* vis data */

const data = (state = {}, action) => {
  switch (action.type) {
    case 'INITIALIZE': {
      const category = getCategory();
      const yearInfo = getYearInfo();
      return Object.assign({}, state, { category, yearInfo });
    }
    //show the filtered atheltes number
    case 'SET_TEMP_DATA': {
      const { gender, sel, searchedAthletes } = action.value;
      const racesInfo = getRaces(sel, gender);
      const athletesData = getAthletesData(gender, racesInfo.races, searchedAthletes);
      return Object.assign({}, state, {
        athletesCount: athletesData.athletes.length
      });
    }
    case 'SET_VIS_DATA': {
      const { gender, sel, searchedAthletes } = action.value;
      //races filtered by meets/event, for HTML
      const racesInfo = getRaces(sel, gender);
      const athletesData = getAthletesData(gender, racesInfo.races, searchedAthletes);
      //athletes filtered by meet/event or name search - used in panel (athlete count)
      //for vis node size
      const { athletes, pointRange } = athletesData;
      //top athletes by meets/event, for HTML
      const topAthletes = getTopAthletes(athletes);
      const { links, linksRange } = getAthletesLinks(gender, athletes, racesInfo.races);
      //network data
      const graph = { nodes: athletes, links };
      //country data
      const countryList = getCountryList(athletes);
      //race data
      const athletesByRace = getAthletesByRace(athletes, racesInfo.races, gender);
      //athletes
      return Object.assign({}, state, {
        racesInfo,
        pointRange,
        linksRange,
        topAthletes,
        graph,
        countryList,
        athletesByRace,
      });
    }
    case 'SORT_COUNTRIES': {
      const sorted = sortCountries(state.countryList, action.value);
      return Object.assign({}, state, { countryList: sorted });
    }
    case 'SORT_ATHLETES_PER_COUNTRY': {
      const newSorted = sortAthletesPerCountry(state.countryList, action.value);
      return Object.assign({}, state, { countryList: newSorted });
    }
    default:
      return state;
  }
};

export default data;