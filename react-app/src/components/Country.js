import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

class CountryComponent extends Component {

  componentDidMount() {
    this.drawLinear(this.props);
    this.drawGraph(this.props);
  }

  drawLinear(props) {
    //data
    const { byCountry, countries } = props;
    _.each(countries, (country) => {
      d3.select('#div-country')
        .append('span')
        .text(`${country} (${byCountry[country].length})`)
        .attr('class', 'athlete-country');
      _.each(byCountry[country], (a, i) => {
        const styles = a.records.map((r, j) => {
          let s = 'btw';
          if (a.records.length === 1) {
            s = 'single';
          } else if (j === 0) {
            s = 'first';
          } else if (j === a.records.length - 1) {
            s = 'last';
          }
          return s;
        });
        _.each(a.records, (r, j) => {
          const neighbor = (j > 0 && +a.records[j - 1].place < 4 && +r.place < 4) ? true : false;
          const lastA = (j === a.records.length - 1 && i === byCountry[country].length - 1) ? true : false;
          d3.select(`#div-country`)
            .append('span')
            .attr('class', `js-a-${a.id} r-general js-r-${r.race_id} r-${r.place} r-${styles[j]}${neighbor ? ' r-neighbor': ''}${lastA ? ' r-a-last' : ''}`)
            .on('mouseover', () => {
              this.props.mouseOverFunc(r.race_id, a.name);
            })
            .on('mouseout', () => {
              this.props.mouseOutFunc();
            })
            .on('click', () => {
              this.props.clickFunc(a);
            })
        })
      });
    })

  }

  drawGraph(props) {
    //data
    const { byCountry, maxCount, countries, pointRange } = props;

    //set the size
    const w = document.getElementById('vis-country-width').clientWidth;
    let aH = 100;
    let h = aH * maxCount;
    const maxH = Math.round(w * 0.8);
    if (h > maxH) {
      h = maxH;
      aH = maxH / maxCount;
    }
    const margin = { top: 90, right: 60, bottom: 28, left: 20 };
    d3.select('#svg-country').attr('height', h + margin.top + margin.bottom);
    const dim = {
      w: w - margin.right - margin.left,
      h,
    };
    this.dim = dim;
    const svg = d3.select('#country-g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.x = d3.scalePoint().range([0, dim.w]).padding(0.5).domain(countries);
    //draw y axis
    // const y = d3.scaleLinear().range([0, dim.h]).domain([0, maxCount]);
    // const yAxis = d3.axisLeft(y).tickSize(-dim.w);
    // svg.append('g')
    //     .call(yAxis)
    //     .attr('class', 'y axis y-axis');
    //sqrt of the number
    let maxR = Math.min(aH / 2, dim.w / countries.length / 2);
    let minR = 5;
    if (maxR < minR) {
      maxR = minR;
      minR = 2;
    }
    const r = d3.scaleLinear().range([minR * minR, Math.pow(maxR, 2)]).domain(pointRange);
    //draw athletes
    let maxYPos = 0;
    _.each(byCountry, (list, country) => {
      let accH = 0;
      svg.selectAll('.js-athletes')
        .data(list)
        .enter()
        .append('circle')
        .attr('cx', this.x(country))
        .attr('cy', (d, i) => {
          const rad = Math.sqrt(r(d.totalPoint));
          accH += rad * 1.6+ (i === 0 ? minR : 0);
          const yPos = accH;
          accH += rad * 1.6 + (i === list.length - 1 ? minR : 0);
          return yPos;
        })
        .attr('r', (d) => Math.sqrt(r(d.totalPoint)))
        .style('opacity', 0.2)
        .attr('athlete');
      maxYPos = Math.max(accH, maxYPos);
    });

    d3.select('#svg-country').attr('height', maxYPos + margin.top + margin.bottom);
    dim.h = maxYPos;

    //draw x axis
    // this.drawXAxis(countries, dim, svg);

    this.xAxis = d3.axisTop(this.x).tickSize(-dim.h);
    svg.append('g')
      .call(this.xAxis)
      .attr('class', 'x axis x-axis')
      // .attr('transform', `translate(0, ${dim.h})`);
    svg.selectAll('.x-axis text')
      .attr('transform', `rotate(-45)`);

  }

  updateGraph(nextProps) {
    d3.select('#country-g').html('');
    this.drawGraph(nextProps);
    d3.select('#div-country').html('');
    this.drawLinear(nextProps);
  }

  componentWillReceiveProps(nextProps) {
    //option change
    if (this.props.countries !== nextProps.countries) {
      this.updateGraph(nextProps);
      return false;
    }
    //mouse over
    if (this.props.hovered !== nextProps.hovered) {
      d3.selectAll(`.js-r-${nextProps.raceId}`).classed('r-hover', nextProps.hovered);
      d3.select('.js-country-hover')
        .style('display', `${nextProps.hovered ? 'inline-block' : 'none'}`)
        .style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY}px`);
      d3.select('.js-hover-content').html(nextProps.hoverText);
    }
    //click
    console.log(nextProps);
    if (nextProps.clicked || this.props !== nextProps.clicked) {
      d3.selectAll(`.js-a-${nextProps.clickedId}`)
        .classed('a-clicked', nextProps.clicked);
    }

  }

  render() {
    return (
      <div className="country" id="vis-country-width">
        <div id="div-country" className="country-linear">
        </div>
        <div className="country-hover js-country-hover">
          <div className="hover-content js-hover-content"/>
          <div className="arrow-down"/>
        </div>
        <svg id="svg-country" style={{width: '100%'}}>
          <g id="country-g"></g>
        </svg>
      </div>
    );
  }
}

export default CountryComponent;
