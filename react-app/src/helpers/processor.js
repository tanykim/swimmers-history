import _ from 'lodash';
import Data from '../data/data.json';
import moment from 'moment';
const allAthletes = Data.athletes;
const allLinks = Data.graph;
const { meets, events, competitions, race } = Data;
const category = { meets, events };

export const getCategory = () => {
  return category;
};

export const getYearInfo = () => {
  const years = _.chain(meets)
    .map((meet) => meet.children.map((c) => +c[0].slice(1)))
    .flatten()
    .uniq()
    .sort()
    .value();
  const byYear = _.chain(meets)
    .map((meet, key) => meet.children.map((c) => {
      const competition = competitions[`${key}-${c[0]}`];
      const startDate = moment(competition.startDate, 'DD MMM YYYY');
      const endDate = moment(competition.endDate, 'DD MMM YYYY');
      return {
        year: c[0].slice(1),
        location: c[1].split(' - ')[1].split('(')[0].split(' ').join(''), //trace city name
        dates: `${moment(startDate).format('MMM D')} - ${moment(endDate).format('MMM D')}`,
        meet: meet.name,
        moment: startDate.format('YYYYMMDD'),
        swimmerCount: { men: competition.men.length, women: competition.women.length },
      }
    }))
    .flatten()
    .sortBy('moment')
    .groupBy('year')
    .value();
  return {
    years,
    byYear,
    totalCount: {
      men: allAthletes.men.length,
      women: allAthletes.women.length,
    }
  };
};

//get the cetegory data
export const setInitialSelections = () => {
  const selParent = {};
  const sel = {};
  _.each(category, (val, kind) => {
    selParent[kind] = {};
    const vals = _.fromPairs(_.map(val, (d, typeId) => {
      const children = _.fromPairs(_.map(d.children, (d) => [d[0], false]));
      selParent[kind][typeId] = false;
      return [typeId, children];
    }));
    sel[kind] = vals;
  });
  return { sel, selParent, category }
};

export const getAthletesList = (gender) => {
  const all = _.cloneDeep(allAthletes[gender]);
  return _.sortBy(all, (a) => -a.records.length)
    .map((a) => (
      {
        value: a,
        label: `${a.name} (${a.country})`,
      }
    ));
};

//set options
export const setSelections = (sel, selParentPrev, selectedPrev) => {
  const selParent = _.cloneDeep(selParentPrev);
  const selected = _.cloneDeep(selectedPrev);
  _.each(_.cloneDeep(selected), (vals, kind) => {
      //example: kind(meets): '0OG-a2016', kind(eventts): '0IND-50Fr'
    _.each(vals, (val) => {
      const sep = val.split('-');
      selParent[kind][sep[0]] = true;
      sel[kind][sep[0]][sep[1]] = true;
    });
  });
  return { sel, selParent };
};

export const getSearchedAthletes = (ids, gender) => {
  return _.filter(_.cloneDeep(allAthletes[gender]), (d) => ids.indexOf(d.id) > -1);
};

export const updateSelection = (selection, sel) => {
  let updatedSel = sel;
  const arr = selection.split(',');
  updatedSel[arr[0]][arr[1]][arr[2]] = arr[3] === 'false' ? true : false;
  return updatedSel;
};

//get races from the selection in option
export const getRaces = (sel, gender) => {
  const races = []; //all races
  //meets and events are used for Summary in Option
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
            if (((gender === 'women' && race !== 'f1500Fr') ||
              (gender === 'men' && race !== 'e800Fr')) &&
              sel.events[style][race]) {
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
    events: _.sortBy(_.uniq(events), (e) => e),
    races: _.sortBy(races, (r) => r),
  };
};

//get athletes data from options
export const getAthletesData = (gender, races, searchedAthletes) => {
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
  const athletesInGender = _.shuffle(_.cloneDeep(allAthletes[gender]));
  _.each(athletesInGender, (athlete) => {
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
        athlete.records = _.sortBy(validRecords, (r) => r.race_id);
        athlete.totalPoint = totalPoint;
        athlete.place = _.min(validRecords.map((r) => +r.place));
        athletes.push(athlete);
      }
  });
  const pointRange = [Math.max(_.min(allTotalPoints), 700), _.max(allTotalPoints)];
  return { athletes, pointRange };
};

export const getCountryList = (athletes) => {
  return _.chain(athletes)
    .groupBy((a) => a.country)
    .map((list, country) => {
      //default sorting option for athletes is races
      const sorted = _.sortBy(list, (a) => -a.records.length);
      return { country, athletes: sorted };
    })
    //default is by athletes count
    .sortBy((d) => -d.athletes.length)
    .value();
};

export const sortCountries = (countryList, sortOption) => {
  if (sortOption === 'alphabetical') {
    return _.sortBy(countryList, (c) => c.country);
  } else {
    return _.sortBy(countryList, (c) => -c.athletes.length);
  }
};

export const sortAthletesPerCountry = (countryList, sortOption) => {
  return _.chain(countryList)
    .map((c) => {
      const { athletes, country } = c;
      let sorted;
      if (sortOption === 'races') {
        sorted = _.sortBy(athletes, (a) => -a.records.length);
      } else if (sortOption === 'points') {
        sorted = _.sortBy(athletes, (a) => (
          -1 * _.reduce(a.records.map((r) => r.point), (memo, num) =>
            { return memo + num; },
          0)
        ));
      } else {
        sorted = _.sortBy(athletes, (a) => a.name);
      }
      return { country, athletes: sorted };
    })
    .value();
}

export const getAthletesByRace = (athletes, races, gender) => {
  const byRace = _.fromPairs(races.map((r) => [r, {}]));
  const getAObj = (a, place) => {
    return { ...a, place };
  }
  _.each(athletes, (a) => {
    _.each(a.records, (r) => {
      if (!byRace[r.race_id][r.place]) {
        byRace[r.race_id][r.place] = [getAObj(a, r.place)];
      } else {
        byRace[r.race_id][r.place].push(getAObj(a, r.place));
      }
    });
  });
  //when filtered with athletes names, all the selected events in the options may not be included.
  //exclude those races that do not have athletes
  const validRaces = _.chain(byRace)
    .map((r, key) => [_.isEqual(r, {}), key])
    .reject((d) => d[0])
    .map((d) => d[1])
    .sortBy((d) => d)
    .value();

  //index of meets/events that change in the valid race array
  let meetsIndex = [0];
  let yearsIndex = [0];
  for (let i = 1; i < validRaces.length - 1; i++) {
    const curr = validRaces[i].split('-');
    const prev = validRaces[i - 1].split('-');
    //0 is meet, year is event
    if (curr[0] !== prev[0]) {
      meetsIndex.push(i);
      yearsIndex.push(i);
    }
    if (curr[1] !== prev[1]) {
      yearsIndex.push(i);
    }
  }
  const raceDates = validRaces.map((r) => race[gender][r])
  return { byRace, validRaces, meetsIndex, yearsIndex, raceDates };
};

//top athletes for selection dropdown
export const getTopAthletes = (allAthletes) => {
  return _.sortBy(allAthletes, (a) => { return a.totalPoint; })
    .reverse()
    .slice(0, Math.min(30, Math.round(allAthletes.length / 10)));
};

//create links data of Graph
export const getAthletesLinks = (gender, athletes, races) => {
  let links = [];
  const aIds = _.map(athletes, 'id');
  let linksRange = [races.length, 1];
  _.each(allLinks[gender], (d) => {
    //check if both source and target are in the selected ids
    if (aIds.indexOf(d.source) > -1 && aIds.indexOf(d.target) > -1) {
      let validRecords = [];
      _.each(d.value, (r) => {
        if (races.indexOf(r) > -1) {
          validRecords.push(r);
        }
      });
      if (validRecords.length > 0) {
        const value = validRecords.length;
        links.push({
          source: d.source,
          target: d.target,
          value
        });
        linksRange = [
          Math.min(linksRange[0], value),
          Math.max(linksRange[1], value)
        ];
      }
    }
  });
  return { links, linksRange };
};

//get ids of connected nodes for mouseover effect
export const getConnectedNodes = (id, links) => {
  return _.chain(links)
    .filter((l) => {
      return l.source.id === id || l.target.id === id;
    })
    .map((l) => id === l.source.id ? l.target.id : l.source.id)
    .value();
};

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
};

//athletes who competed with ALL of the focused athletes - view option
export const getMutualLinkedNodes = (focusedAIds, links) => {

  let linksByFIds = []; //links by focused ID

  _.each(links, (l) => {
    //id pair from each link
    const idPair = [l.source.id || l.source, l.target.id || l.target];
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

export const getRaceHoverText = (value) => {
  const { raceId, aName, place } = value;
  const elms = raceId.split('-').map((elm) => elm.slice(1, elm.length));
  return `${aName} was placed #${place} at ${elms[1]} ${elms[0]} ${elms[4]}`;
};

export const getRacesObjByA = (obj) => {
  const { id, name, country } = obj;
  let records = {};
  _.each(obj.records, (r) => {
    records[r.race_id] = _.pick(r, ['swimtime', 'place']);
  });
  return {
    id,
    name,
    country,
    records,
  }
};

export const getSharedRaces = (athletes, gender) => {
  const raceIdsByA = athletes.map((a) => _.keys(a.records))
  let shared = raceIdsByA[0];
  for (let i = 1; i < raceIdsByA.length; i++) {
    shared = _.intersection(shared, raceIdsByA[i]);
  }
  // const raceDate = shared.map((r) => race[gender][r]);
  return shared;
};

export const getSharedRacesWinner = (sharedRaces, clickedObjs) => {
  return sharedRaces.map((raceId) => {
      const athletesOfRace = clickedObjs.map((a, i) => {
          if (a.records[raceId]) {
            //i: index of column
            return [a.records[raceId].place, i];
          } else {
            return null;
          }
      });
      //sort by place
      const sorted = _.sortBy(_.compact(athletesOfRace), (a) => a[0]);

      //highest place among all swimmers
      const highestPlace = sorted[0][0];

      //return top athlete's index
      //there may be multiple swimmers with the top place, thus return array
      return _.filter(sorted, (s) => s[0] === highestPlace).map((f) => f[1]);
  });
};