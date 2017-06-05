import React, { Component } from 'react';
import Select from 'react-select';

class NamesComponent extends Component {
  render() {
    return (<div className="column is-one-third">
      <div className="kind-wrapper-names">
        <div className="kind-title">swimmers</div>
        <div className="items-title">
          <span className="radio-label"><input type="radio"
            name="athelete"
            value="all"
            checked={this.props.nameOption === 'all'}
            onChange={this.props.updateNameOption}
          /> All swimmers</span>
          <br/>
          <span className="radio-label"><input type="radio"
            name="athelete"
            value="search"
            checked={this.props.nameOption === 'search'}
            onChange={this.props.updateNameOption}
          /> Swimmers who competed with at least one of the following swimmers</span>
        </div>
        { this.props.nameOption === 'search' && <div className="select-wrapper">
          <Select
            name="form-field-name"
            value=""
            clearable={false}
            options={this.props.list}
            onChange={this.props.addName}
          />
          { this.props.searchedAthletes.map((a, i) => (<div className="selected-list" key={i}>
            <div>
              <span className="selected-list-name">{ a.name } ({ a.country })</span>
              <span onClick={() => this.props.removeName(a.id)} className="typcn typcn-minus"/>
            </div>
          </div>)) }
        </div> }
      </div>
    </div>);
  }
}

export default NamesComponent;