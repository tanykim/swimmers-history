import { connect } from 'react-redux';
import VisComponent from '../components/Vis'

const mapStateToProps = (state, ownProps) => (
  {
    racesInfo: state.data.racesInfo,
    searchedAthletes: state.options.searchedAthletes,
    isOptionOpen: state.options.isOpen,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    toggle: (isOptionOpen) => {
      dispatch({ type: 'TOGGLE_OPTIONS', value: !isOptionOpen });
    },
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { racesInfo, searchedAthletes, isOptionOpen } = stateProps;
  return Object.assign({}, {
    racesInfo,
    searchedAthletes,
    isOptionOpen,
    toggle: () => {
      dispatchProps.toggle(isOptionOpen);
    }
  })
}

export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(VisComponent)