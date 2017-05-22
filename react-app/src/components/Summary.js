import React, { Component } from 'react';

class SummaryComponent extends Component {
  render() {
    const csList = (list) => {
      return list.map((item, i) => {
        return (<span key={item}>
          { item.slice(1, item.length) }{ i < list.length - 1 && <span>, </span> }
        </span>)
      })
    }

    return (
      <div className="section">
        { //meets
          this.props.meets.map((m) => (<span key={m[0]}>
          { m[0].slice(1, m[0].length) } - { csList(m[1]) }
        </span>)) }
        <br/>
        { //events
          csList(this.props.events)
        }
        <br/>
        { //names
          this.props.names.map((name, i) => (<span key={i}>
            {name.name} { i < this.props.names.length - 1 && <span>, </span> }
          </span>))
        }
      </div>
    );
  }
}

export default SummaryComponent;
