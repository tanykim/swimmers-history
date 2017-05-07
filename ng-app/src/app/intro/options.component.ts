import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { StoreService } from '../services/store.service';
// import { Location } from '@angular/common';
import { Router } from "@angular/router";

@Component({
  selector: 'intro-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class IntroOptionsComponent {
  @Input() gender: string;
  @Output() genderChange = new EventEmitter();

  genders = ['men', 'women'];
  isLoading = false;

  constructor(
    private storeService: StoreService,
    // private location: Location
    private router: Router
  ) {}

  onChangeFunc(val) {
    this.gender = val;
    this.genderChange.emit(val);
  }

  onStart() {
    this.isLoading = true;
    this.storeService.setGender(this.gender, 'radial');
    // console.log(this.location);
    // this.location.go(`${this.gender}/meets-events/radial`);
    // console.log(this.router);
    // if (this.gender === 'men') {
    //   this.router.navigateByUrl('men/radial');
    // } else {
    //   this.router.navigateByUrl('women/radial');
    // }
    this.router.navigateByUrl(`${this.gender}/radial`);

    // this.router.createUrlTree([this.gender, 'meets-everns', 'radial']);
  }
}
