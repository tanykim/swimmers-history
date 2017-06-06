import { connect } from 'react-redux';
import ResultsComponent from '../components/Results';

const mapStateToProps = (state, ownProps) => {
  return {
    graphInfo: state.graph,
    links: state.data.graph.links,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    removeAthlete: (value, links) => {
      dispatch({ type: 'SELECT_ATHLETE', value, links })
    },
    removeAllAthletes: () => {
      dispatch({ type: 'RESET_GRAPH' })
    },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps.graphInfo,
    removeAthlete: (athlete) => {
      return dispatchProps.removeAthlete(athlete, stateProps.links);
    },
    removeAllAthletes: () => {
      return dispatchProps.removeAllAthletes();
    },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(ResultsComponent)