import React, { Component } from 'react';

class HeaderComponent extends Component {

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.gender !== nextProps.gender) {
  //     this.props.setData(nextProps);
  //   }
  // }

  render() {
    return (<div className="header">
      <div className="container">
        <div className="columns">
          <div className="column is-4">
            <div className="logo-title" onClick={() => this.props.goIntro()}>
              <span className="text-swimmer">
                <span>S</span><span>W</span><span>I</span><span>M</span><span>M</span><span>E</span><span>R</span><span>S</span>
              </span>
              <span className="text-network">
                <span>N</span><span>E</span><span>T</span><span>W</span><span>O</span><span>R</span><span>K</span>
              </span>
            </div>
          </div>
          <div className="column is-1 is-offset-7 header-gender">
            <span className="gender-change" onClick={() => this.props.switchGender()}>
              <span className="typcn typcn-arrow-right" />{ this.props.gender === 'women' ? 'men' : 'women' }
            </span>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default HeaderComponent;