import React, { Component } from 'react';
import Logo from './Logo';

class HeaderComponent extends Component {

  render() {
    return (<div className="header">
      <div className="container">
        <div className="columns">
          <div className="column is-4" onClick={() => this.props.goIntro()}>
            <Logo />
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