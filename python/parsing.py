from bs4 import BeautifulSoup
import re
import pprint
import json
from underscore import _
from collections import OrderedDict

# meets = {}
# with open('R_results/json/meets.json') as meetsObj:
#     meets = json.load(meetsObj)
#
# genders = {
#     '1': {'name': 'Men', 'styles': [1, 2, 3, 5, 8, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40]},
#     '2': {'name': 'Women', 'styles': [1, 2, 3, 5, 6, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40]}
# }

# simple version for testing
meets = {
    "596227": {"type":"1","year":"2016","location":"Rio (BRA)","name":"XXXI Olympic Games"},
    "563769": {"type":"1","year":"2012","location":"London (GBR)","name":"XXX Olympic Games"},
    "589276": {"type":"2","year":"2015","location":"Kazan (RUS)","name":"FINA: 16th World Championships"}
}
genders = {
    '1': {'name': 'men', 'styles': [1, 8, 10]},
    '2': {'name': 'women', 'styles': [1, 6, 10]}
}

# add race at each html read
race = {}

# collect athletes from all html files
all_athletes = { 'men': {}, 'women': {} }
node_edges = { 'men': [], 'women': [] }

def existing_node_set_idx(source, target, gender):
    for idx, set in enumerate(node_edges[gender]):
        if (set['source'] == source and set['target'] == target or
            set['target'] == source and set['source'] == target):
            return idx

def update_node_edges(source, target, gender):
    idx = existing_node_set_idx(source, target, gender)
    if (idx == None):
        # add new node
        node_edges[gender].append({'source': source, 'target': target, 'value': 1})
    else:
        # update existing node
        node_edges[gender][idx]['value'] += 1

def create_node_edge_data(ids, gender, is_medley):

    #create source, target, value object
    for i, source in enumerate(ids):
        for j, target in enumerate(ids):
            # remove duplicated sets e.g, [0, 1] == [1, 0]
            if j > i:
                if (not is_medley):
                    update_node_edges(source, target, gender)
                else:
                    # medley is always with 4 athletes - remove the teams
                    if ( j >= i + 4 - (i % 4)):
                        update_node_edges(source, target, gender)

# update athletes info
def update_athlete_info(gender, id, pnt, record):
    all_athletes[gender][id]['records'].append(record)
    all_athletes[gender][id]['point'] += pnt

def add_new_athlete(athlete_name, country, record, pnt, gender, id):
    athlete = {
        'name': athlete_name,
        'country': country,
        'records': [record],
        'point': pnt
    }
    all_athletes[gender][id] = athlete

def is_athlete_entered(id, gender):
    return True if (id in all_athletes[gender]) else False
        
# create or update athlete object
def get_athletes_by_html (race_id, results, gender):

    athlete_ids = []

    # record info in the order of rank
    for rank in results:

        #place and point
        places = rank.find_all('td', class_='meetPlace')
        place_ct = places[0].contents
        place_period = place_ct[len(place_ct) - 1]
        place = re.sub('[.]', '', str(place_period)).strip()

        record = {
            'race_id': race_id,
            'swimtime': rank.find('td', class_='swimtime').string,
            'place': place
        }
        pnt = int(places[1].string) if places[1].string <> '-' else 0 #case of DSQ

        # for data set
        names = rank.find_all('td', class_='name')

        # medlies
        if int(race_id.split('-')[2]) >= 27:
            # case of race: get 4 athletes ID in relay
            for a in names[1].find_all('a'):
                id = re.findall('[0-9]*$', a['href'])[0]
                is_already_entered = is_athlete_entered(id, gender)
                if is_already_entered:
                    update_athlete_info(gender, id, pnt, record)
                else:
                    # remove &nbsp in the name
                    nbsp_removed = a.string.strip().encode('ascii','replace')
                    athlete_name = nbsp_removed.replace('?', ' ')
                    add_new_athlete(athlete_name, names[0].string, record, pnt, gender, id)
                athlete_ids.append(id)

        # individual events
        else:
            # check if already athlete is in the dictionary
            id = re.findall('[0-9]*$', names[0].a['href'])[0]
            is_already_entered = is_athlete_entered(id, gender)
            if is_already_entered:
                update_athlete_info(gender, id, pnt, record)
            else:
                add_new_athlete(names[0].string.strip(), names[1].string, record, pnt, gender, id)
            athlete_ids.append(id)

    # create node-edge dataset
    print('atheltes', athlete_ids)
    if int(race_id.split('-')[2]) >= 27:
        create_node_edge_data(athlete_ids, gender, True)
    else:
        create_node_edge_data(athlete_ids, gender, False)

# get data from html file (parsed from swim result html page)
for meet in meets:
    for gender in genders:
        for style in genders[gender]['styles']:

            race_id = meet + '-' + gender + '-' + str(style)

            # get meet/race info from the scrapped html file - remove \n, then resoup
            html = BeautifulSoup(open('R_results/html/' + race_id + '.html'), 'lxml')
            result_string = str(html.find('table', {'class', 'meetResult'})).replace('\n', '')
            result_html = BeautifulSoup(result_string, 'lxml')

            # update race object with race date
            race_date = result_html.find('tr').find_all('th')[1].string.split('-')[0].strip()
            race[race_id] = {'race_date': race_date}
            results = list(result_html.find('table').children)[1:]

            print ('accessed race html', race_id, race_date)
            get_athletes_by_html(race_id, results, genders[gender]['name'])

# pp = pprint.PrettyPrinter(indent=2)
# pp.pprint(all_athletes)
# pp.pprint(node_edges)

print('Men athletes', len(all_athletes['men']))
print('Women athletes', len(all_athletes['women']))
print(all_athletes)

# save data files as json
# data objects
# graph: { nodes, links }
# meets_list: { type: { name, code, years: [year, location, meet_id] }
# events_list: { group: { type: name, code } }
# athletes_list: { gender: [ { name, country, country_code, birth_date, races: [] }] }
# race_list: { rage_id: date }

# meets
for k, v in meets.iteritems(): v['id'] = k
meets_list = _.groupBy(meets, lambda x, *a: x['type'])
meets_name = {
    '1': ['Olympic Games', 'OG'],
    '2': ['World Championships', 'WC'],
    '3': ['European Championships', 'EC'],
    '5': ['Commonwealth Games', 'CG'],
    '7450054': ['Pan Pacific Championships', 'PPC']
}
for k, v in meets_list.iteritems():
    years = _.map(v, lambda x, *a: [x['year'], x['location'], x['id']])
    meets_list[k] = {
        'name': meets_name[k][0],
        'code': meets_name[k][1],
        'years': years #[year, location]
    }

# events
events_list = {
    'individual': {
        '1': {'name': '50m Freestyle', 'code':'50Fr'},
        '2': {'name': '100m Freestyle', 'code':'100Fr'},
        '3': {'name': '200m Freestyle', 'code':'200Fr'},
        '5': {'name': '400m Freestyle', 'code':'400Fr'},
        '6': {'name': '800m Freestyle', 'code':'800Fr'},
        '8': {'name': '1500m Freestyle', 'code':'1500Fr'},
        '10': {'name': '100m Backstroke', 'code':'100Bk'},
        '11': {'name': '200m Backstroke', 'code':'200Bk'},
        '13': {'name': '100m Breaststroke', 'code':'100Br'},
        '14': {'name': '200m Breaststroke', 'code':'200Br'},
        '16': {'name': '100m Butterfly', 'code':'100Fly'},
        '17': {'name': '200m Butterfly', 'code':'200Fly'},
        '18': {'name': '200m Medley', 'code':'100IM'},
        '19': {'name': '400m Medley', 'code':'200IM'}
    },
    'team': {
        '27': {'name': '4 X 100m Freestyle', 'code':'4X100Fr'},
        '29': {'name': '4 X 200m Freestyle', 'code':'4X200Fr'},
        '40': {'name': '4 X 100m Medley', 'code':'4X100M'}
    }
}

# athletes
athletes_list = {}
for gender, athletes_by_id in all_athletes.iteritems():
    info = []
    for id, val in athletes_by_id.iteritems():
        val['id'] = id
        info.append(val)
    athletes_list[gender] = info

# node-edge graph data
graph_data = {}
for gender in genders:
    nodes_list = [];
    g = genders[gender]['name']
    for k, v in all_athletes[g].iteritems():
        nodes = {'id': k, 'value': v['point'], 'name': v['name']}
        nodes_list.append(nodes)
        graph_data[g] = {
            'nodes': nodes_list,
            'links': node_edges[g]
        }

print('graph', graph_data)
print('meets', meets_list)
print('events', events_list)
print('athletes', athletes_list)
print('race', race)

# save files
simplejson = json
jsondata = simplejson.dumps({'graph': graph_data,
                             'meets': meets_list,
                             'events': events_list,
                             'athletes': athletes_list,
                             'race': race
                            }, indent = 4, sort_keys = True)
fd = open('../webapp/public/data/data.json', 'w')
fd.write(jsondata)
fd.close()