import _ from 'lodash';
import moment from 'moment';

export const getRaces = (sel, dates) => {
  const races = [];
  for (let meet in sel.meets) {
    for (let year in sel.meets[meet]) {
      if (sel.meets[meet][year]) {
        for (let style in sel.events) {
          for (let race in sel.events[style]) {
            if (sel.events[style][race]) {
              races.push(`${meet}-${year}--${style}-${race}`);
            }
          }
        }
      }
    }
  }
  return races;
}

export const getAthletesData = (allAthletes, races) => {

  let athletes = [];
  let allTotalPoints = [];

  //check records are included in the selected meets and events
  _.each(_.shuffle(allAthletes), (athlete) => {
      let totalPoint = 0;
      let validRecords = [];
      _.each(athlete.records, (r) => {
        if (races.indexOf(r.race_id) > -1) {
          totalPoint = totalPoint + r.point;
          validRecords.push(r);
        }
      });
      if (validRecords.length > 0) {
        allTotalPoints.push(totalPoint);
        athlete.records = validRecords;
        athlete.totalPoint = totalPoint;
        athletes.push(athlete);
      }
  });

  const pointRange = [Math.max(_.min(allTotalPoints), 700), _.max(allTotalPoints)];

  return { athletes, pointRange };
}

export const getTopAthletes = (allAthletes) => {
  return _.sortBy(allAthletes, (a) => { return a.totalPoint; })
  .reverse()
  .slice(0, Math.min(30, Math.round(allAthletes.length / 10)));
}

export const getAthletesLinks = (athletes, allLinks, races) => {
  let links = [];
  const aIds = _.map(athletes, 'id');
  _.each(allLinks, (d) => {
    //check if both source and target are in the selected ids
    if (aIds.indexOf(d.source) > -1 && aIds.indexOf(d.target) > -1) {
      let validRecords = [];
      _.each(d.value, (r) => {
        if (races.indexOf(r) > -1) {
          validRecords.push(r);
        }
      });
      if (validRecords.length > 0) {
        links.push({
          source: d.source,
          target: d.target,
          value: validRecords.length
        });
      }
    }
  });

  return links;
}


// const convertDate = (str) => {
//   return moment(str, 'D MMM YYYY').format('YYYYMMDD');
// }

// export const getMeetDates = (race) => {

//   const meets = [];
//   const dates = {};

//   const getMinMaxDate = (d, meet) => {
//     let newD = convertDate(d);
//     const minD = Math.min(+newD, dates[meet][0]);
//     const maxD = Math.max(+newD, dates[meet][1]);
//     return [minD, maxD];
//   }

//   //start with men
//   _.each(race.men, (v, k) => {
//     //k: 0OG-a2016--0IND-100Bk
//     //v: 8 Aug 2016
//     const meet = k.split('--')[0];
//     //first found
//     if (meets.indexOf(meet) === -1) {
//       meets.push(meet);
//       let newD = convertDate(v);
//       dates[meet] = [+newD, +newD];
//     } else {
//       //find min and max dates of the given meet
//       dates[meet] = getMinMaxDate(v, meet);
//     }
//   })

//   //check min and max with women
//   _.each(race.woman, (v, k) => {
//     dates[meet] = getMinMaxDate(v, meet);
//   })

//   return dates;
// }