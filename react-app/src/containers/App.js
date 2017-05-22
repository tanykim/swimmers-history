import { connect } from 'react-redux';
import AppComponent from '../components/App'

const mapStateToProps = (state, ownProps) => (
  {
    currentView: state.currentView.view
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    init: () => {
      dispatch({ type: 'INITIALIZE' });
      dispatch({ type: 'SET_GENDER', value: 'men' });
    }
  }
)
export default connect(mapStateToProps,
  mapDispatchToProps,
)(AppComponent)