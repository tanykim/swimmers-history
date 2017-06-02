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
    mouseOverFunc: (raceId, aName, place) => {
      // dispatch({ type: 'HOVER_RACE', value: { raceId, aName, place } })
    },
    mouseOutFunc: () => {
      //dispatch({ type: 'UNHOVER_NODE' })
    },
    clickFunc: (value, links) => {
      //dispatch({ type: 'CLICK_NODE', value, links })
    },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    mouseOverFunc: (raceId, aName, place) => {
      return dispatchProps.mouseOverFunc(raceId, aName, place);
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