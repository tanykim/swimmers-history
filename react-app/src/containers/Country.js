import { connect } from 'react-redux';
import CountryComponent from '../components/Country';

const mapStateToProps = (state, ownProps) => {
  const { athletesByCounty, pointRange, graph } = state.data;
  const { clickedId, clicked } = state.graph;
  return {
    ...athletesByCounty,
    pointRange,
    links: graph.links,
    ...state.country,
    clickedId,
    clicked,
    // athletes,
    // graphInfo: state.graph,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    mouseOverFunc: (raceId, aName) => {
      dispatch({ type: 'HOVER_RACE', value: { raceId, aName } })
    },
    mouseOutFunc: (value) => {
      dispatch({ type: 'UNHOVER_RACE' })
    },
    clickFunc: (value, links) => {
      dispatch({ type: 'CLICK_NODE', value, links })
    },
    // toggleLinkedNodes: (value, links) => {
    //   dispatch({ type: 'TOGGLE_VIEW', value: value === 'network' ? true : false, links })
    // },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    mouseOverFunc: (raceId, aName) => {
      return dispatchProps.mouseOverFunc(raceId, aName);
    },
    mouseOutFunc: () => {
      return dispatchProps.mouseOutFunc();
    },
    clickFunc: (d) => {
      return dispatchProps.clickFunc(d, stateProps.links);
    },
    // toggleLinkedNodes: (e) => {
    //   return dispatchProps.toggleLinkedNodes(e.currentTarget.value, graph.links);
    // },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(CountryComponent);