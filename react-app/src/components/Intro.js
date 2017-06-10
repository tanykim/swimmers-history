import React, { Component } from 'react';
import scrollToComponent from 'react-scroll-to-component';
import * as d3 from 'd3';
import _ from 'lodash';
import Logo from './Logo';
import Footer from './Footer';

class IntroComponent extends Component {

  scroll(element) {
    //scroll to the result when a swimmer is selected
    scrollToComponent(this.refs[element], {
      offset: 0,
      align: 'top',
      duration: 400
    });
  }

  getyearIdx (year, h) {
    let yPos;
    if (year % 4 === 0) {
      yPos = 0;
    } else if (year % 4 === 2) {
      yPos = h * 0.4;
    } else {
      yPos = h;
    }
    return yPos;
  }

  getYearY (years, d, i, h) {
    const isEdge = d === 0 || d === years.length - 1 ? true : false;
    //add slight and random offset
    return isEdge ? h / 2 : this.getyearIdx(d, h);
  }

  drawCurves(g, dim, years, x) {
    let line = d3.line()
      .curve(d3.curveCatmullRom)
      .x((d) => x(d))
      .y((d, i) => this.getYearY(years, d, i, dim.h) + (Math.random() * 10 - 5));
    const maxW = 12;
    const lineT1 = d3.line()
      .curve(d3.curveCatmullRom)
      .x((d) => x(d))
      .y((d) => {
        //set the offset different at each point
        let offset = Math.random() * (d % 2 === 0 ? -maxW : maxW);
        return this.getyearIdx(d, dim.h) + offset;
      });
    const lineT2 = d3.line()
      .curve(d3.curveCatmullRom)
      .x((d) => x(d))
      .y((d) => {
        let offset = Math.random() * (d % 2 === 0 ? maxW: -maxW);
        return this.getyearIdx(d, dim.h) + offset;
      });

    //make transition of waves
    const repeat = (wave) => {
      let speed = Math.random() * 700 + 700;
      wave.transition()
        .duration(speed)
        .attr('d', lineT1)
        .transition()
        .duration(speed)
        .attr('d', lineT2)
        .on('end', () => repeat(wave));
    };
    //draw 5 wave lines
    _.each(_.range(5), (i) => {
      let wave = g.append('path')
        .datum(years)
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke-opacity', Math.random() * 0.7 + 0.3)
        //slightly add some offset of the wave lines
        .attr('transform', `translate(0, ${i * 5})`)
        .attr('class', `js-intro-wave-${i} intro-wave`);
      if (i % 2 === 0) {
        //make animation with only half of the lines
        repeat(wave);
      }
    });
  }

  animateSwimmer (g, years, x, dim) {

    const pause = (elapsed, yearIdx) => {
      //stop the anmation
      d3.select('.js-intro-swimmer').interrupt();
      //highlight the meet in the year
      const pY = years[yearIdx];
      const pausedYear = d3.select(`.js-intro-year-${pY}`);
      pausedYear.classed('intro-year-paused', true);
      d3.selectAll(`.js-intro-meet-${pY}`).classed('intro-meet-shown', true)
      //increase year index or move back to the first year if it passes all valid points
      //initially added 2 (beginning) and 3 (end), thus years.length - 5
      const newIdx = yearIdx > years.length - 5 ? 2 : yearIdx + 1;
      //start animation again from the previous points, after delay
      _.delay(() => {
        d3.selectAll(`.js-intro-meet-${pY}`)
          .classed('intro-meet-shown', false)
          .classed('intro-meet-dimmed', true);
        pausedYear.classed('intro-year-paused', false);
        animateCircle(elapsed, newIdx);
      }, 3000);
    };

    //base animated path from the wave
    const xPoints = years.map((d) => x(d)); //get x points of each year
    const path = d3.select('.js-intro-wave-1');
    const translateAlong = (pathNode, elapsed, yearIdx) => {
      const l = pathNode.getTotalLength();
      return () => {
        return (t) => {
          //get the point of the circle at the moment of elapsed time
          const p = pathNode.getPointAtLength((t + elapsed) * l);
          //pase the circle if it's near each year
          if (p.x > xPoints[yearIdx] && p.x < xPoints[yearIdx] + 10) {
            pause(t + elapsed, yearIdx, p);
          }
          return `translate(${p.x},${p.y})`;
        };
      };
    };

    const animateCircle = (elapsed, yearIdx) => {
      d3.select('.js-intro-swimmer')
        .transition()
        .duration(8000)
        .ease(d3.easeLinear)
        .attrTween('transform', translateAlong(path.node(), elapsed, yearIdx))
        .on('end', () => {
          d3.selectAll(`.js-intro-meet`)
            .classed('intro-meet-dimmed', false)
            .classed('intro-meet-hidden', true);
          animateCircle(0, yearIdx);
        });
    };

    //start animate the swimmer circle, pause at the 2nd point of the curve
    animateCircle(0, 2);
  }

  drawYearBg(g, h, margin, xPos) {
    //year line
    g.append('line')
      .attr('x1', xPos)
      .attr('x2', xPos)
      .attr('y1', 0 - margin.top)
      .attr('y2', h + margin.bottom)
      .attr('class', 'intro-year-line');
  }

  drawYear(g, margin, year, xPos, yPos, meets) {
    const angle = year % 2 === 0 ? -45 : 45;
    //year text
    let yG = g.append('g');
    yG.append('rect')
      .attr('x', xPos)
      .attr('y', yPos)
      .attr('width', 42)
      .attr('height', 20)
      .attr('class', `js-intro-years js-intro-year-${year} intro-year-bg`);
    yG.append('text')
      .attr('x', xPos + (year % 2 === 0 ? -4 : 4))
      .attr('y', yPos + (year % 2 === 0 ? -4 : 4))
      .text(year)
      .attr('class', `intro-year-text intro-year-${year % 2 === 0 ? 'top' : 'bottom'}`)
      .attr('transform', `rotate(${year % 2 === 0 ? 180 : 0}, ${xPos}, ${yPos})`);
    yG.attr('transform', `rotate(${angle -90}, ${xPos}, ${yPos})`);
    //meet names
    let mG = g.append('g')
    _.each(meets, (meet, i) => {
      let meetText = mG.append('text')
        .attr('x', xPos)
        .attr('y', yPos + i * 16 + (year % 2 === 0 ? 8 : 0))
        .attr('dy', 6)
        .text(`${meet.meet} - ${meet.location}`)
        .attr('class', `js-intro-meet js-intro-meet-${year} intro-meet-hidden intro-meet-${year % 2 === 0 ? 'top' : 'bottom'}`)
    });
    mG.attr('transform', `rotate(${angle}, ${xPos}, ${yPos})`)
  }

  drawIntroVis(meets, competitions) {
    const w = document.getElementById('intro-vis').clientWidth;
    const margin = { top: 140, right: 0, bottom: 150, left: 0 };
    const dim = { w: w - margin.left - margin.right, h: 100 };
    d3.select('#intro-vis-svg')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);
    const g = d3.select('#intro-vis-g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    let years = _.chain(meets)
      .map((meet) => meet.children.map((c) => +c[0].slice(1)))
      .flatten()
      .uniq()
      .sort()
      .value();
    //add padding 2 at the beginning and 3 at the end
    let firstYear;
    let lastYear;
    _.each(_.range(2), (i) => {
      firstYear = years[0];
      years.unshift(firstYear - 1);
    });
    _.each(_.range(3), (i) => {
      lastYear = years[years.length - 1];
      years.push(lastYear + 1);
    });
    const x = d3.scaleLinear().range([0, dim.w]).domain([firstYear, lastYear]);

    //background for logo
    _.each(_.range(7), (i) => {
      d3.select('#intro-logo-bg')
        .append('path')
        .datum(years)
        .attr('d', d3.line()
          .curve(d3.curveCatmullRom)
          .x((d) => x(d))
          .y((d, i) => this.getYearY(years, d, i, dim.h / 2) + (Math.random() * 10 - 5))
        )
        .style('fill', 'none')
        .style('stroke-opacity', Math.random() * 0.4)
        //slightly add some offset of the wave lines
        .attr('transform', `translate(0, ${10 + i * 5})`)
        .attr('class', `intro-wave-top`);
    });

    //byYear
    let byYear = _.chain(meets)
      .map((meet, key) => meet.children.map((c) => {
          const competition = competitions[`${key}-${c[0]}`];
          return {
            year: c[0].slice(1),
            location: c[1].split(' - ')[1].split('(')[0], //trace city name
            dates: `${competition.startDate} - ${competition.endDate}`,
            meet: meet.name,
          }
        })
      )
      .flatten()
      .groupBy('year')
      .value();

    //draw year bg line
    _.each(byYear, (meets, key) => {
      let xPos = x(+key);
      //draw year bg line
      this.drawYearBg(g, dim.h, margin, xPos);
    });

    //draw curves
    this.drawCurves(g, dim, years, x);

    //draw animated swimmer
    g.append('circle')
      .attr('r', 10)
      .attr('class', 'intro-swimmer js-intro-swimmer');

    //draw year and games
    _.each(byYear, (meets, key) => {
      let year = +key;
      let xPos = x(year);
      let yPos = this.getyearIdx(year, dim.h);
      //draw year bg line
      this.drawYear(g, margin, year, xPos, yPos, meets);
    });

    //animate swimmer
    this.animateSwimmer(g, years, x, dim);
  }

  componentDidMount() {
    this.props.setGender();
    this.drawIntroVis(this.props.meets, this.props.competitions);
  }

  componentWillUnmount() {
    console.log('--------unmount');
    d3.select('.js-intro-swimmer').interrupt();
  }

  render() {
    return (<div className="intro">
      <div className="columns logo-wrapper">
        <div className="logo-bg">
          <svg><g id="intro-logo-bg"></g></svg>
        </div>
        <div className="column is-4 logo-left"> Data Visualization of </div>
        <div className="column is-4">
          <Logo />
        </div>
        <div className="column is-4 logo-right">
          <span className="intro-link" onClick={() => this.scroll('vis')}>Visualization</span>
          <span className="intro-link" onClick={() => this.scroll('datasets')}>Datasets</span>
        </div>
      </div>
      <div className="intro-vis-wrapper" id="intro-vis">
        <svg id="intro-vis-svg">
          <g id="intro-vis-g"/>
        </svg>
      </div>
      <div className="container">
        <div className="columns is-multiline">
          <div className="column is-8 is-offset-2 radio-selection" ref="vis">
            <div>Explore Olympic Games data first</div>
          </div>
          <div className="column is-4 is-offset-2 radio-wrapper">
            <label className="radio" disabled={this.props.isLoading}>
              <input
                type="radio"
                name="gender"
                value="women"
                checked={this.props.gender === 'women'}
                disabled={this.props.isLoading}
                onChange={this.props.setGender} /> <strong>WOMEN</strong>
              <div className="radio-desc">
                All women's free style events in 2016
              </div>
            </label>
          </div>
          <div className="column is-4">
            <label className="radio" disabled={this.props.isLoading}>
              <input
                type="radio"
                name="gender"
                value="men"
                checked={this.props.gender === 'men'}
                disabled={this.props.isLoading}
                onChange={this.props.setGender} /> <strong>MEN</strong>
              <div className="radio-desc">
                Michael Phelps's all individual events <br/>in 2008, 2012 and 2016
              </div>
            </label>
          </div>
          <div className="column is-12 button-wrapper">
            <a className={`button is-large ${this.props.isLoading ? 'is-loading' : ''} intro-button`}
              onClick={this.props.setDefaultOptions}>
              Generate Visualization
            </a>
          </div>
        </div>
      </div>
      <div className="container" ref="datasets">
        Datasets
      </div>
      <Footer />
    </div>);
  }
}

export default IntroComponent;
