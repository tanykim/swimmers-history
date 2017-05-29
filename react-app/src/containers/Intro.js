import { connect } from 'react-redux';
import IntroComponent from '../components/Intro'

const mapStateToProps = (state, ownProps) => (
  {
    searchedAthletes: state.options.searchedAthletes,
    nameOption: state.options.nameOption,
    sel: state.options.sel,
    gender: state.gender,
    isLoading: state.currentView.isLoading,
    competition: state.data.competition,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    selectGender: (value) => {
      dispatch({ type: 'SET_GENDER', value });
    },
    setDefaultOptions: (gender) => {
      dispatch({ type: 'SET_DEFAULT_OPTIONS', gender });
    },
    setDefaultData: (value) => {
      dispatch({ type: 'SET_VIS_DATA', value });
      //show loading sign
      setTimeout(() => {
        dispatch({ type: 'SET_CURRENT_VIEW', value: 'vis' })
      }, 1000);
    }
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    selectGender: (e) => {
      dispatchProps.selectGender(e.currentTarget.value);
    },
    sendGenderSelection: () => {
      dispatchProps.setDefaultOptions(stateProps.gender);
    },
    startVis: () => {
      dispatchProps.setDefaultData(stateProps);
    }
  })
}


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(IntroComponent)