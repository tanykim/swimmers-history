import React, { Component } from 'react';

class LegendsComponent extends Component {
  render() {
    const { type, gender } = this.props;
    return (<div className="legends">
      { type === 'network' &&
        <ul>
          <li>Each <strong>circle (node)</strong> means a single swimmer. The size of circle shows the swimmer's points accumulated at the included races.</li>
          <li><strong>Edge (line) </strong> between the two circles means that the two have competed. The more races both of them competed, the thicker the line becomes.</li>
        </ul>
      }
      { type === 'country' &&
        <ul>
          <li>Each <strong>square</strong> is a single race result of a swimmer. 1st (gold), 2nd (silver) and 3rd (bronze) places are filled with the matching medal color.</li>
          <li>Swimmers who competed multiple races are shown as a <strong>rentangle</strong>, connected squares.</li>
        </ul>
      }
      { type === 'race' &&
        <ul>
          <li>Each swimmer is presented as <strong>thin square(s)</strong> over {gender === 'men' ? 'his' : 'her'} place in the race(s) {gender === 'men' ? 'he' : 'she'} competed.</li>
        </ul>
      }
    </div>);
  }
}

export default LegendsComponent;
