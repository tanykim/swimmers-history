import { connect } from 'react-redux';
import OptionsComponent from '../components/Options';
import { getOptionsArray } from '../helpers/processor';

const mapStateToProps = (state, ownProps) => {
  return {
    list: state.options.list,
    searchedAthletes: state.options.searchedAthletes,
    nameOption: state.options.nameOption,
    sel: state.options.sel,
    optionList: getOptionsArray(state.options.category, state.options.sel),
    gender: state.gender,
  }
}

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
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    updateSelection: (e) => {
      return dispatchProps.updateSelection(e.currentTarget.value);
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
  })
}


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(OptionsComponent)