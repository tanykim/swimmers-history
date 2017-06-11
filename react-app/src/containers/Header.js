import { connect } from 'react-redux';
import HeaderComponent from '../components/Header'

const mapStateToProps = (state, ownProps) => (
  {
    gender: state.gender,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    goIntro: () => {
      dispatch({ type: 'SET_CURRENT_VIEW', value: 'intro' });
    },
    switchGender: (value) => {
      dispatch({ type: 'SET_GENDER', value });
      dispatch({ type: 'SET_DEFAULT_OPTIONS', value });
      dispatch({ type: 'RESET_GRAPH' });
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
  })
}

export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(HeaderComponent)