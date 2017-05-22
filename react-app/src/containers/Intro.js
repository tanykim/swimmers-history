import { connect } from 'react-redux';
import _ from 'lodash';
import IntroComponent from '../components/Intro'

const mapStateToProps = (state, ownProps) => (
  {
    gender: state.gender,
    isLoading: state.currentView.isLoading,
    options: state.options,
    competition: state.data.competition
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
    setDefaultData: (options, gender) => {
      dispatch({ type: 'SET_VIS_DATA', options, gender });
      //show loading sign
      setTimeout(() => {
        dispatch({ type: 'SET_CURRENT_VIEW', value: 'vis' })
      }, 1000);
    }
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { gender, isLoading, options } = stateProps;
  return Object.assign({}, {
    isLoading,
    gender,
    selectGender: (e) => {
      dispatchProps.selectGender(e.currentTarget.value);
    },
    sendGenderSelection: () => {
      dispatchProps.setDefaultOptions(gender);
    },
    startVis: () => {
      dispatchProps.setDefaultData(options, gender);
    }
  })
}


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(IntroComponent)