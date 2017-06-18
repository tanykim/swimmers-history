# Swimmers' History Data Visualization

This is a data visulaization project of elite swimmers in the world. 
Read my Medium posts on [dataset generation](https://medium.com/@tanykim/data-visualization-of-elite-swimmers-competition-results-part-1-datasets-bd09b68154c2), [visualization design](https://medium.com/@tanykim/data-visualization-of-elite-swimmers-competition-results-part-2-design-dc86d77946b8), and [insights discovery](https://medium.com/@tanykim/data-visualization-of-elite-swimmers-competition-results-part-3-insights-7ec5862f48a7).

## Data Resource

The original data are acquired from [Swim Rankings](https://www.swimrankings.net). This site provides extensive datasets of major swim meets and their events. Among those, I focus the following types of meet and events.

**Swim Meets**

* Olympics (Every 4-th years)
* World Championships (Every odd years)
* European Championships (Every even years)
* Commonwealth Games (Every non-olympic 4-th years)
* Pan Pacific Championships (Every non-olympic 4-th years)

**Swim Events**

Each meet has different events. Here I cover events that are recognized in the olympics. Men and Women events are not symetrical; men compete 1500m freestyle, whereas women compete 800m freestyle. Except these two events, both genders compete the same events

* 50m Freestyle
* 100m Freestyle
* 200m Freestyle
* 400m Freestyle
* 800m Freestyle (Women) / 1500m Freestyle (Men)
* 100m Backstroke
* 200m Backstroke
* 100m Breaststroke
* 200m Breaststroke
* 100m Butterfly
* 200m Butterfly
* 200m Medley
* 400m Medley
* 4 X 100m Freestyle
* 4 X 200m Freestyle
* 4 X 100m Medley

Also I include only **final races** (mostly top 8 individuals or teams) and available years (mostly covering data from year 2000).

## Dataset Generation

This project includes two steps of data generation - 1) scrapping html pages with **R** then 2) generate datasets with **Python** for the front-end visualization.

**Environment**

*  R: version 3.2.4
*  Python: 3.5.2

## Front-End Development Set-up

```react-app``` folder is the front-end development of data visualization. See the ```README.md``` in the folder.


### About other branches

I originally started to use AngularJS (aka Angular 1), then I tried both React and Angular2. I decided to use React. Two other branches (angularJS-app and ng-app) have front-end code with those frameworks. 

