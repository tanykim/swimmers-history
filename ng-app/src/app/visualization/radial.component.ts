import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment';
import _ from 'lodash';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'visualization-radial',
  templateUrl: './radial.component.html',
  styleUrls: ['./radial.component.scss']
})
export class VisualizationRadialComponent implements OnInit {

  // data: any;
  // raceInfo: any;

  constructor(private storeService: StoreService) {}

  drawVis(data, raceInfo, width) {

    //settings
    const iR = 60;
    const oR = width / 2 - 40;
    //max angle diff in degree
    let aDiff = 20;
    let maxA = aDiff * raceInfo.length;
    if (maxA > 320) {
      maxA = 320;
      aDiff = maxA / raceInfo.length;
    }

    //get point on radius
    const getPoints = (radius, deg) => {
      const radian = deg * Math.PI / 180;
      return {
        x: radius * Math.sin(radian),
        y: -1 * radius * Math.cos(radian)
      };
    }

    //get point for the case of no race
    const getMiddlePlace = (races, idx) => {
      let left, right;
      // let left = [idx - 0.5, 3.5];
      // let right = [idx + 0.5, 3.5];

      //find the closest place to the left side
      for (let i = idx - 1; i > 0; i--) {
        if (!_.isNaN(races[i][1]) && !_.isUndefined(races[i][1])) {
          left = [i, races[i][1]];
          break;
        }
      }
      for (let j = idx + 1; j < races.length - 1; j++) {
        if (!_.isNaN(races[j][1]) && !_.isUndefined(races[j][1])) {
          right = [j, races[j][1]];
          break;
        }
      }

      let idxDiff, placeDiff, midPlace;
      if (left && right) {
        idxDiff = right[0] - left[0];
        placeDiff = Math.abs(right[1] - left[1]);
        midPlace = Math.min(left[1], right[1]) + ((idx - left[0]) * placeDiff / idxDiff);
      }
      return midPlace;
    }

    //10 arc lines
    _.each(_.range(10), (i) => {
      const r = oR - (oR - iR) / 9 * i;
      d3.select('#radial-g')
        .append('path')
        .attr('d', function() {
          const start = getPoints(r, 270); //angle start from 270degree
          const end = getPoints(r, maxA - 90);
          const flag = maxA >= 180 ? 1 : 0;
          return `M ${start.x} ${start.y} A ${r} ${r} 1 ${flag} 1 ${end.x} ${end.y}`;
        })
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('opacity', 0.1);
    });

    //draw swimmers
    _.each(data, (d) => {

      //path to connect all races
      let pathPoints = [];
      let validPoints = 0;

      const placeByRace = _.fromPairs(d.records.map((r) => [r.race_id, +r.place]));
      const placeByAllRaces = raceInfo.map((r) => [r, placeByRace[r]]);

      //draw races of each swimmer
      _.each(placeByAllRaces, (race, i) => {
        const raceName = race[0];
        const place = race[1];

        //1st place is the largest art
        //if it's disqualified or bigger than 8, position at inner radius
        //if not placed, find the poisition in between
        let r;
        if (place <= 10) {
          r = oR - (oR - iR) / 9 * (place - 1)
        } else if (place >= 10 || _.isNaN(place)) {
          r = oR - (oR - iR) / 9 * 9;
        // } else if (d.records.length > 1) {
        //   const midPlace = getMiddlePlace(placeByAllRaces, i);
        //   if (midPlace) {
        //     r = oR - (oR - iR) / 9 * midPlace;
        //   }
        //   r = iR;
        // }
        }
        // else if (_.isUndefined(place)) {
        //   r = iR;
        // }

        if (r) {
          const points = getPoints(r, aDiff * i + aDiff / 2 - 90); //-90 due to start at 270deg
          if (d.records.length > 1) {
            pathPoints.push({ x: points.x, y: points.y });
            // if (validPoints === 0) {
            //   pathPoints += `${points.x} ${points.y} C ${points.x - 10} ${points.y - 10}`;
            // } else if (validPoints % 2 === 0) {
            //   pathPoints += ` C ${points.x + 10} ${points.y + 10}`;
            // } else {
            //   pathPoints += ` ${points.x - 10} ${points.y - 10} ${points.x} ${points.y}`;
            // }
          }
          validPoints += 1;
          //put dot only when there's record
          if (!_.isUndefined(place)) {
            d3.select('#radial-g')
              .append('circle')
              .attr('cx', points.x)
              .attr('cy', points.y)
              .attr('r', 4)
              // .style('opacity', 0.2);
          }
        }
      });

      //draw curve
      if (d.records.length > 1) {
        // d3.select('#radial-g')
        //   .datum(pathPoints)
        //   .append('path')
        //   .attr('d', d3.line()
        //     .x((d) => d[0])
        //     .y((d) => d[1])
        //     .curve(d3.curveCardinal)
        //     )
        //   .style('fill', 'none')
        //   .style('stroke', 'black')
        //   .style('stroke-width', '3');
          // .style('stroke-opacity', 0.2);

        const pathStr = _.map(pathPoints, (p, j) => {
          if (j % 2 === 0 && j !== pathPoints.length - 1) {
            const cX = p.x + pathPoints[j + 1].x;
            const cY = p.y + pathPoints[j + 1].y;
            return `${j === 0 ? 'M' :''} ${p.x} ${p.y} C ${cX / 4} ${cY / 4 * 3} ${pathPoints[j + 1].x} ${pathPoints[j + 1].y}`;
          } else {
            return `${p.x} ${p.y}`;
          }
        }).join(' ');
        d3.select('#radial-g')
          .append('path')
          .attr('d', pathStr)
          .style('fill', 'none')
          .style('stroke', 'black');

      }
    });
  }

  ngOnInit(): void {
    //draw g
    const width = document.getElementById('visualization-wrapper').clientWidth;
    d3.select('#radial')
      .attr('width', width)
      .attr('height', width)
      .append('g')
      .attr('transform', `translate(${width/2}, ${width/2})`)
      .attr('id', 'radial-g');

    //set data
    const data = this.storeService.graph.nodes;
    console.log(data, this.storeService.races);
    const raceInfo = this.storeService.races;
    this.drawVis(data, raceInfo, width);

  }
  // title = 'app works!';
}
