import React, { Component } from 'react';
import Select from 'react-select';

class OptionsComponent extends Component {

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
                      { type.list.map((item, k) => {
                        const isDisabled = (kind.key === 'events' &&
                          ((this.props.gender === 'women' && k === 5) ||
                          (this.props.gender === 'men' && k === 4)));
                        return (<li key={k}>
                          <label className="checkbox">
                            { !isDisabled && <input
                                type="checkbox"
                                checked={this.props.sel[kind.key][type.key][item.key]}
                                value={[kind.key, type.key, item.key, this.props.sel[kind.key][type.key][item.key]]}
                                onChange={this.props.updateSelection}
                              /> }
                            { this.props.gender === 'women' && k === 5}
                            <span className={isDisabled ? 'list-disabled' : 'list-normal'}>
                              { item.name }
                            </span>
                          </label>
                        </li>)}
                      )}
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
          { this.props.nameOption === 'search' && <div>
            <Select
              name="form-field-name"
              value="one"
              options={this.props.list}
              onChange={this.props.addName}
            />
            { this.props.searchedAthletes.map((a, i) => (
                <div key={i}>
                  { a.name } ({ a.country })
                  <span onClick={() => this.props.removeName(a.id)}>--</span>
                </div>
              )) }
            </div> }
        </div>
      </div>
    );
  }
}

export default OptionsComponent;