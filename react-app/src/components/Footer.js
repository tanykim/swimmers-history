import React, { Component } from 'react';

class Footer extends Component {

  render() {
    return (<div className="footer">
        <div className="container">
          Read about <a>datasets</a> creation, <a>visualization design</a> ideation, and discovered <a>insights</a>
          <br/>
          View code on <a href="https://github.com/tanykim/swimmers-network" target="_blank">GitHub</a>
          <span className="divider">|</span>
          Data from <a href="https://www.swimrankings.net/" target="_blank">Swimranknigs</a>
          <span className="divider">|</span>
          Made by <a href="http://tany.kim" target="_blank">Tanyoung Kim</a>
        </div>
      </div>);
  }
}

export default Footer;