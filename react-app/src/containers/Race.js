import { connect } from 'react-redux';
import RaceComponent from '../components/Race';

const mapStateToProps = (state, ownProps) => {
  const { athletesByRace, graph } = state.data;
  const { clickedId, clicked, clickedIds } = state.graph;
  return {
    links: graph.links,
    ...state.race,
    ...athletesByRace,
    clickedId,
    clicked,
    clickedIds,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    mouseOverFunc: (raceId, aName, place, aId, raceCount) => {
      dispatch({ type: 'HOVER_RACE_ATHLETE', value: { raceId, aName, place, aId, raceCount } })
    },
    mouseOutFunc: () => {
      dispatch({ type: 'UNHOVER_RACE_ATHLETE' })
    },
    clickFunc: (value, links) => {
      dispatch({ type: 'SELECT_ATHLETE', value, links })
    },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    mouseOverFunc: (raceId, aName, place, aId, raceCount) => {
      return dispatchProps.mouseOverFunc(raceId, aName, place, aId, raceCount);
    },
    mouseOutFunc: () => {
      return dispatchProps.mouseOutFunc();
    },
    clickFunc: (d) => {
      return dispatchProps.clickFunc(d, stateProps.links);
    },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(RaceComponent);