import React, { Component } from 'react';
import scrollToComponent from 'react-scroll-to-component';
import Countries from '../data/countries.json';

class ResultsComponent extends Component {

  scroll() {
    //scroll to the result when a swimmer is selected
    scrollToComponent(this.refs.results, {
      offset: 0,
      align: 'top',
      duration: 400
    });
  }

  componentDidMount() {
    this.scroll();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.clicked && this.props.clickedIds !== nextProps.clickedIds) {
      this.scroll();
    }
  }

  render() {
    const { clickedIds, sharedRaces, clickedObjs, sharedRacesWinner } = this.props;

    return (<div className="results" id="results">
      <div className="remove-all" ref="results">
        <a onClick={() => this.props.removeAllAthletes()}>
          <span className="typcn typcn-delete"></span> Remove all swimmers
        </a>
      </div>
      <div className="table-wrapper">
        { sharedRaces.length === 0 && <div className="no-races">
          These { clickedIds.length } swimmers did not compete with each other
        </div> }
        <table className="race-athlete-table">
          { sharedRaces.length > 0 && <thead>
            <tr className="thead">
              <th colSpan="2" className="result-summary">
                <span className="result-number">{ clickedIds.length }</span> swimmer{ clickedIds.length > 1 ? 's' : '' } &amp; <span className="result-number">{ sharedRaces.length }</span> race{ sharedRaces.length > 1 ? 's' : '' }
              </th>
              { sharedRaces.map((r, i) => (<th className="record" key={i}>
                <span className="race-meet">{ r.split('-')[0].slice(1) }</span>
                  { r.split('-')[1].slice(1) }
                  <span className="dash">-</span>
                  { r.split('-')[4].slice(1) }
                </th>))}
            </tr>
          </thead> }
          <tbody>
            { clickedObjs.map((a, i) => (<tr key={i}>
                <td className="close-icon">
                  <a onClick={() => this.props.removeAthlete(a)}>
                    <span className="typcn typcn-delete"></span>
                  </a>
                </td>
                <td className="athlete">
                  <div>{ a.name }</div>
                  <div>
                    <span className={`${Countries[a.country] ? `fl-icon flag-icon-${Countries[a.country].toLowerCase()}`: ''}`} />
                    <span className="country">{ a.country }</span>
                  </div>
                </td>
                { sharedRaces.map((r, j) => (<td key={j} className={`record${sharedRacesWinner && sharedRacesWinner[j].indexOf(i) > -1 ? ' winner' : ''}`}>
                    <div className="place-wrapper">
                      <span className={`place place${a.records[r].place}`}>
                        { a.records[r].place }
                      </span>
                    </div>
                    <div className="swimtime">{ a.records[r].swimtime }</div>
                  </td>))}
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
  }
}

export default ResultsComponent;