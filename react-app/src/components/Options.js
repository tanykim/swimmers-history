import React, { Component } from 'react';
import Summary from './Options-summary';
import Panel from './Options-panel';
import Names from './Options-names';

class OptionsComponent extends Component {
  render() {
    return (<div className="columns is-multiline options-wrapper">
      <div className="column is-two-thirds summary">
        <Summary
          {...this.props.racesInfo}
          names={this.props.originalNames}
        />
      </div>
      <div className="column is-one-third buttons">
        { !this.props.isOptionOpen ?
          <a className="button is-small" onClick={this.props.toggle}>
            <span className="typcn typcn-edit"/>MODIFY
          </a> :
          <span>
            <a className="button is-small update" onClick={this.props.update}>
              <span className="typcn typcn-refresh"/>UPDATE
            </a>
            <a className="button is-small cancel" onClick={this.props.cancel}>
              <span className="typcn typcn-times"/>CANCEL
            </a>
          </span> }
      </div>
      { this.props.isOptionOpen && <div className="column is-12 panels">
        <div className="columns">
          { this.props.optionList.map((kind, i) => <Panel {...this.props} kind={kind} key={i}/>)}
          <Names {...this.props}/>
        </div>
      </div> }
    </div>);
  }
}

export default OptionsComponent;