import { combineReducers } from 'redux';
import currentView from './currentView';
import options from './options';
import data from './data';
import graph from './graph';
import {
  getConnectedNodes,
  getRaceHoverText,
} from '../helpers/processor';


/* select by gender */
const gender = (state = '', action) => {
  switch (action.type) {
    case 'SET_GENDER':
      return action.value;
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
        sortCountry: 'athletes',
        sortAthlete: 'races',
      });
    case 'HOVER_RACE':
      return Object.assign({}, state, {
        athleteId: action.value.aId,
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
        raceId: action.value.raceId,
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