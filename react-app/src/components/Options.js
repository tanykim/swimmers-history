import React, { Component } from 'react';
import _ from 'lodash';
import Summary from './Options-summary';
import Panel from './Options-panel';
import Names from './Options-names';

class OptionsComponent extends Component {

  componentWillReceiveProps(nextProps) {
    let s = document.getElementById('options-panels').style;
    let summary = document.getElementById('summary-list').style;
    if (nextProps.isOpen) {
      s.top = `${document.getElementById('options-summary').offsetHeight}px`;
      s.display = 'block';
      //hide summary list
      summary.visibility = 'hidden';
    } else {
      s.display = 'none';
      summary.visibility = 'visible';
    }
  }

  render() {
    return (<div className="columns is-multiline options-wrapper">
      <div className="column is-two-thirds summary" id="options-summary">
        <Summary
          {...this.props.racesInfo}
          names={this.props.originalNames}
          gender={this.props.gender}
          count={this.props.count}
        />
        { this.props.isOpen && <div>
          {this.props.tempCount === undefined ? this.props.count : this.props.tempCount}
        </div> }
      </div>
      <div className="column is-one-third buttons">
        { !this.props.isOpen ?
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
      <div className="column is-12 panels" id="options-panels" style={{ display: 'none' }}>
        { this.props.isOpen && <div className="columns">
          { this.props.optionList.map((kind, i) => <Panel {...this.props} kind={kind} key={i}/>)}
          <Names {...this.props}/>
        </div> }
      </div>
    </div>);
  }
}

export default OptionsComponent;