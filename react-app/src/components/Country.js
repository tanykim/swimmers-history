import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import Tippy from 'tippy.js';
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
            .attr('id', `${a.id}-${r.race_id}`)
            .attr('class', `js-a-${a.id} r-general js-r-${r.race_id} r-${r.place} r-${styles[j]}${neighbor ? ' r-neighbor': ''}${lastA ? ' r-a-last' : ''}`)
            .on('mouseover', () => {
              if ('ontouchstart' in document) {
                return false;
              }
              this.props.mouseOverFunc(r.race_id, a.name, a.id, r.place);
            })
            .on('mouseout', () => {
              if ('ontouchstart' in document) {
                return false;
              }
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
      d3.select(`span[id="${nextProps.athleteId}-${nextProps.raceId}"]`)
        .attr('title', nextProps.hoverText);
      d3.selectAll(`.js-r-${nextProps.raceId}`).classed('r-hover', nextProps.hovered);
      if (nextProps.hovered) {
        Tippy(`span[id="${nextProps.athleteId}-${nextProps.raceId}"]`, {
          arrow: true,
          animation: 'fade',
          size: 'small',
          duration: 0
        });
      }
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
        <div className="country-top">
          <div className="country-total"><strong>{this.props.countryList.length}</strong> Countries</div>
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
        </div>
        <div id="div-country" className="country-linear">
        </div>
      </div>
    );
  }
}

export default CountryComponent;
