import { connect } from 'react-redux';
import AppComponent from '../components/App'

const mapStateToProps = (state, ownProps) => (
  {
    currentView: state.currentView.view,
    searchedAthletes: state.options.searchedAthletes,
    sel: state.options.sel,
    gender: state.gender,
    isLoading: state.currentView.isLoading,
  }
);

const mapDispatchToProps = (dispatch) => (
  {
    init: () => {
      dispatch({ type: 'INITIALIZE' });
    },
    startVis: (value) => {
      dispatch({ type: 'SET_VIS_DATA', value });
      //show loading sign
      setTimeout(() => {
        dispatch({ type: 'SET_CURRENT_VIEW', value: 'vis' })
      }, 500);
   },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    init: () => {
      dispatchProps.init();
    },
    startVis: () => {
      dispatchProps.startVis(stateProps);
    },
  })
}

export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(AppComponent)