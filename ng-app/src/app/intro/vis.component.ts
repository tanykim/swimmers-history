import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'intro-vis',
  templateUrl: './vis.component.html',
  styleUrls: ['./vis.component.scss']
})
export class IntroVisComponent implements OnInit {

  // width: number;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    console.log('----');
    const width = document.getElementById('vis-intro').clientWidth;
    console.log(width);
    const data = this.dataService.competitions;

  }
  // title = 'app works!';
}
