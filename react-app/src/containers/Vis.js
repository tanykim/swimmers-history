import { connect } from 'react-redux';
import VisComponent from '../components/Vis';

const mapStateToProps = (state, ownProps) => (
  {
    visType: state.currentView.vis,
  }
);

export default connect(mapStateToProps)(VisComponent);