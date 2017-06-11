import React, { Component } from 'react';

class LegendsComponent extends Component {
  render() {
    const { type } = this.props;
    return (<div className="legends">
      <div className="legend-wrapper">
        <span className="cursor-icon" />
        <span className="legend">
          <div className="legend-item">
          { type === 'network' && <span className="legend-network"/> }
          { type === 'country' && <span className="legend-country">
              <span className="r-general r-1 r-first"/>
              <span className="r-general r-2 r-btw"/>
              <span className="r-general r-3 r-btw"/>
              <span className="r-general r-last"/>
            </span> }
          { type === 'races' && <span className="legend-races"/> }
          <span className="legend-label">Swimmer</span>
          </div>
        </span>
      </div>
      <div className="medals">
        <span className="gold"/><span className="medal-label">Gold</span>
        <span className="silver"/><span className="medal-label">Silver</span>
        <span className="bronze"/><span className="medal-label">Bronze</span>
      </div>
    </div>);
  }
}

export default LegendsComponent;