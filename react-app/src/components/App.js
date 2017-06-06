import React, { Component } from 'react';
import Intro from '../containers/Intro';
import Vis from '../containers/Vis';

class AppComponent extends Component {

  // componentWillMount() {
  //   this.props.init();
  // }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isLoading && nextProps.isLoading) {
      nextProps.startVis();
    }
  }

  render() {
    return (<div>
      { this.props.currentView === 'intro' && <Intro /> }
      { this.props.currentView === 'vis' && <Vis /> }
    </div>);
  }
}

export default AppComponent;
