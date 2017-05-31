import { connect } from 'react-redux';
import VisComponent from '../components/Vis';

const mapStateToProps = (state, ownProps) => (
  {
    visType: state.currentView.vis,
    clickedIds: state.graph.clickedIds,
  }
);

const mapDispatchToProps = (dispatch) => (
  {
    switchVis: (value) => {
      dispatch({ type: 'SET_VIS_VIEW', value });
    }
  }
);

export default connect(mapStateToProps,
  mapDispatchToProps,
)(VisComponent);