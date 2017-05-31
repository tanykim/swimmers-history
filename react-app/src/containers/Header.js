import { connect } from 'react-redux';
import HeaderComponent from '../components/Header'

const mapStateToProps = (state, ownProps) => (
  {
    gender: state.gender,
    sel: state.options.sel,
    searchedAthletes: state.options.searchedAthletes,
    isOpen: state.options.isOpen,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    goIntro: () => {
      dispatch({ type: 'SET_CURRENT_VIEW', value: 'intro' });
    },
    switchGender: (gender) => {
      dispatch({ type: 'INITIALIZE' });
      dispatch({ type: 'RESET_GRAPH' });
      dispatch({ type: 'SET_GENDER', value: gender });
    },
    setData: (gender) => {
      dispatch({ type: 'SET_DEFAULT_OPTIONS', gender });
    },
    startVis: (value) => {
      dispatch({ type: 'SET_VIS_DATA', value });
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
      dispatchProps.switchGender(stateProps.gender === 'men' ? 'women' : 'men');
    },
    setData: (newGender) => {
      dispatchProps.setData(newGender);
    },
    setVis: (newProps) => {
      dispatchProps.startVis(newProps);
    },
  })
}

export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(HeaderComponent)