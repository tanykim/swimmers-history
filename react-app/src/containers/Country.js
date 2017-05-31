import { connect } from 'react-redux';
import CountryComponent from '../components/Country';

const mapStateToProps = (state, ownProps) => {
  const { athletesByCounty, pointRange, graph } = state.data;
  const { clickedId, clicked, clickedIds } = state.graph;
  return {
    ...athletesByCounty,
    pointRange,
    links: graph.links,
    ...state.country,
    clickedId,
    clicked,
    clickedIds,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    mouseOverFunc: (raceId, aName, place) => {
      dispatch({ type: 'HOVER_RACE', value: { raceId, aName, place } })
    },
    mouseOutFunc: (value) => {
      dispatch({ type: 'UNHOVER_RACE' })
    },
    clickFunc: (value, links) => {
      dispatch({ type: 'CLICK_NODE', value, links })
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
  mergeProps)(CountryComponent);