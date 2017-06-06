import { connect } from 'react-redux';
import _ from 'lodash';
import OptionsComponent from '../components/Options';
import { getOptionsArray } from '../helpers/processor';

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.options,
    optionList: getOptionsArray(state.options.category, state.options.sel),
    gender: state.gender,
    racesInfo: state.data.racesInfo,
    count: state.data.graph.nodes.length,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    updateSelection: (value) => {
      dispatch({ type: 'SET_SELECTION', value })
    },
    updateNameOption: (value) => {
      dispatch({ type: 'SET_NAME_OPTION', value })
    },
    update: (value) => {
      dispatch({ type: 'RESET_GRAPH'})
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
    toggle: (isOpen) => {
      dispatch({ type: 'TOGGLE_OPTIONS', value: !isOpen });
    },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    updateSelection: (e) => {
      dispatchProps.updateSelection(e.currentTarget.value);
    },
    updateNameOption: (e) => {
      dispatchProps.updateNameOption(e.currentTarget.value);
    },
    update: () => {
      dispatchProps.update({ ...stateProps });
    },
    cancel: () => {
      dispatchProps.cancel();
    },
    addName: (e) => {
      dispatchProps.addName(e.value);
    },
    removeName: (id) => {
      dispatchProps.removeName(id);
    },
    toggleSelParent: (kind, type) => {
      dispatchProps.toggleSelParent(kind, type);
    },
    toggle: () => {
      dispatchProps.toggle(stateProps.isOpen);
    },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(OptionsComponent)