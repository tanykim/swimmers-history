import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntroComponent }   from './intro/wrapper.component';
import { VisualizationComponent }   from './visualization/wrapper.component';

//set the top-level hierarchy of the entire web app
const routes: Routes = [
  { path: '', component: IntroComponent },
  // { path: 'network', component: NetworkComponent },
  // { path: ':gender/:vis', component: VisualizationComponent },
  { path: ':gender/:vis', component: VisualizationComponent }
  // { path: 'data', component: ContentComponent },
  // { path: 'insights', component: ContentComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
