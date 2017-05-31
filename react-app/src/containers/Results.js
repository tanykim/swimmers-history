import { connect } from 'react-redux';
import ResultsComponent from '../components/Results';

const mapStateToProps = (state, ownProps) => {
  return {
    graphInfo: state.graph,
    links: state.data.graph.links,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    removeAthlete: (value, links) => {
      dispatch({ type: 'CLICK_NODE', value, links })
    },
    removeAllAthletes: () => {
      dispatch({ type: 'RESET_GRAPH' })
    },
    updateSelection: (value) => {
      dispatch({ type: 'SET_SELECTION', value })
    },
    updateNameOption: (value) => {
      dispatch({ type: 'SET_NAME_OPTION', value })
    },
    update: (value) => {
      dispatch({ type: 'RESET_GRAPH'})
      dispatch({ type: 'SET_VIS_DATA', value })
    },
    cancel: (gender, options) => {
      dispatch({ type: 'CANCEL' })
    },
    addName: (value) => {
      dispatch({ type: 'ADD_ATHLETE', value })
    },
    removeName: (value) => {
      dispatch({ type: 'REMOVE_AHLETE', value })
    },
    toggleSelParent: (kind, type) => {
      dispatch( { type: 'TOGGLE_SEL_PARENT', value: { kind, type } })
    },
    toggle: (isOptionOpen) => {
      dispatch({ type: 'TOGGLE_OPTIONS', value: !isOptionOpen });
    },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps.graphInfo,
    removeAthlete: (athlete) => {
      return dispatchProps.removeAthlete(athlete, stateProps.links);
    },
    removeAllAthletes: () => {
      return dispatchProps.removeAllAthletes();
    },
    updateNameOption: (e) => {
      return dispatchProps.updateNameOption(e.currentTarget.value);
    },
    update: () => {
      return dispatchProps.update({ ...stateProps });
    },
    cancel: () => {
      return dispatchProps.cancel();
    },
    addName: (e) => {
      return dispatchProps.addName(e.value);
    },
    removeName: (id) => {
      return dispatchProps.removeName(id);
    },
    toggleSelParent: (kind, type) => {
      return dispatchProps.toggleSelParent(kind, type);
    },
    toggle: () => {
      dispatchProps.toggle(stateProps.isOptionOpen);
    },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(ResultsComponent)