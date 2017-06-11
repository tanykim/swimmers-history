import _ from 'lodash';
import {
  setInitialSelections,
  getAthletesList,
  setSelections,
  getSearchedAthletes,
  updateSelection,
} from '../helpers/processor';

/* option panels data */

const options = (state = { isOpen: false }, action) => {
  switch (action.type) {
    case 'INITIALIZE': {
      const initSels = setInitialSelections();
      return Object.assign({}, state, {
        ...initSels,
      });
    }
    case 'SET_GENDER': {
      const list = getAthletesList(action.value);
      const initSels = setInitialSelections();
      return Object.assign({}, state, {
        list,
        ...initSels,
        searchedAthletes: [],
        originalSel: {},
        origianlSelParent: {},
        originalNames: [], //show in the option name
      });
    }
    case 'SET_DEFAULT_OPTIONS': {
      let defaultEvents;
      let defaultIds;
      if (action.value === 'men') {
        defaultEvents = {
          meets: ['0OG-a2016'],
          events: ['0IND-a50Fr', '0IND-b100Fr', '0IND-c200Fr', '0IND-d400Fr', '0IND-f1500Fr',
          '0IND-g100Bk', '0IND-h200Bk', '0IND-i100Br', '0IND-j200Br', '0IND-k100Fly', '0IND-l200Fly',
          '0IND-m200IM', '0IND-n400IM',
          '1TEAM-o4X100Fr', '1TEAM-p4X200Fr', '1TEAM-q4X100M']
        };
        defaultIds = ['4038916']; //phelps
      } else {
        defaultEvents = {
          meets: ['0OG-a2016', '0OG-e2012', '0OG-i2008'],
          events: ['0IND-k100Fly', '0IND-l200Fly', '0IND-m200IM', '0IND-n400IM']
        };
        defaultIds = []; //ledecky '4772552'
      }
      const selections = setSelections(state.sel, state.selParent, defaultEvents);
      // console.log(selections);
      const { sel, selParent } = selections;
      const searchedAthletes = getSearchedAthletes(defaultIds, action.value);
      const originalNames = searchedAthletes;
      const nameOption = searchedAthletes.length > 0 ? 'search' : 'all';
      return Object.assign({}, state, {
        sel, selParent,
        searchedAthletes, originalNames,
        nameOption
      });
    }
    case 'TOGGLE_OPTIONS': {
      return Object.assign({}, state, {
        isOpen: action.value
      });
    }
    case 'SET_SELECTION': {
      const updatedSel = updateSelection(action.value, _.cloneDeep(state.sel));
      return Object.assign({}, state, { sel: updatedSel });
    }
    case 'SET_NAME_OPTION': {
      return Object.assign({}, state, {
        searchedAthletes: action.value === 'all' ? [] : state.searchedAthletes,
        nameOption: action.value
      });
    }
    case 'ADD_ATHLETE': {
      return Object.assign({}, state, {
        searchedAthletes: state.searchedAthletes.concat(action.value)
      });
    }
    case 'REMOVE_AHLETE': {
      const newSearched = _.reject(state.searchedAthletes, (d) => d.id === action.value);
      return Object.assign({}, state, {
        searchedAthletes: newSearched,
        nameOption: newSearched.length === 0 ? 'all' : state.nameOption,
      });
    }
    case 'SET_VIS_DATA': {
      //reset temprary selection & temporary names
      return Object.assign({}, state, {
        originalNames: _.cloneDeep(state.searchedAthletes),
        originalSel: _.cloneDeep(state.sel),
        originalSelParent: _.cloneDeep(state.selParent),
        isOpen: false,
      });
    }
    case 'CANCEL': {
      return Object.assign({}, state, {
        isOpen: false,
        sel: state.originalSel,
        selParent: state.originalSelParent,
        searchedAthletes: state.originalNames,
        nameOption: state.originalNames.length > 0 ? 'search' : 'all'}
      );
    }
    case 'TOGGLE_SEL_PARENT': {
      const { kind, type } = action.value;
      const prevVal = state.selParent[kind][type];
      state.selParent[kind][type] = !prevVal;
      const childrenList = state.category[kind][type].children.map((d) => d[0]);
      const selCloned = _.cloneDeep(state.sel);
      _.each(childrenList, (d) => {
        selCloned[kind][type][d] = !prevVal;
      });
      return Object.assign({}, state, {
        selParent: state.selParent,
        sel: selCloned,
      });
    }
    default:
      return state;
  }
};

export default options;