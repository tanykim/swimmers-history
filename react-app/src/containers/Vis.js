import { connect } from 'react-redux';
import VisComponent from '../components/Vis'

const mapStateToProps = (state, ownProps) => (
  {
    visType: state.currentView.vis,
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
  return Object.assign({}, {
    ...stateProps,
    toggle: () => {
      dispatchProps.toggle(stateProps.isOptionOpen);
    }
  })
}

export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(VisComponent)