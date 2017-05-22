import _ from 'lodash';

//get the cetegory data
export const getRaces = (sel) => {
  const races = []; //all races
  const meets = {};
  const events = [];
  //meets
  for (let meet in sel.meets) {
    for (let year in sel.meets[meet]) {
      if (sel.meets[meet][year]) {
        //add meets info
        if (!meets[meet]) {
          meets[meet] = [year];
        } else {
          meets[meet].push(year);
        }
        //events
        for (let style in sel.events) {
          for (let race in sel.events[style]) {
            if (sel.events[style][race]) {
              //add events info
              events.push(race);
              races.push(`${meet}-${year}--${style}-${race}`);
            }
          }
        }
      }
    }
  }
  return {
    meets: _.toPairs(meets),
    events: _.uniq(events),
    races
  };
}

//get athletes data from options
export const getAthletesData = (allAthletes, races, searchedAthletes) => {
  let athletes = [];
  let allTotalPoints = [];
  //filter atheltes by the races of searched atheltes
  if (searchedAthletes.length > 0) {
    const racesByAthletes = _.chain(searchedAthletes)
      .map((a) => a.records)
      .map((arr) => (arr.map((r) => r.race_id)))
      .flatten()
      .uniq()
      .value();
    races = _.intersection(races, racesByAthletes);
  }

  //check records are included in the selected meets and events
  _.each(_.shuffle(allAthletes), (athlete) => {
      let totalPoint = 0;
      let validRecords = [];
      _.each(athlete.records, (r) => {
        if (races.indexOf(r.race_id) > -1) {
          totalPoint += r.point;
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

//top athletes for selection dropdown
export const getTopAthletes = (allAthletes) => {
  return _.sortBy(allAthletes, (a) => { return a.totalPoint; })
    .reverse()
    .slice(0, Math.min(30, Math.round(allAthletes.length / 10)));
}

//create links data of Graph
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

//get ids of connected nodes for mouseover effect
export const getConnectedNodes = (id, links) => {
  return _.chain(links)
    .filter((l) => {
      return l.source.id === id || l.target.id === id;
    })
    .map((l) => id === l.source.id ? l.target.id : l.source.id)
    .value();
}

//athletes who competed with ALL of the focused athletes - view option
export const getMutualLinkedNodes = (focusedAIds, links) => {

  let linksByFIds = []; //links by focused ID

  _.each(links, (l) => {
    //id pair from each link
    const idPair = [l.source.id, l.target.id];
    //compare the ID pair and the focused athletes IDs
    _.each(focusedAIds, (id, i) => {
      //if one of the pair is a focused athlete, get the other one of the pair
      if (idPair.indexOf(id) > -1) {
        const linked = idPair[idPair.indexOf(id) * -1 + 1];
        //exclude the focused id
        if (!_.includes(focusedAIds, linked)) {
          if (!linksByFIds[i]) {
              linksByFIds[i] = [linked];
          } else {
              linksByFIds[i].push(linked);
          }
        }
      }
    });
  });

  //get athletes who competed all of the focused ones
  let linkedToAll = [];
  _.each(linksByFIds, (links, i) => {
      if (i === 1) {
        linkedToAll = _.intersection(linksByFIds[i - 1], links);
      } else if (i !== 0) {
        linkedToAll = _.intersection(linkedToAll, links);
      }
  });

  return _.flatten(linkedToAll);
};

//set options
export const setOptions = (state, selected, names, allAthletes) => {

  let { sel, selParent } = state;
  _.each(selected, (vals, kind) => {
      //example: kind(meets): '0OG-a2016', kind(eventts): '0IND-50Fr'
    _.each(vals, (val) => {
      const sep = val.split('-');
      selParent[kind][sep[0]] = true;
      sel[kind][sep[0]][sep[1]] = true;
    });
  });
  const searchedAthletes = _.filter(allAthletes, (d) => names.indexOf(d.name) > -1);
  const originalNames = searchedAthletes;
  const nameOption = searchedAthletes.length > 0 ? 'search' : 'all';

  return { sel, selParent, searchedAthletes, originalNames, nameOption };
}

//conver option as object to array for React rendering
export const getOptionsArray = (category) => {
  return _.map(category, (obj, kind) => {
    const lists = _.map(obj, (val, key) => ({
        type: val.name,
        list: _.map(_.sortBy(val.children, (c) => c[0]), (v) => {
            return { key: v[0], name: v[1] };
          }
        ),
        key
      }
    ));
    return { key: kind, lists };
  });
}