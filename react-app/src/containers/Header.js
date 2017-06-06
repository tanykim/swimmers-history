import { connect } from 'react-redux';
import HeaderComponent from '../components/Header'

const mapStateToProps = (state, ownProps) => (
  {
    gender: state.gender,
    // sel: state.options.sel,
    // searchedAthletes: state.options.searchedAthletes,
    isLoading: state.currentView.isLoading,
    //isOpen: state.options.isOpen,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    goIntro: () => {
      dispatch({ type: 'SET_CURRENT_VIEW', value: 'intro' });
    },
    switchGender: (value) => {
      // const gender = value.gender === 'men' ? 'women' : 'men';
      dispatch({ type: 'SET_GENDER', value });
      // dispatch({ type: 'INITIALIZE' });
      dispatch({ type: 'SET_DEFAULT_OPTIONS', value });
    // },
    // setData: (value) => {
      dispatch({ type: 'RESET_GRAPH' });
      // dispatch({ type: 'SET_VIS_DATA', value });
    },
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    goIntro: () => {
      dispatchProps.goIntro();
    },
    switchGender: () => {
      // stateProps.gender === 'men' ? 'women' : 'men',
      dispatchProps.switchGender(stateProps.gender === 'men' ? 'women' : 'men');
    },
    // setData: (newProps) => {
    //   dispatchProps.setData(newProps);
    // },
    // setVis: (newProps) => {
    //   dispatchProps.startVis(newProps);
    // },
  })
}

export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(HeaderComponent)