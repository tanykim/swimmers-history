import { connect } from 'react-redux';
import NetworkComponent from '../components/Network';

const mapStateToProps = (state, ownProps) => (
  {
    graphData: state.data,
    graphInfo: state.graph,
  }
);

const mapDispatchToProps = (dispatch) => (
  {
    mouseOverFunc: (value, data) => {
      dispatch({ type: 'HOVER_NODE', value, data })
    },
    mouseOutFunc: () => {
      dispatch({ type: 'UNHOVER_NODE' })
    },
    clickFunc: (value, links) => {
      dispatch({ type: 'CLICK_NODE', value, links })
    },
    toggleLinkedNodes: (value, links) => {
      dispatch({ type: 'TOGGLE_VIEW', value: value === 'network' ? true : false, links })
    },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { graph, pointRange } = stateProps.graphData;
  return Object.assign({}, {
    graph,
    pointRange,
    ...stateProps.graphInfo,
    mouseOverFunc: (d) => {
      return dispatchProps.mouseOverFunc(d, graph);
    },
    mouseOutFunc: () => {
      return dispatchProps.mouseOutFunc();
    },
    clickFunc: (d) => {
      return dispatchProps.clickFunc(d, graph.links);
    },
    toggleLinkedNodes: (e) => {
      return dispatchProps.toggleLinkedNodes(e.currentTarget.value, graph.links);
    },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(NetworkComponent);