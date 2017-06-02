import React, { Component } from 'react';
import Header from '../containers/Header';
import Options from '../containers/Options';
import Network from '../containers/Network';
import Country from '../containers/Country';
import Race from '../containers/Race';
import Results from '../containers/Results';

class VisComponent extends Component {
  render() {
    return (<div>
      <div className="header-wrapper">
        <Header/>
        <div className="container">
          <div className="columns is-multiline">
            <div className="column is-3 vis-types">
              {['network', 'country', 'race'].map((view) => (
                <div key={view}
                  className={this.props.visType === view ? 'view-selected': 'view-normal'}
                  onClick={() => this.props.switchVis(view)}
                >
                  { view }
                </div>
              ))}
            </div>
            <div className="column is-9">
              <Options />
            </div>
          </div>
        </div>
      </div>
      <div className="container contents">
        <div className="columns is-multiline">
          <div className="column is-3">
            instructions
          </div>
          <div className="column is-9">
            <div className="vis-wrapper">
              { this.props.visType === 'network' && <Network/> }
              { this.props.visType === 'country' && <Country/> }
              { this.props.visType === 'race' && <Race/> }
            </div>
          </div>
          { this.props.clickedIds.length > 0 && <div className="column is-12">
              <Results />
            </div> }
        </div>
      </div>
    </div>);
  }
}

export default VisComponent;
