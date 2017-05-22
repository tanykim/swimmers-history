import { connect } from 'react-redux';
import OptionsComponent from '../components/Options';
import { getOptionsArray } from '../helpers/processor';

const mapStateToProps = (state, ownProps) => {
  return {
    options: state.options,
    gender: state.gender,
    optionList: getOptionsArray(state.options.category, state.options.sel),
    sel: state.options.sel
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
    update: (gender, options) => {
      dispatch({ type: 'RESET_GRAPH'})
      dispatch({ type: 'SET_VIS_DATA', gender, options })
    },
    cancel: (gender, options) => {
      dispatch({ type: 'CANCEL' })
    },
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { options, optionList, sel, gender } = stateProps;
  return Object.assign({}, {
    searchedAthletes: options.searchedAthletes,
    nameOption: options.nameOption,
    optionList,
    sel,
    updateSelection: (e) => {
      return dispatchProps.updateSelection(e.currentTarget.value);
    },
    updateNameOption: (e) => {
      return dispatchProps.updateNameOption(e.currentTarget.value);
    },
    update: () => {
      return dispatchProps.update(gender, options);
    },
    cancel: () => {
      return dispatchProps.cancel();
    },
  })
}


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(OptionsComponent)