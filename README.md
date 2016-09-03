# [WIP] Swimmers Network Visualiation

This is a visulaization project representing the network of elite swimmers in the world. 

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

This project includes two steps of data generation - 1) scrapping html pages with **R** then 2) generate datasets with **Python** for the front-end visualization. Some intermediate datasets from R are saved as JSON files and later used in both Python and fron-end coding.

**Environment**

*  R: version 3.2.4
*  Python: 2.7.5

## Front-End Development Set-up

The development environment includes followings.

* Node v6.3.1
* Angular v1.5
* Less 458
* grunt-cli v1.2.0

To test the webapp, do the following steps. Bower installs necessary Javascript libraries for the client side. This includes Angular, D3 and Underscore. 

```
cd webapp
npm install
bower install 
```

Then run ```grunt``` to see on the browser on your browser. The entire folder ```public``` is ready to be served on a server.

 

