import React, { Component } from 'react';

class IntroComponent extends Component {
  render() {
    return (
      <div className="section">
        <div className="container">
          <h1> swimmer's network </h1>
          <p className="control">
            <label className="radio" disabled={this.props.isLoading}>
              <input
                type="radio"
                name="gender"
                value="men"
                checked={this.props.gender === 'men'}
                disabled={this.props.isLoading}
                onChange={this.props.selectGender} /> Men
            </label>
            <label className="radio" disabled={this.props.isLoading}>
              <input
                type="radio"
                name="gender"
                value="women"
                checked={this.props.gender === 'women'}
                disabled={this.props.isLoading}
                onChange={this.props.selectGender} /> Women
            </label>
          </p>
          <a className={`button is-danger is-large ${this.props.isLoading ? 'is-loading' : ''}`}
            onClick={this.props.sendGenderSelection}>
            Generate Visualization { this.props.isLoading }
          </a>
        </div>
      </div>
    );
  }
}

export default IntroComponent;
