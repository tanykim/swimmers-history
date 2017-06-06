import { combineReducers } from 'redux';
import _ from 'lodash';
import {
  setInitialSelections,
  getAthletesList,
  setSelections,
  getSearchedAthletes,
  updateTemporarySelection,
  updateSelection,
  cancelSelections,
  getCompetition,
  getRaces,
  getTopAthletes,
  getAthletesData,
  getCountryList,
  sortCountries,
  sortAthletesPerCountry,
  getAthletesByRace,
  getAthletesLinks,
  getMutualLinkedNodes,
  getConnectedNodes,
  getRaceHoverText,
  getSharedRaces,
  getSharedRacesWinner,
  getRacesObjByA,
} from '../helpers/processor';

/* views */
const currentView = (state = { view: 'intro' }, action) => {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return Object.assign({}, state, { view: action.value, isLoading: false });
    case 'SET_DEFAULT_OPTIONS':
    case 'RESET_GRAPH':
      return Object.assign({}, state, { isLoading: true });
    // case 'SET_VIS_DATA':
    //   return Object.assign({}, state, { isLoading: false });
    case 'SET_GENDER':
      //set a default view depending on gender
      return Object.assign({}, state, { vis: action.value === 'men' ? 'network' : 'country' });
    case 'SET_VIS_VIEW':
      return Object.assign({}, state, { vis: action.value });
    default:
      return state;
  }
};

/* select by gender */
const gender = (state = '', action) => {
  switch (action.type) {
    case 'SET_GENDER':
      return action.value;
    default:
      return state;
  }
};

/* option panels data */
const options = (state = { isOpen: false }, action) => {
  switch (action.type) {
    // case 'INITIALIZE':
    //   const initSels = setInitialSelections();
    //   return {
    //     ...initSels,
    //     searchedAthletes: [],
    //     //tempSelection: [],
    //     originalSel: {},
    //     originalNames: [], //show in the option name
    //   };
    case 'SET_GENDER':
      const initSels = setInitialSelections();
      const list = getAthletesList(action.value);
      return Object.assign({}, state, {
        ...initSels,
        list,
        searchedAthletes: [],
        //tempSelection: [],
        originalSel: {},
        originalNames: [], //show in the option name
      });
    case 'SET_DEFAULT_OPTIONS':
      let defaultEvents;
      let defaultIds;
      if (action.value === 'men') {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-a50Fr', '0IND-b100Fr', '0IND-c200Fr', '0IND-d400Fr', '0IND-f1500Fr',
          '0IND-g100Bk', '0IND-h200Bk', '0IND-i100Br', '0IND-j200Br', '0IND-k100Fly', '0IND-l200Fly',
          '0IND-m200IM', '0IND-n400IM',
          '1TEAM-o4X100Fr', '1TEAM-p4X200Fr', '1TEAM-q4X100M']
        };
        defaultIds = ['4038916']; //phelps
      } else {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012'],
          events: ['0IND-d400Fr', '0IND-e800Fr']
        };
        defaultIds = ['4772552']; //ledecky
      }
      const selections = setSelections(state.sel, state.selParent, defaultEvents);
      const { sel, selParent } = selections;
      const searchedAthletes = getSearchedAthletes(defaultIds, action.value);
      const originalNames = searchedAthletes;
      const nameOption = searchedAthletes.length > 0 ? 'search' : 'all';
      return Object.assign({}, state, {
        sel, selParent,
        searchedAthletes, originalNames,
        nameOption
      });
    case 'TOGGLE_OPTIONS':
      return Object.assign({}, state, {
        isOpen: action.value
      });
    case 'SET_SELECTION':
      // let ts = state.tempSelection;
      // console.log(ts);
      // let arr = action.value.split(',');
      // const ts = updateTemporarySelection(state.tempSelection || [], action.value);
      // console.log('-------', ts);
      // ts.push(action.value);
      // const updatedSel = updateSelection(action.value, state.sel);
      const updatedSel = updateSelection(action.value, state.sel);

      // state.sel[arr[0]][arr[1]][arr[2]] = !state.sel[arr[0]][arr[1]][arr[2]];
      // return state;
      return Object.assign({}, state, { sel: updatedSel });
    case 'SET_NAME_OPTION':
      return Object.assign({}, state, {
        searchedAthletes: action.value === 'all' ? [] : state.searchedAthletes,
        nameOption: action.value
      });
    case 'ADD_ATHLETE':
      return Object.assign({}, state, {
        searchedAthletes: state.searchedAthletes.concat(action.value)
      });
    case 'REMOVE_AHLETE':
      const newSearched = _.reject(state.searchedAthletes, (d) => d.id === action.value);
      return Object.assign({}, state, {
        searchedAthletes: newSearched,
        nameOption: newSearched.length === 0 ? 'all' : state.nameOption,
      });
    case 'SET_VIS_DATA':
      //reset temprary selection & temporary names
      return Object.assign({}, state, {
        // tempSelection: [],
        originalNames: _.cloneDeep(state.searchedAthletes),
        originalSel: _.cloneDeep(state.sel),
        isOpen: false,
      });
    case 'CANCEL':
      //revert selections to the pverious selection
      return Object.assign({}, state, {
        isOpen: false,
        sel: state.originalSel,
        searchedAthletes: state.originalNames,
        nameOption: state.originalNames.length > 0 ? 'search' : 'all'}
      );
    case 'TOGGLE_SEL_PARENT':
      const { kind, type } = action.value;
      const prevVal = state.selParent[kind][type];
      state.selParent[kind][type] = !prevVal;
      const childrenList = state.category[kind][type].children.map((d) => d[0]);
      _.each(childrenList, (d) => {
        state.sel[kind][type][d] = !prevVal;
      });
      return Object.assign({}, state, {
        selParent: state.selParent,
        sel: state.sel,
      });
    default:
      return state;
  }
};

/* vis data management */
const data = (state = {}, action) => {
  switch (action.type) {
    case 'SET_GENDER': {
      const competitions = getCompetition();
      return Object.assign({}, state, { competitions });
    }
    // case 'SET_TEMP_DATA': {
    //   const { gender, sel, searchedAthletes } = action.value;
    //   console.log(searchedAthletes);
    //   const racesInfo = getRaces(sel, gender);
    //   const athletesData = getAthletesData(gender, racesInfo.races, searchedAthletes);
    //   return Object.assign({}, state, {
    //     athletesCount: athletesData.athletes.length
    //   });
    // }
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
      const athletesByRace = getAthletesByRace(athletes, racesInfo.races);
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

/* user interaction related data */
const graph = (state = { clickedIds: [], clickedObjs: [], isLinksShown: false }, action) => {
  //clicked & clickedIds are used for all vis types
  switch(action.type) {
    case 'RESET_GRAPH':
      return Object.assign({}, state, {
        clicked: false,
        clickedId: null,
        mutualLinkedNodes: [],
        clickedIds: [],
        clickedObjs: [],
        isLinksShown: false,
        sharedRaces: [],
        sharedRacesWinner: [],
      })
    case 'SELECT_ATHLETE':
      const clickedId = action.value.id;
      let prevIds = _.cloneDeep(state.clickedIds);
      let prevObjs = _.cloneDeep(state.clickedObjs);
      let clicked = false;
      if (state.clickedIds.indexOf(clickedId) === -1) {
        clicked = true;
        prevIds.unshift(clickedId);
        prevObjs.unshift(getRacesObjByA(action.value));
      } else {
        _.remove(prevIds, (id) => id === clickedId);
        prevObjs = _.reject(prevObjs, (obj) => obj.id === clickedId);
      }
      //nodes will be highlighted
      let nodes = state.mutualLinkedNodes;
      if (state.isLinksShown) {
        nodes = getMutualLinkedNodes(prevIds, action.links);
      }
      let sharedRaces = prevIds.length > 0 ?
        getSharedRaces(prevObjs) :
        [];
      let sharedRacesWinner = sharedRaces.length > 0 ?
        getSharedRacesWinner(sharedRaces, prevObjs) :
        [];
      return Object.assign({}, state, {
        clicked,
        clickedId,
        sharedRaces,
        sharedRacesWinner,
        mutualLinkedNodes: nodes,
        clickedIds: prevIds,
        clickedObjs: prevObjs,
      });
    case 'SELECT_RACE':
      let { id, athletes } = action.value;
      const newClickedIds = athletes.map((a) => a.id);
      const newClickedObjs = athletes.map((a) => getRacesObjByA(a));
      const races = [id];
      const racesWinner = getSharedRacesWinner(races, newClickedObjs);
      return Object.assign({}, state, {
        clickedIds: newClickedIds,
        clickedObjs: newClickedObjs,
        sharedRaces: races,
        sharedRacesWinner: racesWinner,
        clicked: true,
      });
    case 'TOGGLE_VIEW':
      const mutualLinkedNodes = getMutualLinkedNodes(state.clickedIds, action.links);
      return Object.assign({}, state, {
        mutualLinkedNodes,
        isLinksShown: action.value,
      })
    default:
      return state;
  }
};

/* network view specific info */
const network = (state = {}, action) => {
  switch(action.type) {
    case 'HOVER_NODE':
      const connected = getConnectedNodes(action.value.id, action.data.links);
      const hoverText = `${action.value.name} swam with ${connected.length} swimmer${(connected.length > 1 ? 's' : '')} at ${action.value.records.length} race${action.value.records.length > 1 ? 's' : ''}`;
      const hoveredId = action.value.id;
      return Object.assign({}, state, {
        hoverText,
        connected,
        hoveredId,
        hovered: true,
      })
    case 'UNHOVER_NODE':
      return Object.assign({}, state, {
        hoverText: '',
        hovered: false
      })
    default:
      return state;
  }
};

/* country view specific info */
const country = (state = {}, action) => {
  switch(action.type) {
    case 'SET_VIS_DATA':
      return Object.assign({}, state, {
        sortCountry: 'alphabetical',
        sortAthlete: 'races',
      });
    case 'HOVER_RACE':
      return Object.assign({}, state, {
        raceId: action.value.raceId,
        hoverText: getRaceHoverText(action.value),
        hovered: true,
      });
    case 'UNHOVER_RACE':
      return Object.assign({}, state, {
        hoverText: '',
        hovered: false,
      });
    case 'SORT_COUNTRIES':
      return Object.assign({}, state, { sortCountry: action.value });
    case 'SORT_ATHLETES_PER_COUNTRY':
      return Object.assign({}, state, { sortAthlete: action.value });
    default:
      return state;
  }
};

/* race view specific info */
const race = (state = {}, action) => {
  switch(action.type) {
    case 'HOVER_RACE_ATHLETE':
      return Object.assign({}, state, {
        athleteId: action.value.aId,
        hoverText: getRaceHoverText(action.value),
        hoverTextCount: `total ${action.value.raceCount} race${action.value.raceCount > 1 ? 's' : ''}`,
        hovered: true,
      });
    case 'UNHOVER_RACE_ATHLETE':
      return Object.assign({}, state, {
        hoverText: '',
        hoverTextCount: '',
        hovered: false,
      });
    default:
      return state;
  }
};

export default combineReducers({
  currentView,
  gender,
  options,
  data,
  graph,
  network,
  country,
  race,
});