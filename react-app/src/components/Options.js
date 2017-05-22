import React, { Component } from 'react';

class OptionsComponent extends Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.sel !== nextProps.sel) {
      console.log('---------');
    }
  }

  render() {
    return (
      <div className="columns is-multiline options">
        <div className="column is-12">
          <a className="button" onClick={this.props.update} >Update</a>
          <a className="button" onClick={this.props.cancel} >Cancel</a>
        </div>
        { this.props.optionList.map((kind, i) => (
            <div className="column is-one-third" key={i}>
              <strong>{ kind.key }</strong>
              <ul className="select-list">
                { kind.lists.map((type, j) => (
                  <li key={j}>
                    <strong>{ type.type }</strong>
                    <ul>
                      { type.list.map((item, k) => (
                        <li key={k}>
                          <label className="checkbox">
                            <input
                              type="checkbox"
                              checked={this.props.sel[kind.key][type.key][item.key]}
                              value={[kind.key, type.key, item.key, this.props.sel[kind.key][type.key][item.key]]}
                              onChange={this.props.updateSelection}
                            />
                            { item.name }
                          </label>
                        </li>
                      ))}
                    </ul>
                  </li>
                )) }
              </ul>
            </div>
          ))
        }
        <div className="column is-one-third">
          <strong> athletes </strong>
          <div>
            <input type="radio"
              name="athelete"
              value="all"
              checked={this.props.nameOption === 'all'}
              onChange={this.props.updateNameOption}
            /> All athletes <br/>
            <input type="radio"
              name="athelete"
              value="search"
              checked={this.props.nameOption === 'search'}
              onChange={this.props.updateNameOption}
            /> Athletes who competed with following athletes
          </div>
          <div>
            { this.props.nameOption === 'search' &&
              this.props.searchedAthletes.map((a, i) => (
                <div key={i}>{ a.name } ({ a.country })</div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}

export default OptionsComponent;