import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

class RaceComponent extends Component {

  drawAthlete(g, a, x, y, halfL, strokeW, isOutside, props, raceId) {
    g.append('line')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', y - halfL)
      .attr('y2', y + halfL)
      .attr('class', `js-race-a-${a.id} race-athlete${isOutside ? '-out' : ''}`)
      .style('stroke-width', strokeW)
      .on('mouseover', () => {
        props.mouseOverFunc(raceId, a.name, a.place, a.id, a.records.length);
      })
      .on('mouseout', () => {
        props.mouseOutFunc();
      })
      .on('click', () => {
        props.clickFunc(a);
      });
  }

  drawAthletes(g, x, pDiff, halfL, strokeW, race, raceId, props) {
    _.each(race, (athletes, key) => {
      //show only athletes upto place 8
      const place = +key;
      if (place <= 8) {
        let aY = pDiff * (place - 1)
        //draw athletes in a place; mostly only one, but some are ties
        const gap = 2;
        _.each(athletes, (a, j) => {
          //starting from 270, therfore -90
          const points = { x: x + (strokeW + gap) * j, y: aY}
          this.drawAthlete(g, a, points.x, points.y, halfL, strokeW, false, props, raceId);
        });
      }
    });
  }

  drawRaceLabels(g, aWidth, x, raceId, isFirstMeet, isFirstYear, initialTop, labelDist, h) {
    let y = initialTop;
    let line = g.append('line')
      .attr('x1', x - aWidth / 2)
      .attr('x2', x - aWidth / 2)
      .attr('y1', h)
      .attr('y2', -y)
      .attr('class', 'race-line-race');
    //draw race
    const elms = raceId.split('-');
    g.append('text')
      .attr('x', x)
      .attr('y', -y)
      .text(elms[elms.length - 1].slice(1))
      .attr('class', 'race-label-race');
    //draw year
    if (isFirstYear) {
      y += labelDist;
      g.append('text')
        .attr('x', x)
        .attr('y', -y)
        .text(elms[1].slice(1))
        .attr('class', 'race-label-year');
      line.attr('y2', -y)
        .attr('class', 'race-line-year');
    }
    //draw meet
    if (isFirstMeet) {
      y += labelDist;
      g.append('text')
        .attr('x', x)
        .attr('y', -y)
        .text(elms[0].slice(1))
        .attr('class', 'race-label-meet');
      line.attr('y2', -y)
        .attr('class', 'race-line-meet');
    }
  }

  drawRaceLines(g, left, w, pDiff, isFirst) {
    _.each(_.range(8), (i) => {
      const y = pDiff * i;
      g.append('line')
        .attr('x1', -40)
        .attr('x2', w)
        .attr('y1', y)
        .attr('y2', y)
        .attr('class', `race-place-${i < 3 ? i + 1 : 'others'}`);
      //place circle
      if (isFirst) {
        const r = 10;
        const x = -left + r + 2;
        if (i < 3) {
          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', r)
            .attr('class', `fill-place-${i + 1}`);
        }
        //text
        let text = i + 1;
        g.append('text')
          .attr('x', x)
          .attr('y', y)
          .text(text)
          .attr('class', 'race-place');
      }
    })
  }

  drawGraph(props) {

    const { byRace, validRaces, meetsIndex, yearsIndex } = props;
    //set the size
    const containerW = document.getElementById('vis-race-width').clientWidth;
    const initialTop = 40;
    let margin = { veryTop: 50, top: initialTop, right: 0, bottom: 50, left: 70, extended: 0 };
    let dim = { w: containerW - 100 - margin.left - margin.right };
    let rDiff = 76; //minimum distance between races
    const aWidth = 8; //width of line representing an athlete
    let gId = 0; //row <g> index
    let accWidth = 0; //accumulated width of row after each race
    let accHeight = 0; //accumulated height of rows
    const pDiff = 28; //distance between places
    dim.h = pDiff * 7; //up to place 8

    _.each(validRaces, (r, i) => {

      //draw g of row if not yet drawn
      let g = d3.select(`#race-g-${gId}`);
      if (_.isNull(document.getElementById(`race-g-${gId}`))) {
        g = d3.select('#race-g')
          .append('g')
          .attr('id', `race-g-${gId}`)
          .attr('class', 'race-g-elm');
        //draw race lines
        this.drawRaceLines(g, margin.left, dim.w, pDiff, gId === 0);
      }

      //draw athletes per race
      const race = byRace[r];
      //max number of atheletes in a place, and set a race width
      const maxA = _.max(_.values(race).map((v) => v.length));
      //put a little more distance between races
      const rW = Math.max(maxA * (aWidth + 2) + aWidth, rDiff);
      const halfL = pDiff / 2 - 2; //half of the height of an athlete
      this.drawAthletes(g, accWidth, pDiff, halfL, aWidth, race, r, props);

      //check more than 8 places or DSQ, set extended bottom margin
      let xLineCount = 0;
      //start to display after one place-length distance
      const xGap = pDiff;
      if (_.size(race) > 8 || _.keys(race).indexOf('DSQ') > -1) {
        //get athletes count out of place 8
        const aOutside = _.chain(race)
          .filter((a, p) => +p > 8 || p === 'DSQ')
          .map((a) => a)
          .flatten()
          .sortBy((a) => +a.place)
          .value();
        let addedW = 0;
        _.each(aOutside, (a, i) => {
          const xPos = accWidth + addedW;
          const yPos = (8 + xLineCount) * pDiff + xGap;
          this.drawAthlete(g, a, xPos, yPos, halfL, aWidth, true, props, r);
          addedW += (aWidth + 2);
          //if wider than the race width, move to the next line
          if (addedW + (aWidth + 2) >= rW || i === aOutside.length - 1) {
            xLineCount += 1;
            addedW = 0;
          }
        })
        //extend the margin as the height of the places outside of 8
        margin.extended = xLineCount * pDiff + xGap;
      }

      //check if the race is the first in meets or years
      let isFirstYear = yearsIndex.indexOf(i) > -1 ? true : false;
      let isFirstMeet = meetsIndex.indexOf(i) > -1 ? true : false;
      const labelDist = 20;
      if (isFirstYear) {
        margin.top = Math.max(margin.top, initialTop + labelDist);
      }
      if (isFirstMeet) {
        margin.top = Math.max(margin.top, initialTop + labelDist * 2);
      }

      //draw labels of meet, year, and event
      this.drawRaceLabels(
        g, aWidth, accWidth,
        r, isFirstMeet, isFirstYear,
        initialTop, labelDist, dim.h + halfL + (xLineCount ? xGap + xLineCount * pDiff : 0));

      //translate each row
      d3.select(`#race-g-${gId}`)
        .attr('transform', `translate(${margin.left}, ${margin.top + accHeight})`);

      //accumulated width in one row
      accWidth += rW;
      //check if the width is hit the limit
      if (accWidth > dim.w - rW || i === validRaces.length - 1) {
        accWidth = 0;
        gId += 1;
        accHeight += (dim.h + margin.top + margin.bottom + margin.extended)
        margin.top = initialTop;
      }
    });

    //set the wrappers sizing
    d3.select('#svg-race')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', margin.veryTop + accHeight);
    d3.select('#race-g')
      .attr('transform', `translate(0, ${margin.veryTop})`);
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
    //mouse over/out
    if (this.props.hovered !== nextProps.hovered) {
      d3.selectAll(`.js-race-a-${nextProps.athleteId}`).classed('race-athlete-over', nextProps.hovered);
      d3.select('.js-race-hover')
        .style('display', `${nextProps.hovered ? 'inline-block' : 'none'}`)
        .style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY}px`);
      d3.select('.js-race-content').html(nextProps.hoverText);
      d3.select('.js-race-content-count').html(nextProps.hoverTextCount);
    }
    //click
    if (nextProps.clicked || this.props !== nextProps.clicked) {
      d3.selectAll(`.js-race-a-${nextProps.clickedId}`).classed('race-athlete-clicked', nextProps.clicked);
      if (this.props.isLinksShown) {
        this.highlightElements(this.props, false);
        this.highlightElements(nextProps, true);
      }
    }
  }

  componentDidMount() {
    this.drawGraph(this.props);
    if (this.props.clickedIds.length > 0) {
      //highlight clicked athletes
      _.each(this.props.clickedIds, (d) => {
        d3.selectAll(`.js-race-a-${d}`).classed('race-athlete-clicked', true);
      })
    }
  }

  render() {
    return (<div>
      <div className="race" id="vis-race-width">
        <svg id="svg-race">
          <g id="race-g"></g>
        </svg>
        <div className="vis-hover-double js-race-hover">
          <div className="hover-content js-race-content"/>
          <div className="hover-content second-line js-race-content-count"/>
          <div className="arrow-down"/>
        </div>
      </div>
    </div>);
  }
}

export default RaceComponent;