import React, { Component } from 'react';
import _ from 'lodash';
import Summary from './Options-summary';
import Panel from './Options-panel';
import Names from './Options-names';

class OptionsComponent extends Component {

  componentWillReceiveProps(nextProps) {
    let panel = document.getElementById('options-panels').style;
    let summary = document.getElementById('summary-list').style;
    if (nextProps.isOpen) {
      panel.top = `${document.getElementById('options-summary').offsetHeight}px`;
      panel.display = 'block';
      //hide summary list
      summary.visibility = 'hidden';
    } else {
      panel.display = 'none';
      summary.visibility = 'visible';
    }

    if(!_.isEqual(this.props.sel, nextProps.sel) ||
      !_.isEqual(this.props.searchedAthletes, nextProps.searchedAthletes) ) {
      nextProps.setTempData();
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
        { this.props.isOpen && <div className="temp-count">
          <span className="count">
            {this.props.tempCount === undefined ? this.props.count : this.props.tempCount}
          </span> { this.props.gender } swimmers found.
          { this.props.tempCount === 0 && <span className="count-warning"> Modify your selection.</span>}
        </div> }
      </div>
      <div className="column is-one-third buttons">
        { !this.props.isOpen ?
          <a className="button is-small" onClick={this.props.toggle}>
            <span className="typcn typcn-edit"/>MODIFY
          </a> :
          <span>
            <a className="button is-small update" onClick={this.props.update} disabled={this.props.tempCount === 0}>
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