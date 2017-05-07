import { Component, OnInit } from '@angular/core';
import { StoreService } from '../services/store.service';
import { Location } from '@angular/common';

@Component({
  selector: 'visualization',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})

export class VisualizationComponent implements OnInit {

  // @Input() gender: string;
  gender: string;
  visType: string;
  // graph: any;

  constructor(
    private storeService: StoreService,
    private location: Location
  ) {}

  ngOnInit() {
    //directly from URL
    const path = this.location.path().split('/');
    this.gender = path[1];
    this.visType = path[2]

    const { gender, visType } = this.storeService;

    if (!gender || gender !== this.gender) {
      //set default vis data
      this.storeService.setGender(path[1], this.visType);
    }
    // console.log(this.storeService.gender);
  }
}