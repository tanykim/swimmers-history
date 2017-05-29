import { combineReducers } from 'redux';
import _ from 'lodash';
import {
  setInitialSelections,
  getAthletesList,
  setSelections,
  getSearchedAthletes,
  updateSelection,
  cancelSelections,
  getCompetition,
  getRaces,
  getTopAthletes,
  getAthletesData,
  getAthletesByCountry,
  getAthletesLinks,
  getMutualLinkedNodes,
  getConnectedNodes,
  getRaceHoverText,
} from '../helpers/processor';

/* views */
const currentView = (state = { view: 'intro', vis: 'country' }, action) => {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return Object.assign({}, state, { view: action.value, isLoading: false });
    case 'SET_DEFAULT_OPTIONS':
      return Object.assign({}, state, { isLoading: true });
    case 'SET_VIS_VIEW':
      return Object.assign({}, state, { vis: action.value });
    default:
      return state;
  }
};

/* select by gender */
const gender = (state = 'men', action) => {
  switch (action.type) {
    case 'SET_GENDER':
      return action.value;
    default:
      return state;
  }
};

/* option data data */
const options = (state = {}, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      const initSels = setInitialSelections();
      return {
        ...initSels,
        searchedAthletes: [],
        tempSelection: [],
        originalNames: [], //show in the option name
        isOpen: false,
      };
    case 'SET_GENDER':
      const list = getAthletesList(action.value);
      return Object.assign({}, state, { list });
    case 'SET_DEFAULT_OPTIONS':
      let defaultEvents;
      let defaultIds;
      if (action.gender === 'men') {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-a50Fr', '0IND-b100Fr', '0IND-c200Fr', '0IND-d400Fr', '0IND-f1500Fr']
        };
        defaultIds = [];
        // defaultIds = ['4038916', '4038679']; //phelps and lochte
      } else {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-d400Fr', '0IND-e800Fr']
        };
        defaultIds = ['4772552']; //ledecky
      }
      const selections = setSelections(state.sel, state.selParent, defaultEvents);
      const { sel, selParent } = selections;
      const searchedAthletes = getSearchedAthletes(defaultIds, action.gender);
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
      let ts = state.tempSelection;
      ts.push(action.value);
      const updatedSel = updateSelection(action.value, state.sel, false);
      return Object.assign({}, state, {
        tempSelection: ts,
        sel: updatedSel,
      });
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
        tempSelection: [],
        originalNames: state.searchedAthletes
      });
    case 'CANCEL':
      //revert selections to the pverious selection
      return Object.assign({}, state, {
        sel: cancelSelections(state.tempSelection, state.sel),
        searchedAthletes: state.originalNames,
        nameOption: state.originalNames.length > 0 ? 'search' : 'all'}
      );
    default:
      return state;
  }
};

const data = (state = {}, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      const competitions = getCompetition();
      return Object.assign({}, state, { competitions })
    case 'SET_VIS_DATA':
      const { gender, sel, searchedAthletes } = action.value;
      //races filtered by meets/event, for HTML
      const racesInfo = getRaces(sel);
      const athletesData = getAthletesData(gender, racesInfo.races, searchedAthletes);
      //athletes filtered by meet/event or name search - used in panel (athlete count)
      //for vis node size
      const { athletes, pointRange } = athletesData;
      //top athletes by meets/event, for HTML
      const topAthletes = getTopAthletes(athletes);
      const links = getAthletesLinks(gender, athletes, racesInfo.races);
      //network data
      const graph = { nodes: athletes, links };
      //country data
      const athletesByCounty = getAthletesByCountry(athletes);
      return Object.assign({}, state, {
        racesInfo,
        // athletes,
        athletesByCounty,
        pointRange,
        topAthletes,
        graph
      });
    default:
      return state;
  }
};

const graph = (state = { clickedIds: [], isLinksShown: false }, action) => {
  switch(action.type) {
    case 'RESET_GRAPH':
      return Object.assign({}, state, {
        hoverText: '',
        connected: [],
        hovered: false,
        hoveredId: null,
        clicked: false,
        clickedId: null,
        clickedObj: null,
        mutualLinkedNodes: [],
        clickedIds: [],
        isLinksShown: false,
      })
    case 'HOVER_NODE':
      const connected = getConnectedNodes(action.value.id, action.data.links);
      const hoverText = `<i>${action.value.name}</i> swam with <i>${connected.length}</i> swimmer${(connected.length > 1 ? 's' : '')} at <i>${action.value.records.length}</i> races`;
      const hoveredId = action.value.id;
      return Object.assign({}, state, {
        hoverText,
        connected,
        hoveredId,
        hovered: true ,
      })
    case 'UNHOVER_NODE':
      return Object.assign({}, state, {
        hoverText: '',
        hovered: false
      })
    case 'CLICK_NODE':
      const clickedId = action.value.id;
      let prevIds = _.cloneDeep(state.clickedIds);
      let clicked = false;
      if (state.clickedIds.indexOf(clickedId) === -1) {
        clicked = true;
        prevIds.push(clickedId);
      } else {
        _.remove(prevIds, (id) => id === clickedId);
      }
      //nodes will be highlighted
      let nodes = state.mutualLinkedNodes;
      if (state.isLinksShown) {
        nodes = getMutualLinkedNodes(prevIds, action.links);
      }
      return Object.assign({}, state, {
        clicked,
        clickedId,
        clickedObj: action.value,
        mutualLinkedNodes: nodes,
        clickedIds: prevIds,
      })
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

const country = (state = {}, action) => {
  switch(action.type) {
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
  country,
});