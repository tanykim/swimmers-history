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
    tempCount: state.data.athletesCount,
    isLoading: state.currentView.isLoading,
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
    update: () => {
      dispatch({ type: 'RESET_GRAPH'})
    },
    cancel: () => {
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
    setTempData: (value) => {
      dispatch({ type: 'SET_TEMP_DATA', value });
    }
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
      if (stateProps.tempCount > 0) {
        dispatchProps.update();
      }
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
    setTempData: () => {
      dispatchProps.setTempData(_.pick(stateProps, ['gender', 'sel', 'searchedAthletes']));
    }
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(OptionsComponent)