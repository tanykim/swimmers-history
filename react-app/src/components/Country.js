import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import Countries from '../data/countries.json';

class CountryComponent extends Component {

  drawLinear(props) {
    //data
    const { countryList } = props;
    _.each(countryList, (c) => {
      //show flag
      const { country, athletes } = c;
      const code = Countries[country];
      d3.select('#div-country')
        .append('span')
        .html(`${country} <i>${athletes.length}</i>`)
        .attr('class', `${code ? `fl-icon flag-icon-${code.toLowerCase()} ` : ' '} athlete-country`);

      _.each(athletes, (a, i) => {
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
          const lastA = (j === a.records.length - 1 && i === athletes.length - 1) ? true : false;
          d3.select(`#div-country`)
            .append('span')
            .attr('class', `js-a-${a.id} r-general js-r-${r.race_id} r-${r.place} r-${styles[j]}${neighbor ? ' r-neighbor': ''}${lastA ? ' r-a-last' : ''}`)
            .on('mouseover', () => {
              this.props.mouseOverFunc(r.race_id, a.name, r.place);
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

  updateGraph(nextProps) {
    d3.select('#div-country').html('');
    this.drawLinear(nextProps);
  }

  highlightAthletes(ids, status) {
    _.each(ids, (d) => {
      d3.selectAll(`.js-a-${d}`).classed('a-clicked', status);
    })
  }

  componentDidMount() {
    this.drawLinear(this.props);
    if (this.props.clickedIds.length > 0) {
      this.highlightAthletes(this.props.clickedIds, true);
    }
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
      d3.select('.js-country-content').html(nextProps.hoverText);
    }
    //click
    if (nextProps.clicked || this.props !== nextProps.clicked) {
      d3.selectAll(`.js-a-${nextProps.clickedId}`)
        .classed('a-clicked', nextProps.clicked);
    }
    //race selected
    if (this.props.clickedIds !== nextProps.clickedIds) {
      this.highlightAthletes(this.props.clickedIds, false);
      this.highlightAthletes(nextProps.clickedIds, true);
    }
    //sort changes
    if (this.props.countryList !== nextProps.countryList) {
      this.updateGraph(nextProps);
    }
  }

  render() {
    return (
      <div className="country" id="vis-country-width">
        <div className="country-sort">
          <span>Sort countries</span>
          <p className="control">
            <span className="select is-small">
              <select value={this.props.sortCountry} onChange={this.props.sortCountries}>
                <option value="alphabetical">A to Z</option>
                <option value="athletes">Number of swimmers</option>
              </select>
            </span>
          </p>
          <span> then athletes</span>
          <p className="control">
            <span className="select is-small">
              <select value={this.props.sortAthlete} onChange={this.props.sortAthletes}>
                <option value="races">Number of races</option>
                <option value="points">Points (high to low)</option>
                <option value="alphabetical">First name (A to Z)</option>
              </select>
            </span>
          </p>
        </div>
        <div id="div-country" className="country-linear">
        </div>
        <div className="vis-hover js-country-hover">
          <div className="hover-content js-country-content"/>
          <div className="arrow-down"/>
        </div>
      </div>
    );
  }
}

export default CountryComponent;
