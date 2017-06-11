import React, { Component } from 'react';

class Footer extends Component {

  render() {
    return (<div className="footer">
        <div className="container">
          <div>
            View code on <a href="https://github.com/tanykim/swimmers-network" target="_blank" rel="noopener noreferrer" >GitHub</a>
            <span className="divider">|</span>
            Data from <a href="https://www.swimrankings.net/" target="_blank" rel="noopener noreferrer" >Swimranknigs</a>
            <span className="divider">|</span>
            Made by <a href="http://tany.kim" target="_blank" rel="noopener noreferrer" >Tanyoung Kim</a>
          </div>
        </div>
      </div>);
  }
}

export default Footer;


          // <div className="second-line">
          //   Read about <a>datasets</a> creation, <a>visualization design</a> ideation, and discovered <a>insights</a>
          // </div>
