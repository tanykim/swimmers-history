import React, { Component } from 'react';

class SummaryComponent extends Component {
  render() {
    const csList = (list) => (
      list.map((item, i) => `${item.slice(1, item.length)}${i < list.length - 1 ? ', ' : ''}`)
    );

    const { count, gender, meets, events, names } = this.props;
    return (
      <div className="summary-list" id="summary-list">
        <span className="summary-gender">{count} {gender.toUpperCase()}</span>
        { //meets
          meets.map((m) => (<span key={m[0]} className="kind kind-events">
          {m[0].slice(1, m[0].length)} - {csList(m[1])}
        </span>)) }
        <span className="typcn typcn-times" />
        { //events
          <span className="kind">{csList(events)}</span>
        }
        { //names
          names.length > 0 && <span><span className="typcn typcn-times" />
            <span className="kind">
              { names.map((name, i) => `${name.name}${ i < this.props.names.length - 1 ? ', ' : ''}`) }
            </span>
        </span> }
      </div>
    );
  }
}

export default SummaryComponent;
