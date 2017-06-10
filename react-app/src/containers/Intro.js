import { connect } from 'react-redux';
import _ from 'lodash';
import IntroComponent from '../components/Intro'

const mapStateToProps = (state, ownProps) => (
  {
    gender: state.gender,
    isLoading: state.currentView.isLoading,
    competitions: state.data.competitions,
    meets: state.data.category.meets,
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
  })
}


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(IntroComponent)