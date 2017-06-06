import React, { Component } from 'react';
import Header from '../containers/Header';
import Options from '../containers/Options';
import Network from '../containers/Network';
import Country from '../containers/Country';
import Race from '../containers/Race';
import Legends from './Legends';
import Results from '../containers/Results';

class VisComponent extends Component {

  render() {
    return (<div>
      <div className="header-wrapper">
        <Header/>
        <div className="container">
          <div className="columns is-multiline">
            <div className="column is-9">
              <Options />
            </div>
            <div className="column is-3">
              <div className="vis-types">
              {['network', 'country', 'race'].map((view) => (
                <div key={view}
                  className={`vis-view ${this.props.visType === view ? 'view-selected': 'l'}`}
                  onClick={() => this.props.switchVis(view)}
                >
                  { view }
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container contents">
        <div className="columns is-multiline">
          <div className="column is-9">
            <div className="vis-wrapper">
              { this.props.visType === 'network' && <Network/> }
              { this.props.visType === 'country' && <Country/> }
              { this.props.visType === 'race' && <Race/> }
            </div>
          </div>
          <div className="column is-3">
            <Legends type={this.props.visType} gender={this.props.gender}/>
            <div className="instruction">
              <div className="instruction-title">
                Investigate swimmers' competition history in the following ways.
              </div>
              <ol>
                <li> Click a swimmer in the visualization </li>
                { this.props.searchedAthletes.length > 0 && <li>
                  Swimmers used for filtering
                  <p className="control">
                    <span className="select is-small">
                      <select onChange={this.props.selectAthlete}>
                        <option value="0">select a swimmer</option>
                        {this.props.searchedAthletes.map((a) => {
                          return (<option key={a.id} value={a.id}>{a.name}</option>);
                        })}
                      </select>
                    </span>
                  </p>
                </li>}
                <li> Top performers
                  <p className="control">
                    <span className="select is-small">
                      <select onChange={this.props.selectAthlete}>
                        <option value="0">select a swimmer</option>
                        {this.props.topAthletes.map((a) => {
                          return (<option key={a.id} value={a.id}>{a.name} ({a.totalPoint} points)</option>);
                        })}
                      </select>
                    </span>
                  </p>
                </li>
                <li>All swimmers in a races (reset previous results)
                  <p className="control">
                    <span className="select is-small">
                      <select onChange={this.props.selectRace}>
                        <option value="0">select a race</option>
                        {this.props.validRaces.map((r) => {
                          const label = r.split('-');
                          return (<option key={r} value={r}>
                              {label[0].slice(1)} {label[1].slice(1)} - {label[label.length - 1].slice(1)}
                            </option>);
                        })}
                      </select>
                    </span>
                  </p>
                </li>
              </ol>
            </div>
          </div>
          { this.props.clickedIds.length > 0 && <div className="column is-12">
              <Results />
            </div> }
        </div>
      </div>
      <div className="footer">
        <div className="container">
          Read about <a>datasets</a> creation, <a>visualization design</a> ideation, and discovered <a>insights</a>
          <br/>
          View code on <a href="https://github.com/tanykim/swimmers-network" target="_blank">GitHub</a>
          <span className="divider">|</span>
          Data from <a href="https://www.swimrankings.net/" target="_blank">Swimranknigs</a>
          <span className="divider">|</span>
          Made by <a href="http://tany.kim" target="_blank">Tanyoung Kim</a>
        </div>
      </div>
    </div>);
  }
}

export default VisComponent;
