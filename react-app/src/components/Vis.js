import React, { Component } from 'react';
import Header from '../containers/Header';
import Options from '../containers/Options';
import Graph from '../containers/Graph';
import Country from '../containers/Country';

class VisComponent extends Component {
  render() {
    return (<div>
      <div className="header-wrapper">
        <Header/>
        <div className="container">
          <div className="columns is-multiline">
            <div className="column is-3 vis-types">
              {['network', 'country', 'race'].map((view) => (
                <div key={view} className={this.props.visType === view ? 'view-selected': 'view-normal'}>{ view }</div>
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
              { this.props.visType === 'network' && <Graph/> }
              { this.props.visType === 'country' && <Country/> }
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default VisComponent;
