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
    switchGender: () => {

    }
  }
)

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    goIntro: () => {
      dispatchProps.goIntro();
    },
    switchGender: () => {

    }
  })
}

export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(HeaderComponent)