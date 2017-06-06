import { connect } from 'react-redux';
import NetworkComponent from '../components/Network';

const mapStateToProps = (state, ownProps) => {
  const { graph, pointRange, linksRange } = state.data;
  return {
    graph, pointRange, linksRange,
    ...state.graph,
    ...state.network,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    mouseOverFunc: (value, data) => {
      dispatch({ type: 'HOVER_NODE', value, data })
    },
    mouseOutFunc: () => {
      dispatch({ type: 'UNHOVER_NODE' })
    },
    clickFunc: (value, links) => {
      dispatch({ type: 'SELECT_ATHLETE', value, links })
    },
    toggleLinkedNodes: (value, links) => {
      dispatch({ type: 'TOGGLE_VIEW', value: value === 'network' ? true : false, links })
    },
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    mouseOverFunc: (d) => {
      return dispatchProps.mouseOverFunc(d, stateProps.graph);
    },
    mouseOutFunc: () => {
      return dispatchProps.mouseOutFunc();
    },
    clickFunc: (d) => {
      return dispatchProps.clickFunc(d, stateProps.graph.links);
    },
    toggleLinkedNodes: (e) => {
      return dispatchProps.toggleLinkedNodes(e.currentTarget.value, stateProps.graph.links);
    },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(NetworkComponent);