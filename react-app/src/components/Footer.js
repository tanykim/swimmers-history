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
          <div className="second-line">
            Read about <a href="https://medium.com/@tanykim/data-visualization-of-elite-swimmers-competition-results-part-1-datasets-bd09b68154c2" target="_blank" rel="noopener noreferrer" >datasets</a> creation, <a href="https://medium.com/@tanykim/data-visualization-of-elite-swimmers-competition-results-part-2-design-dc86d77946b8" target="_blank" rel="noopener noreferrer">visualization design</a> ideation, and discovered <a href="https://medium.com/@tanykim/data-visualization-of-elite-swimmers-competition-results-part-3-insights-7ec5862f48a7" target="_blank" rel="noopener noreferrer">insights</a>
          </div>
          <div className="share-line">
            <span className="icon-title"> Share </span>
            <a href="https://twitter.com/intent/tweet?text=Check out data %23visualization of elite swimmer's network by @tanykim at http%3A%2F%2Ftany.kim/swimmers-history %23dataviz %23d3js %23swimming %23olympics" target="_blank"><span className="typcn typcn-social-twitter-circular"></span></a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Ftany.kim/swimmers-history" target="_blank"><span className="typcn typcn-social-facebook-circular"></span></a>
          </div>
        </div>
      </div>);
  }
}

export default Footer;
