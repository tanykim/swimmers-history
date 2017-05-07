import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdRadioModule, MdButtonModule } from '@angular/material';
import { AppRoutingModule } from './app.routing';

import { AppComponent } from './app.component';

import { IntroComponent } from './intro/wrapper.component';
import { IntroVisComponent } from './intro/vis.component';
import { IntroOptionsComponent } from './intro/options.component';

import { VisualizationComponent } from './visualization/wrapper.component';
import { VisualizationRadialComponent } from './visualization/radial.component';
import { VisualizationLaneComponent } from './visualization/lane.component';

// import { Location } from '@angular/common';
import { DataService } from './services/data.service';
import { StoreService } from './services/store.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MdRadioModule,
    MdButtonModule
  ],
  declarations: [
    AppComponent,
    IntroComponent,
    IntroVisComponent,
    IntroOptionsComponent,
    VisualizationComponent,
    VisualizationRadialComponent,
    VisualizationLaneComponent
  ],
  providers: [
    // Location,
    DataService,
    StoreService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
