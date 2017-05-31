import React, { Component } from 'react';
import Select from 'react-select';

class NamesComponent extends Component {
  render() {
    return (<div className="column is-one-third">
      <div className="kind-wrapper-names">
        <div className="kind-title">athletes</div>
        <div className="items-title">
          <input type="radio"
            name="athelete"
            value="all"
            checked={this.props.nameOption === 'all'}
            onChange={this.props.updateNameOption}
          /> All athletes
          <br/>
          <input type="radio"
            name="athelete"
            value="search"
            checked={this.props.nameOption === 'search'}
            onChange={this.props.updateNameOption}
          /> Athletes who competed with following athletes
        </div>
        { this.props.nameOption === 'search' && <div className="select-wrapper">
          <Select
            name="form-field-name"
            value=""
            clearable={false}
            options={this.props.list}
            onChange={this.props.addName}
          />
          <div className="selected-list">
            { this.props.searchedAthletes.map((a, i) => (<div key={i}>
              { a.name } ({ a.country })
              <span onClick={() => this.props.removeName(a.id)} className="typcn typcn-minus"/>
            </div>)) }
          </div>
        </div> }
      </div>
    </div>);
  }
}

export default NamesComponent;