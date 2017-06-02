import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

class RaceComponent extends Component {

  //get point on radius
  getPoints(radius, deg) {
    const radian = deg * Math.PI / 180;
    return {
      x: radius * Math.sin(radian),
      y: -1 * radius * Math.cos(radian)
    };
  }

  drawArcLines(svg, maxA, oR, dist) {
    const dy = 5;
    _.each(_.range(10), (i) => {
      const r = oR - dist * i;
      const start = this.getPoints(r, 270); //angle start from 270degree
      const end = this.getPoints(r, maxA - 90);
      const flag = maxA >= 180 ? 1 : 0;
      svg.append('path')
        .attr('d', () => {
          return `M ${start.x} ${start.y} A ${r} ${r} 1 ${flag} 1 ${end.x} ${end.y}`;
        })
        .attr('class', `arc-place-${i < 3 ? i + 1 : 'others'}`);
      //place circle
      if (i < 3) {
        svg.append('circle')
          .attr('cx', start.x)
          .attr('cy', start.y + dy + 6)
          .attr('r', 10)
          .attr('class', `fill-place-${i + 1}`);
      }
      //text
      let text;
      if (i < 8) {
        text = i + 1;
      } else if (i === 9) {
        text = 'DSQ'
      }
      if (text) {
        svg.append('text')
          .attr('x', start.x)
          .attr('y', start.y)
          .attr('dy', dy)
          .text(text)
          .attr('class', 'radial-place');
      }
    });
  }

  drawEvents(svg, oR, aDiff, meetsIndex, yearsIndex) {
    for (let i = 0; i < meetsIndex.length - 1; i++) {
      const mArc = d3.arc()
        .innerRadius(oR + 60)
        .outerRadius(oR + 80)
        .startAngle((aDiff * meetsIndex[i] - 90)* Math.PI / 180)
        .endAngle((aDiff * meetsIndex[i + 1] - 90) * Math.PI / 180);
      svg.append('path')
        .attr('d', mArc)
        .attr('class', `meets-bg`);
    }
    for (let i = 0; i < yearsIndex.length - 1; i++) {
      const yArc = d3.arc()
        .innerRadius(oR + 30)
        .outerRadius(oR + 50)
        .startAngle((aDiff * yearsIndex[i] - 90)* Math.PI / 180)
        .endAngle((aDiff * yearsIndex[i + 1] - 90) * Math.PI / 180);
      svg.append('path')
        .attr('d', yArc)
        .attr('class', `years-bg`);
    }
  }

  drawGraph(props) {
    const { byRace, validRaces, meetsIndex, yearsIndex } = props;
    //set the size
    const w = document.getElementById('vis-race-width').clientWidth;
    const dim = Math.round(w * 0.9);
    d3.select('#svg-race').attr('height', dim);
    let svg = d3.select('#race-g').attr('transform', `translate(${w / 2}, ${dim / 2})`);

    //settings
    const iR = 40;
    const oR = dim / 2 - 100;
    //max angle diff in degree
    let aDiff = 20;
    let maxA = aDiff * validRaces.length;
    if (maxA > 340) {
      maxA = 340;
      aDiff = maxA / validRaces.length;
    }
    //max line length = distance between radial lines
    const dist = (oR - iR) / 9;
    //half of length of line as athlete;
    const halfL = dist / 2 - 2;

    //10 arc lines
    this.drawArcLines(svg, maxA, oR, dist)

    //meets arc
    this.drawEvents(svg, oR, aDiff, meetsIndex, yearsIndex);

    //draw swimmers by race
    _.each(validRaces, (race, i) => {

      let angle = aDiff * i;

      //draw race background
      const arc = d3.arc()
        .innerRadius(iR - halfL * 1.2)
        .outerRadius(oR + halfL * 1.2)
        .startAngle((aDiff * i - 90)* Math.PI / 180)
        .endAngle((aDiff * (i + 1) - 90) * Math.PI / 180)
        .cornerRadius(8);
      svg.append('path')
        .attr('d', arc)
        .attr('class', `race-bg js-race-${race}`);
      const rPoints = this.getPoints(oR, angle - 90);
      const raceText = race.split('-')[race.split('-').length - 1].slice(1);
      svg.append('text')
        .attr('x', rPoints.x)
        .attr('y', rPoints.y)
        .text(raceText)
        .attr('transform', `rotate(${angle}, ${rPoints.x}, ${rPoints.y})`)
        .attr('class', 'race-label');

      //put athletes elements in the center of the race bg
      angle += aDiff / 2;
      //race is an object key by place
      _.each(byRace[race], (athletes, key) => {
        //get radius of the place
        const place = +key;
        let r;
        if (place <= 10) {
          r = oR - dist * (place - 1)
        } else if (place >= 10 || _.isNaN(place)) {
          r = oR - dist * 9;
        }
        //draw athletes in a place; mostly only one, but some are ties
        //gap between tied players, max 5;
        const gap = Math.min(aDiff / (athletes.length + 1), 1.8);
        _.each(athletes, (a, j) => {
          //starting from 270, therfore -90
          const points = this.getPoints(r, angle + j * gap - 90);
          svg.append('line')
            .attr('x1', points.x - halfL)
            .attr('x2', points.x + halfL)
            .attr('y1', points.y)
            .attr('y2', points.y)
            .style('stroke', 'black')
            .style('stroke-width', 8)
            .style('opacity', 0.2)
            .attr('transform', `rotate(${angle}, ${points.x}, ${points.y})`)
            .on('click', () => {
              console.log(a);
            });
          // svg.append('circle')
          //   .attr('cx', points.x)
          //   .attr('cy', points.y)
          //   .attr('r', 6)
          //   .style('opacity', 0.2);
        });
      });
    });

    //byRace

    // _.each(athletes, (a) => {

    //   const placeByRace = _.fromPairs(a.records.map((r) => [r.race_id, +r.place]));
    //   const placeByAllvalidRaces = validRaces.map((r) => [r, placeByRace[r]]);

    //   //draw validRaces of each swimmer, if there's no race, make that
    //   _.each(placeByAllvalidRaces, (race, i) => {
    //     const raceName = race[0];
    //     const place = race[1];
    //     //1st place is the largest art
    //     //if it's disqualified or bigger than 8, position at inner radius
    //     let r;
    //     if (place <= 10) {
    //       r = oR - (oR - iR) / 9 * (place - 1)
    //     } else if (place >= 10 || _.isNaN(place)) {
    //       r = oR - (oR - iR) / 9 * 9;
    //     }

    //     //path to connect all validRaces, used for clicked events
    //     let pathPoints = [];
    //     if (r) {
    //       const points = this.getPoints(r, aDiff * i + aDiff / 2 - 90); //-90 due to start at 270deg
    //       if (a.records.length > 1) {
    //         pathPoints.push(points);
    //       }
    //       //draw swimmer only the race exists
    //       if (!_.isUndefined(place)) {
    //         svg.append('circle')
    //           .attr('cx', points.x)
    //           .attr('cy', points.y)
    //           .attr('r', 4)
    //           .style('opacity', 0.2);
    //       }
    //     }
    //   });
    // });
  }

  updateGraph(nextProps) {
    d3.select('#race-g').html('');
    this.drawGraph(nextProps);
  }

  componentWillReceiveProps(nextProps) {
    //option change
    if (this.props.byRace !== nextProps.byRace) {
      this.updateGraph(nextProps);
      return false;
    }
    // //mouse over/out
    // if (this.props.hovered !== nextProps.hovered) {
    //   _.each(nextProps.connected, (c) => {
    //     const combination = `${Math.min(+c, +nextProps.hoveredId)}-${Math.max(+c, +nextProps.hoveredId)}`;
    //     d3.select(`circle[id="${nextProps.hoveredId}"]`).classed('node-over', nextProps.hovered);
    //     d3.select(`line[id="${combination}"]`).classed('link-over', nextProps.hovered);
    //     d3.select(`circle[id="${c}"]`).classed('node-linked', nextProps.hovered);
    //   });
    //   d3.select('.js-network-hover')
    //     .style('display', `${nextProps.hovered ? 'inline-block' : 'none'}`)
    //     .style('left', `${d3.event.pageX}px`)
    //     .style('top', `${d3.event.pageY}px`);
    //   d3.select('.js-network-content').html(nextProps.hoverText);
    // }
    // //click
    // if (nextProps.clicked || this.props !== nextProps.clicked) {
    //   d3.select(`circle[id="${nextProps.clickedId}"]`).classed('node-clicked', nextProps.clicked);
    //   if (this.props.isLinksShown) {
    //     this.highlightElements(this.props, false);
    //     this.highlightElements(nextProps, true);
    //   }
    // }
    // //removed from the results table
    // if (this.props.clickedIds !== nextProps.clickedIds) {
    //   const removed = _.filter(this.props.clickedIds, (id) => nextProps.clickedIds.indexOf(id) === -1);
    //   _.each(removed, (id) => {
    //     d3.select(`circle[id="${id}"]`).classed('node-clicked', false);
    //     if (this.props.isLinksShown) {
    //       this.highlightElements(this.props, false);
    //       this.highlightElements(nextProps, true);
    //     }
    //   });
    // }
    // //links View
    // if (this.props.isLinksShown !== nextProps.isLinksShown) {
    //   this.highlightElements(nextProps, nextProps.isLinksShown);
    // }
  }

  componentDidMount() {
    this.drawGraph(this.props);
    // if (this.props.clickedIds.length > 0) {
    //   //highlight clicked circle
    //   _.each(this.props.clickedIds, (d) => {
    //     d3.select(`circle[id="${d}"]`).classed('node-clicked', true);
    //   })
    //   //highlight link connection
    //   if (this.props.isLinksShown) {
    //     this.highlightElements(this.props, true);
    //   }
    // }
  }

  render() {
    return (<div>
      <div className="race" id="vis-race-width">
        <svg id="svg-race" style={{width: '100%'}}>
          <g id="race-g"></g>
        </svg>
        <div className="vis-hover js-race-hover">
          <div className="hover-content js-race-content"/>
          <div className="arrow-down"/>
        </div>
      </div>
    </div>);
  }
}

export default RaceComponent;