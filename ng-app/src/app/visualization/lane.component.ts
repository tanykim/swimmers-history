import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment';
import _ from 'lodash';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'visualization-lane',
  templateUrl: './radial.component.html',
  styleUrls: ['./radial.component.scss']
})
export class VisualizationLaneComponent implements OnInit {

  constructor(private storeService: StoreService) {}

  drawVis(data, raceInfo, width, placeDist, noLanes) {

    //10 lanes

    const startGap = 20;
    _.each(_.range(noLanes + 1), (i) => {
      //lines start after and end before the startGap
      d3.select('#radial-g')
        .append('line')
        .attr('x1', startGap)
        .attr('x2', width - startGap)
        .attr('y1', placeDist * i)
        .attr('y2', placeDist * i)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('opacity', 0.1);
      //put ranking number
      d3.select('#radial-g')
        .append('text')
        .attr('x', startGap)
        .attr('y', placeDist * i + startGap / 2)
        .text(i < 8 ? i + 1 : (i === 8 ? '+8' : 'DSQ'))
        .attr('transform', `rotate(90 ${startGap} ${placeDist * i})`)
        .style('text-anchor', 'middle');
    });

    //draw swimmers

    //first dot starts after the startGap from the begining of the line, those times 3
    let raceDist = (width - startGap * 3) / (raceInfo.length - 1);

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

        //1st place is the first ine
        //if it's disqualified - last line
        let p;
        if (place <= 10) {
          p = placeDist * (place - 1);
        } else if (place >= 10) {
          p = placeDist * 8;
        } else if (_.isNaN(place)) {
          p = placeDist * 9;
        }

        //put dot only when there's record
        if (!_.isUndefined(place)) {
          const points = { x: i * raceDist + startGap * 2, y: p, index: i };
          if (d.records.length > 1) {
            pathPoints.push(points);
          }
          validPoints += 1;
          d3.select('#radial-g')
            .append('circle')
            .attr('cx', points.x)
            .attr('cy', points.y)
            .attr('r', 4)
            .attr('title', i);
        }
      });

      //draw curve
      if (d.records.length === 3) {
        let prevDir;
        const pathStr = _.map(pathPoints, (p, j) => {
          let path;
          let lX, lY, cX, cY, nX, nY, yDiff, indexDiff;
          if (j === 0) {
            path = `M ${p.x} ${p.y}`;
          } else {
            lX = pathPoints[j - 1].x;
            lY = pathPoints[j - 1].y;
            cX = lX + (p.x - lX) / 2;
            cY = lY + (p.y - lY) / 2;
            nX = p.x;
            nY = p.y;
            yDiff = !_.isUndefined(prevDir) ? nY - lY <=0 : nY - lY > 0;
            indexDiff = p.index - pathPoints[j - 1].index;
          }
          if (!path) {
            //x and y delta
            const xDelta = raceDist * indexDiff;
            // const yDelta = nY - lY;
            const diagonal = Math.sqrt(xDelta * xDelta);

            // path = `Q ${lX + diagonal * Math.sin(cX - lX) / 2} ${lY + diagonal * Math.cos(cY - lY) * (yDiff ? 1 : -1) }, ${cX} ${cY} T ${nX} ${nY}`;

            path = `Q ${lX + (cX - lX) / 2 } ${lY + diagonal * 0.2 / (cY - lY + 1)}, ${cX} ${cY} T ${nX} ${nY}`;
            // path = `Q ${lX + (cX - lX) / 2} ${lY + 10 * (yDiff ? 1 : -1)}, ${cX} ${cY} T ${nX} ${nY}`;
          }
          return path;
        }).join(' ');
        // d3.select('#radial-g')
        //   .append('path')
        //   .attr('d', pathStr)
        //   .style('fill', 'none')
        //   .style('stroke', 'black');
        d3.select('#radial-g')
          .datum(pathPoints)
          .append('path')
          .attr('d', d3.line()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveCardinal)
            )
          .style('fill', 'none')
          .style('stroke', 'black');
      }
    });
  }

  ngOnInit(): void {
    //draw g
    const wWidth = document.getElementById('visualization-wrapper').clientWidth;
    const placeDist = 28; //distance between two lanes
    const noLanes = 9;
    const height = placeDist * noLanes;
    const width =  wWidth * Math.sqrt(2) - height;

    d3.select('#radial')
      .attr('width', wWidth)
      .attr('height', wWidth)
      .append('g')
      .attr('transform', `translate(0 ${wWidth - height / Math.sqrt(2)}) rotate(-45)`)
      .attr('id', 'radial-g');

    //set data
    const data = this.storeService.graph.nodes;
    const raceInfo = this.storeService.races;
    this.drawVis(data, raceInfo, width, placeDist, noLanes);
  }
}
