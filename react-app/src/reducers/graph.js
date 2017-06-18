import _ from 'lodash';
import {
  getMutualLinkedNodes,
  getSharedRaces,
  getSharedRacesWinner,
  getRacesObjByA,
} from '../helpers/processor';

/* user interaction related data */

const graph = (state = { clickedIds: [], clickedObjs: [], isLinksShown: false }, action) => {
  //clicked & clickedIds are used for all vis types
  switch(action.type) {
    case 'SET_VIS_DATA':
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
      });
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
    case 'TOGGLE_VIEW': //for nework
      const mutualLinkedNodes = getMutualLinkedNodes(state.clickedIds, action.links);
      return Object.assign({}, state, {
        mutualLinkedNodes,
        isLinksShown: action.value,
      })
    default:
      return state;
  }
};

export default graph;