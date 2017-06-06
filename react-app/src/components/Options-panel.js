import React, { Component } from 'react';

class PanelComponent extends Component {
  render() {
    const { kind, selParent, sel, gender } = this.props;
    return (<div className="column is-one-third">
      <div className={`kind-wrapper-${kind.key}`}>
        <div className="kind-title">{ kind.key }</div>
        { kind.lists.map((type, j) => (<div key={j}>
          <div className="items-title">
            <strong>{ type.type }</strong>
            <span
              className={`typcn typcn-${selParent[kind.key][type.key] ? 'minus' : 'plus'}`}
              onClick={() => this.props.toggleSelParent(kind.key, type.key)}
            />
          </div>
          <ul className="items">
            { type.list.map((item, k) => {
              const isDisabled = (kind.key === 'events' &&
                ((gender === 'women' && k === 5) ||
                (gender === 'men' && k === 4)));
              return (<li key={k}>
                <label className="checkbox">
                  { !isDisabled && <input
                    type="checkbox"
                    checked={sel[kind.key][type.key][item.key]}
                    value={[kind.key, type.key, item.key, sel[kind.key][type.key][item.key]]}
                    onChange={this.props.updateSelection}
                  /> }
                  <span className={isDisabled ? 'list-disabled' : 'list-normal'}>
                    { item.name }
                  </span>
                </label>
              </li>);
            })}
          </ul>
        </div>))}
      </div>
    </div>);
  }
}

export default PanelComponent;