import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

class GraphComponent extends Component {

  dragstarted(d, simulation) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.5).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d, isClicked, simulation) {
    if (!d3.event.active) {
        simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;

    //check simluation status
    if (isClicked === 'true') {
      this.checkSimulationStatus(d.id, simulation);
    }
  }

  moveAthleteName(id) {
    const draggedNode = d3.select(`circle[id="${id}"]`);
    d3.select(`.vis-athlete-name[id="${id}"]`)
        .transition()
        .attr('x', draggedNode.attr('cx'))
        .attr('y', draggedNode.attr('cy'));
  }

  checkSimulationStatus(id, simulation) {
    const selectedNodeId = id;
    //check if simulation stopped every 0.2 second
    const isStopped = () => {
      if (simulation.alpha() < 0.02) {
        this.moveAthleteName(selectedNodeId);
      } else {
        setTimeout(isStopped, 200);
      }
    }
    isStopped();
  }

  ticked(link, node) {
    link.attr('x1', (d) => d.source.x )
      .attr('y1', (d) => d.source.y )
      .attr('x2', (d) => d.target.x )
      .attr('y2', (d) => d.target.y );
    node.attr('cx', (d) => d.x )
      .attr('cy', (d) => d.y );
  }

  showMouseout(obj, d) {
    //return only if it's not unclicked
    // if (obj.attr('clicked') === 'false') {
    //     obj.attr('class', 'node-normal');
    // }
    if (obj.attr('linked') === 'true') {
        obj.attr('class', 'node-all-linked');
    }
    //revert all highlighted (linked) links and nodes
    d3.selectAll('.link-over').attr('class', function () {
        return d3.select(this).attr('linked') === 'true' ? 'link-all-linked' : 'link-normal';
    });
    d3.selectAll('.node-linked').attr('class', function () {
        return d3.select(this).attr('clicked') === 'true' ?
            'node-clicked' : //if previously clicked
            (d3.select(this).attr('linked') === 'true' ? 'node-all-linked' : 'node-normal');
    });
    // document.getElementById('swimmer').innerHTML = '';
  }

  showClick(obj, d) {
      if (obj.attr('clicked') === 'false') { //show
          //clickedIds.push(d.id);
          obj.attr('clicked', 'true').attr('class', 'node-clicked');
          // showAthleteName(obj, d);
          // showAthleteCb(d); //call back to main.js
      } else { //hide
          // var clickedIndex = clickedIds.indexOf(d.id);
          // self.revertFocusedAthlete(clickedIndex, d.id, obj);
          // hideAthleteCb(clickedIndex); //call back to main.js
      }
  }
  componentDidMount() {
    this.drawGraph(this.props);
  }

  drawGraph(props) {
    const { graph, pointRange } = props;

    //set the size
    const w = document.getElementById('vis-width').clientWidth;
    const dim = w * 0.6;
    d3.select('#svg').attr('height', Math.round(w * 0.8));
    let svg = d3.select('#vis-g');

    //1: no animation at first, 0: move more, dispersed
    const decayRange = d3.scaleLinear().range([0.5, 1]).domain([1, 800]);
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d.id)
      .distance(() => dim / 5))
      .velocityDecay(Math.max(Math.min(decayRange(graph.nodes.length), 1), 0.2))
      .force('charge', d3.forceManyBody()
        .strength( -1 * dim / 5)
        .distanceMax(dim / 2)
      )
      .force('center', d3.forceCenter(w / 2, w * 0.8 / 2));

    //link as lines
    let linkG = svg.append('g').attr('id', 'links');
    let link = linkG.selectAll('line')
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', (d) => d.value )
        .attr('class', 'link-normal')
        .attr('id', (d) => `${Math.min(+d.source, +d.target)}-${Math.max(+d.source, +d.target)}`);

    //node as circles
    //set radius size (min: square root 9 = 3), point range min is 700
    let radius = d3.scaleLinear()
      .range([9, graph.nodes.length * 1.9])
      .domain(pointRange);
    let nodeG = svg.append('g').attr('id', 'nodes');
    let self = this;
    let node = nodeG.selectAll('circle')
      .data(graph.nodes)
      .enter().append('circle')
      .attr('id', (d) => d.id)
      .attr('r', (d) => {
        const points = _.map(d.records, 'point');
        const total = _.reduce(points, function (memo, num) {
            return memo + num;
        }, 0);
        return total <= 700 ? 3 : Math.sqrt(radius(total));
      })
      .attr('clicked', 'false')
      .attr('class', 'node-normal')
      .call(d3.drag()
        .on('start', (d) => this.dragstarted(d, simulation))
        .on('drag', this.dragged)
        .on('end', function (d) {
          return self.dragended(d, d3.select(this).attr('clicked'), simulation);
        }))
      .on('mouseover', (d) => {
        if ('ontouchstart' in document) {
          return false;
        }
        this.props.mouseOverFunc(d);
      })
      .on('mouseout', (d) => this.props.mouseOutFunc())
      .on('click', (d) => this.props.clickFunc(d));

    simulation.nodes(graph.nodes).on('tick', () => this.ticked(link, node));
    simulation.force('link').links(graph.links);

    //check the simulation status-->then set loading done
    // checkInitDone(completeLoadingCb);
  }

  updateGraph(nextProps) {
    d3.select('#links').remove();
    d3.select('#nodes').remove();
    this.drawGraph(nextProps);
  }

  highlightElements(props, status) {
    //filter all linked nodes
    d3.selectAll('circle')
      .filter((d) => _.includes(props.mutualLinkedNodes, d.id))
      .classed('node-all-linked', status);
    //highlight links
    _.each(props.clickedIds, (c, i) => {
        //concatnate the previously clicked IDs with added IDs
        //splice its own id
        _.each(props.mutualLinkedNodes.concat(_.cloneDeep(props.clickedIds).splice(i)), (id) => {
          const combination = `${Math.min(+c, +id)}-${Math.max(+c, +id)}`;
          d3.selectAll(`line[id="${combination}"]`).classed('link-all-linked', status);
        });
    });
  }

  componentWillReceiveProps(nextProps) {

    //option change
    if (this.props.graph !== nextProps.graph) {
      this.updateGraph(nextProps);
      return false;
    }

    //mouse over/out
    if (this.props.hovered !== nextProps.hovered) {
      _.each(nextProps.connected, (c) => {
        const combination = `${Math.min(+c, +nextProps.hoveredId)}-${Math.max(+c, +nextProps.hoveredId)}`;
        d3.select(`circle[id="${nextProps.hoveredId}"]`).classed('node-over', nextProps.hovered);
        d3.select(`line[id="${combination}"]`).classed('link-over', nextProps.hovered);
        d3.select(`circle[id="${c}"]`).classed('node-linked', nextProps.hovered);
      });
    }
    //click
    if (nextProps.clicked || this.props !== nextProps.clicked) {
      d3.select(`circle[id="${nextProps.clickedId}"]`).classed('node-clicked', nextProps.clicked);
      if (this.props.isLinksShown) {
        this.highlightElements(this.props, false);
        this.highlightElements(nextProps, true);
      }
    }
    //links View
    if (this.props.isLinksShown !== nextProps.isLinksShown) {
      this.highlightElements(nextProps, nextProps.isLinksShown);
    }
  }

  render() {
    return (
      <div>
        { this.props.clickedIds.length > 1 && <p className="control">
          <label className="radio">
            <input
              type="radio"
              name="highlightElms"
              value="network"
              checked={this.props.isLinksShown}
              onChange={this.props.toggleLinkedNodes} /> Both nodes &amp; edges (network)
          </label>
          <label className="radio">
            <input
              type="radio"
              name="highlightElms"
              value="nodes"
              checked={!this.props.isLinksShown}
              onChange={this.props.toggleLinkedNodes} /> Only nodes (selected swimmers)
          </label>
        </p> }
        <div className="graph" id="vis-width">
          <svg id="svg" style={{width: '100%'}}>
            <g id="vis-g"></g>
          </svg>
          <div className="hovered-swimmer" dangerouslySetInnerHTML={{ __html: this.props.hoverText }} />
        </div>
      </div>
    );
  }
}

export default GraphComponent;
