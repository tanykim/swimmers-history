import { combineReducers } from 'redux';
import _ from 'lodash';
import {
  setInitialSelections,
  setSelections,
  getSearchedAthletes,
  updateSelection,
  cancelSelections,
  getCompetition,
  getRaces,
  getTopAthletes,
  getAthletesData,
  getAthletesLinks,
  getMutualLinkedNodes,
  getConnectedNodes,
} from '../helpers/processor';

/* views */
const currentView = (state = { view: 'intro'}, action) => {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return Object.assign({}, state, { view: action.value, isLoading: false });
    case 'SET_DEFAULT_OPTIONS':
      return Object.assign({}, state, { isLoading: true });
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
    case 'SET_DEFAULT_OPTIONS':
      let defaultEvents;
      let defaultNames;
      if (action.gender === 'men') {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-a50Fr', '0IND-b100Fr', '0IND-c200Fr', '0IND-d400Fr', '0IND-f1500Fr']
        };
        // defaultNames = [];
        defaultNames = ['Michael Phelps', 'Ryan Lochte'];
      } else {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-d400Fr', '0IND-e800Fr']
        };
        defaultNames = ['Kathleen Ledecky'];
      }
      const selections = setSelections(state.sel, state.selParent, defaultEvents);
      const { sel, selParent } = selections;
      const searchedAthletes = getSearchedAthletes(defaultNames, action.gender);
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
        nameOption: action.value
      });
    case 'SET_VIS_DATA':
      //reset temprary selection & temporary names
      return Object.assign({}, state, {
        tempSelection: [],
        originalNames: state.searchedAthletes
      });
    case 'CANCEL':
      //revert selections to the pverious selection
      const canceledSel = cancelSelections(state.tempSelection, state.sel);
      return Object.assign({}, state, {
        sel: canceledSel,
        searchedAthletes: state.originalNames,
        nameOption: state.originalNames.length > 0 ? 'search' : 'all'}
      );
    default:
      return state;
  }
}

const data = (state = {}, action) => {
  const { gender, options } = action;
  switch (action.type) {
    case 'INITIALIZE':
      const competitions = getCompetition();
      return Object.assign({}, state, { competitions })
    case 'SET_VIS_DATA':
      //races filtered by meets/event, for HTML
      const racesInfo = getRaces(options.sel);
      const athletesData = getAthletesData(gender, racesInfo.races, options.searchedAthletes);
      //athletes filtered by meet/event or name search - used in panel (athlete count)
      //for vis node size
      const { athletes, pointRange } = athletesData;
      //top athletes by meets/event, for HTML
      const topAthletes = getTopAthletes(athletes);
      const links = getAthletesLinks(gender, athletes, racesInfo.races);
      //graph data
      const graph = { nodes: athletes, links };
      return Object.assign({}, state, {
        racesInfo,
        athletes,
        pointRange,
        topAthletes,
        graph
      });
    default:
      return state;
  }
}

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
}

export default combineReducers({
  currentView,
  gender,
  options,
  data,
  graph,
});