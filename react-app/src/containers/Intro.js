import { connect } from 'react-redux';
import _ from 'lodash';
import IntroComponent from '../components/Intro'

const mapStateToProps = (state, ownProps) => (
  {
    searchedAthletes: state.options.searchedAthletes,
    //nameOption: state.options.nameOption,
    sel: state.options.sel,
    gender: state.gender,
    isLoading: state.currentView.isLoading,
    competition: state.data.competition,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    setGender: (value) => {
      dispatch({ type: 'SET_GENDER', value });
    },
    setDefaultOptions: (value) => {
      dispatch({ type: 'SET_DEFAULT_OPTIONS', value });
    },
    // startVis: (value) => {
    //   dispatch({ type: 'SET_VIS_DATA', value });
    //   //show loading sign
    //   setTimeout(() => {
    //     dispatch({ type: 'SET_CURRENT_VIEW', value: 'vis' })
    //   }, 500);
    // }
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    setGender: (e) => {
      //default men
      const gender = e ? e.currentTarget.value : 'men';
      dispatchProps.setGender(gender);
    },
    setDefaultOptions: () => {
      dispatchProps.setDefaultOptions(stateProps.gender);
    },
    // startVis: () => {
    //   dispatchProps.startVis(_.pick(stateProps, ['gender', 'sel', 'searchedAthletes']));
    // }
  })
}


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(IntroComponent)