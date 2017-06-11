from bs4 import BeautifulSoup
import re
import json
import math
import itertools
from operator import itemgetter
from collections import defaultdict
import datetime

meets = {}
with open('R_results/json/meets.json') as meetsObj:
    meets = json.load(meetsObj)

genders = {
    '1': {'name': 'men', 'styles': [1, 2, 3, 5, 8, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40]},
    '2': {'name': 'women', 'styles': [1, 2, 3, 5, 6, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40]}
}

#simple version for testing
# meets = [
#     {"type":"1","year":"2012","location":"London (GBR)","name":"XXX Olympic Games","id":"563769"},
#     {"type":"1","year":"2016","location":"Rio (BRA)","name":"XXXI Olympic Games","id":"596227"},
#     {"type":"2","year":"2015","location":"Kazan (RUS)","name":"FINA: 16th World Championships","id":"589276"}
# ]
# genders = {
#     '1': {'name': 'men', 'styles': [1, 2]},
#     '2': {'name': 'women', 'styles': [1]}
# }

meets_name = {
    '1': ['Olympic Games', '0OG'],
    '2': ['World Championships', '1WC'],
    '3': ['European Championships', '2EC'],
    '5': ['Commonwealth Games', '3CG'],
    '7450054': ['Pan Pacific Championships', '4PPC']
}
meet_year_letter = {
    '2016': 'a',
    '2015': 'b',
    '2014': 'c',
    '2013': 'd',
    '2012': 'e',
    '2011': 'f',
    '2010': 'g',
    '2009': 'h',
    '2008': 'i',
    '2007': 'j'
}
events_name = {
    '1': ['50m Freestyle', 'a50Fr', '0IND'],
    '2': ['100m Freestyle', 'b100Fr', '0IND'],
    '3': ['200m Freestyle', 'c200Fr', '0IND'],
    '5': ['400m Freestyle', 'd400Fr', '0IND'],
    '6': ['800m Freestyle', 'e800Fr', '0IND'],
    '8': ['1500m Freestyle', 'f1500Fr', '0IND'],
    '10': ['100m Backstroke', 'g100Bk', '0IND'],
    '11': ['200m Backstroke', 'h200Bk', '0IND'],
    '13': ['100m Breaststroke', 'i100Br', '0IND'],
    '14': ['200m Breaststroke', 'j200Br', '0IND'],
    '16': ['100m Butterfly', 'k100Fly', '0IND'],
    '17': ['200m Butterfly', 'l200Fly', '0IND'],
    '18': ['200m Medley', 'm200IM', '0IND'],
    '19': ['400m Medley', 'n400IM', '0IND'],
    '27': ['4 X 100m Freestyle', 'o4X100Fr', '1TEAM'],
    '29': ['4 X 200m Freestyle', 'p4X200Fr', '1TEAM'],
    '40': ['4 X 100m Medley', 'q4X100M', '1TEAM']
}

# collect athletes from all html files
all_athletes = {'men': {}, 'women': {}}
node_edges = {'men': [], 'women': []}

# add race at each html read
race = {'men': {}, 'women': {}}

# collect athletes from all html files
all_athletes = {'men': {}, 'women': {}}
node_edges = {'men': [], 'women': []}

def existing_node_set_idx(source, target, gender):
    for idx, set in enumerate(node_edges[gender]):
        if (set['source'] == source and set['target'] == target or
            set['target'] == source and set['source'] == target):
            return idx

def update_node_edges(source, target, gender, race_id):
    idx = existing_node_set_idx(source, target, gender)
    if (idx == None):
        # add new node
        node_edges[gender].append({'source': source, 'target': target, 'value': [race_id]})
    else:
        # update existing node
        node_edges[gender][idx]['value'].append(race_id)

def create_node_edge_data(ids, gender, is_medley, race_id):

    #create source, target, value object
    for i, source in enumerate(ids):
        for j, target in enumerate(ids):
            # remove duplicated sets e.g, [0, 1] == [1, 0]
            if j > i:
                if (not is_medley):
                    update_node_edges(source, target, gender, race_id)
                else:
                    # medley is always with 4 athletes - remove the teams
                    if ( j >= i + 4 - (i % 4)):
                        update_node_edges(source, target, gender, race_id)

# update athletes info
def update_athlete_info(gender, id, record):
    all_athletes[gender][id]['records'].append(record)

def add_new_athlete(athlete_name, country, record, gender, id):
    athlete = {
        'name': athlete_name,
        'country': country,
        'records': [record]
    }
    all_athletes[gender][id] = athlete

def is_athlete_entered(id, gender):
    return True if (id in all_athletes[gender]) else False

def has_only_lastname(id, gender):
    return True if all_athletes[gender][id]['name'].split(' ')[0][1] == '.' else False

def get_fullname(names):
    athlete_name = names[0].string.split(', ')
    ans = []
    for an in athlete_name:
        n_array = an.strip().split(' ')
        ns = map(lambda x: x.strip().capitalize(), n_array)
        n = ' '.join(ns)
        ans.append(n)
    return ans[1].strip() + ' ' + ans[0].strip()

def get_swimtime(t):
    tsplit = t.split(':')
    minute = 0
    sec = float(tsplit[len(tsplit) - 1])
    if len(tsplit) > 1:
        minute = int(tsplit[0])
    return minute * 60 + sec

# create or update athlete object
def get_athletes_by_html (race_id, results, gender):

    athlete_ids = []

    # record info in the order of rank
    place_no = 1
    for idx, rank in enumerate(results):

        #swimtime
        next_elem = results[(idx + 1) % len(results)]
        swimtime_str = rank.find('td', class_='swimtime').string.strip()

        #place and point
        point = 0
        places = rank.find_all('td', class_='meetPlace')
        place_ct = places[0].contents
        place = place_ct[len(place_ct) - 1]
        if place == 'DSQ' or place == 'DOP':
            place = 'DSQ'
            point = 0
        elif place == '-':
            place = place_no
            point = int(places[1].string)
            next_swimtime = get_swimtime(next_elem.find('td', class_='swimtime').string.strip())
            swimtime = get_swimtime(swimtime_str)
            if swimtime < next_swimtime:
                place_no += 1
        else:
            #strip <img> tag for 1, 2, 3.
            place_w_dot = re.findall('[0-9]+[.]', str(place))[0]
            place = re.sub('[.]', '', place_w_dot).strip()
            point = int(places[1].string)

        record = {
            'race_id': race_id,
            'swimtime': swimtime_str,
            'place': place,
            'point': point
        }

        # for data set
        names = rank.find_all('td', class_='name')

        # team events
        if race_id.split('-')[3] == '1TEAM':
            # case of race: get 4 athletes ID in relay
            for a in names[1].find_all('a'):
                id = re.findall('[0-9]*$', a['href'])[0]
                if is_athlete_entered(id, gender):
                    update_athlete_info(gender, id, record)
                else:
                    # remove &nbsp in the name
                    nbsp_removed = a.string.strip().encode('ascii','replace')
                    athlete_name = nbsp_removed.replace('?', ' ')
                    first_name = re.findall('[A-Z]*.$', athlete_name)[0]
                    last_name_array = athlete_name.replace(first_name, '').split(' ')
                    last_names = map(lambda x: x.strip().capitalize(), last_name_array)
                    last_name = ' '.join(last_names)
                    full_name = first_name.strip() + ' ' + last_name.strip()
                    add_new_athlete(full_name, names[0].string, record, gender, id)
                athlete_ids.append(id)

        # individual events
        else:
            # check if already athlete is in the dictionary
            id = re.findall('[0-9]*$', names[0].a['href'])[0]
            if is_athlete_entered(id, gender):
                if has_only_lastname(id, gender):
                    fullname = get_fullname(names)
                    all_athletes[gender][id]['name'] = fullname
                update_athlete_info(gender, id, record)
            else:
                fullname = get_fullname(names)
                add_new_athlete(fullname, names[1].string, record, gender, id)
            athlete_ids.append(id)

    # create node-edge dataset
    if race_id.split('-')[3] == '1TEAM':
        create_node_edge_data(athlete_ids, gender, True, race_id)
    else:
        create_node_edge_data(athlete_ids, gender, False, race_id)

    return athlete_ids

#competition info for intro
competition_list = defaultdict(dict)

def get_competition_info (race):
    # c = competition_list[race['competition']]
    if not competition_list[race['competition']]:
        c = {}
        c['startDate'] = race['date']
        c['endDate'] = race['date']
        if race['gender'] == 'men':
            c['men'] = race['athletes']
            c['women'] = []
            c['raceCount'] = [1, 0]
        else:
            c['women'] = race['athletes']
            c['men'] = []
            c['raceCount'] = [0, 1]
        competition_list[race['competition']] = c
    else:
        c = competition_list[race['competition']];
        prevS = datetime.datetime.strptime(c['startDate'], '%d %b %Y')
        prevE = datetime.datetime.strptime(c['endDate'], '%d %b %Y')
        cd = datetime.datetime.strptime(race['date'], '%d %b %Y')
        c['startDate'] = min([prevS, cd]).strftime('%d %b %Y')
        c['endDate'] = max([prevE, cd]).strftime('%d %b %Y')
        c[race['gender']] = list(set(c[race['gender']]) | (set(race['athletes'])))
        if race['gender'] == 'men':
            c['raceCount'][0] = c['raceCount'][0] + 1
        else:
            c['raceCount'][1] = c['raceCount'][1] + 1

# get data from html file (parsed from swim result html page)
for meet in meets:
    for gender in genders:
        for style in genders[gender]['styles']:

            file_id = meet['id'] + '-' + gender + '-' + str(style)

            competition_id = meets_name[meet['type']][1] + '-' + meet_year_letter[meet['year']] + \
                       meet['year']

            # set race id with meet and even info
            race_id = competition_id + '--' + \
                       events_name[str(style)][2] + '-' + \
                       events_name[str(style)][1]

            # get meet/race info from the scrapped html file - remove \n, then resoup
            html = BeautifulSoup(open('R_results/html/' + file_id + '.html'), 'html.parser')
            result_string = str(html.find('table', {'class', 'meetResult'})).replace('\n', '')
            result_html = BeautifulSoup(result_string, 'html.parser')

            results = list(result_html.find('table').children)[1:]
            print (gender, race_id)
            athlete_ids = get_athletes_by_html(race_id, results, genders[gender]['name'])
            # update race object with race date
            race_date = result_html.find('tr').find_all('th')[1].string.split('-')[0].strip()
            race[genders[gender]['name']][race_id] = race_date
            race_info = {
                'date': race_date,
                'gender': genders[gender]['name'],
                'competition': competition_id,
                'athletes': athlete_ids
            }
            get_competition_info(race_info);



# save data files as json
# data objects
# graph: { nodes, links }
# meets_list: { new type id: { name, children: [new id aka year, location] }
# events_list: { new type id: { name, children: [new id aka abbr, full name }
# athletes_list: { gender: [ { name, country, country_code, birth_date, races: [] }] }

# meets
meets_list = {}

# group by meet type (e.g., olympics)
meets_grouped = {}
sorted_meets = sorted(meets, key=itemgetter('type'))
for key, group in itertools.groupby(sorted_meets, key=lambda x:x['type']):
    meets_grouped[key] = list(group)

for k, v in meets_grouped.iteritems():
    children = map(lambda x: [(meet_year_letter[x['year']] + str(x['year'])), x['year'] + ' - ' + x['location']], v)
    children = sorted(children, key=itemgetter(0))
    meets_grouped[k] = {
        'name': meets_name[k][0],
        'children': children
    }
    meets_list[meets_name[k][1]] = meets_grouped[k]

# events
# add key (i.e. asec sortable style_id) to the value
for k, v in events_name.iteritems(): v.append(k)
# group by event type (e.g., team or individual)
events_list = defaultdict(list)
for key, value in events_name.iteritems():
    events_list[value[2]].append(value)

for k, v in events_list.iteritems():
    # x[3] is the style_id
    children = map(lambda x: [x[1], x[0], x[3]], v)
    children = sorted(children, key=itemgetter(2))
    children = map(lambda x: [x[0], x[1]], children)
    events_list[k] = {
        'name': 'Individual' if k == '0IND' else 'Team',
        'children': children
    }

# athletes
athletes_list = {}
for gender, athletes_by_id in all_athletes.iteritems():
    info = []
    for id, val in athletes_by_id.iteritems():
        val['id'] = id
        info.append(val)
    athletes_list[gender] = info

# save files
simplejson = json
print events_list
jsondata = simplejson.dumps({
        'graph': node_edges,
        'meets': meets_list,
        'events': events_list,
        'athletes': athletes_list,
        'competitions': competition_list,
        'race': race
    }, separators=(',',':'), sort_keys=True)
# fd = open('../webapp/public/data/data.json', 'w')
# fd2 = open('../ng-app/src/app/services/data.json', 'w')
fd3 = open('../react-app/src/data/data.json', 'w')
# fd.write(jsondata)
# fd.close()
# fd2.write(jsondata)
# fd2.close()
fd3.write(jsondata)
fd3.close()

