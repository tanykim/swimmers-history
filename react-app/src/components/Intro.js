import React, { Component } from 'react';

class IntroComponent extends Component {

  componentDidMount() {
    this.props.setGender();
  }

  // componentWillReceiveProps(nextProps) {
  //   if (!this.props.isLoading && nextProps.isLoading) {
  //     console.log('---------');
  //     nextProps.startVis();
  //   }
  // }

  render() {
    // console.log(this.props.isLoading);
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
                onChange={this.props.setGender} /> Men
            </label>
            <label className="radio" disabled={this.props.isLoading}>
              <input
                type="radio"
                name="gender"
                value="women"
                checked={this.props.gender === 'women'}
                disabled={this.props.isLoading}
                onChange={this.props.setGender} /> Women
            </label>
          </p>
          <a className={`button is-danger is-large ${this.props.isLoading ? 'is-loading' : ''}`}
            onClick={this.props.setDefaultOptions}>
            Generate Visualization
          </a>
        </div>
      </div>
    );
  }
}

export default IntroComponent;
