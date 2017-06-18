const currentView = (state = { view: 'intro' }, action) => {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return Object.assign({}, state, { view: action.value, isLoading: false });
    case 'SET_DEFAULT_OPTIONS':
      return Object.assign({}, state, { isLoading: true });
    case 'RESET_GRAPH':
      return Object.assign({}, state, { isLoading: true });
    case 'SET_GENDER':
      //set a default view depending on gender
      return Object.assign({}, state, { vis: 'network' });
    case 'SET_VIS_VIEW':
      return Object.assign({}, state, { vis: action.value });
    default:
      return state;
  }
};

export default currentView;