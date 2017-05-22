import { combineReducers } from 'redux';
import _ from 'lodash';
import Data from '../data/data.json';
import { setOptions,
  getRaces,
  getTopAthletes,
  getAthletesData,
  getAthletesLinks,
  getMutualLinkedNodes,
  getConnectedNodes,
} from '../helpers/processor';

/* unchanged data */

const allAthletes = Data.athletes;
const allLinks = Data.graph;
// const allRaces = Data.race;
const { meets, events, competitions } = Data;
const category = { meets, events };

/* views */
const currentView = (state = 'intro', action) => {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return action.value;
    default:
      return state;
  }
};

/* loading default data, visualization generation */

const isLoading = (state = {}, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return Object.assign({}, state, { data: false, intro: false, vis: false });
    case 'SET_DEFAULT_DATA':
      return Object.assign({}, state, { intro: true });
    // case 'SET_VIEW_CHANGE':
    //   return Object.assign({}, state, { [action.from]: false, [action.to]: true });
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
      const sel = {};
      const selParent = {};
      const searchedAthletes = [];
      //set default sel and sellParent as all false;
      _.each(category, (val, kind) => {
        selParent[kind] = {};
        const vals = _.fromPairs(_.map(val, (d, typeId) => {
          const children = _.fromPairs(_.map(d.children, (d) => [d[0], false]));
          selParent[kind][typeId] = false;
          return [typeId, children];
        }));
        sel[kind] = vals;
      });
      return { category, sel, selParent, searchedAthletes, isOpen: false, tempSelection: [], originalNames: [] };
    case 'SET_DEFAULT_OPTIONS':
      let defaultEvents;
      let defaultNames;
      if (action.gender === 'men') {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-a50Fr', '0IND-b100Fr', '0IND-c200Fr', '0IND-d400Fr', '0IND-f1500Fr']
        };
        defaultNames = [];
      } else {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-d400Fr', '0IND-e800Fr']
        };
        defaultNames = ['Kathleen Ledecky'];
      }
      //set sel, selParent, searchedAthletes, originalNames, nameOption
      return Object.assign({}, state,
        setOptions(state, defaultEvents, defaultNames, allAthletes[action.gender])
      );
    case 'TOGGLE_OPTIONS':
      return Object.assign({}, state, { isOpen: action.value });
    case 'SET_SELECTION':
      let ts = state.tempSelection;
      ts.push(action.value);
      const arr = action.value.split(',');
      let updatedSel = state.sel;
      updatedSel[arr[0]][arr[1]][arr[2]] = arr[3] === 'false' ? true : false;
      return Object.assign({}, state, { sel: updatedSel, tempSelection: ts });
    case 'SET_NAME_OPTION':
      return Object.assign({}, state, { nameOption: action.value });
    case 'SET_VIS_DATA':
      //reset temprary selection & temporary names
      return Object.assign({}, state, { tempSelection: [], originalNames: state.searchedAthletes });
    case 'CANCEL':
      let canceledSel = state.sel;
      _.each(state.tempSelection, (d) => {
        const arr = d.split(',');
        canceledSel[arr[0]][arr[1]][arr[2]] = arr[3] === 'false' ? false : true;
      });
      return Object.assign({}, state, { sel: canceledSel, searchedAthletes: state.originalNames, nameOption: state.originalNames.length > 0 ? 'search' : 'all'});
    default:
      return state;
  }
}

const data = (state = {}, action) => {
  const { gender, options } = action;
  switch (action.type) {
    case 'INITIALIZE':
      return Object.assign({}, state, { competitions: competitions })
    case 'SET_VIS_DATA':
      //races filtered by meets/event, for HTML
      const racesInfo = getRaces(options.sel);
      const athletesData = getAthletesData(allAthletes[gender], racesInfo.races, options.searchedAthletes);
      //athletes filtered by meet/event or name search - used in panel (athlete count)
      //for vis node size
      const { athletes, pointRange } = athletesData;
      //top athletes by meets/event, for HTML
      const topAthletes = getTopAthletes(athletes);
      const links = getAthletesLinks(athletes, allLinks[gender], racesInfo.races);
      //graph data
      const graph = { nodes: athletes, links };
      return Object.assign({}, state, { racesInfo, athletes, pointRange, topAthletes, graph });
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
  isLoading,
  gender,
  options,
  data,
  graph,
});