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
    '1': {'name': 'men', 'styles': [1, 16, 17, 18, 19]},
    '2': {'name': 'women', 'styles': [1, 16, 17, 18, 19]}
}
meets_name = {
    '1': ['Olympic Games', 'OG'],
    '2': ['World Championships', 'WC'],
    '3': ['European Championships', 'EC'],
    '5': ['Commonwealth Games', 'CG'],
    '7450054': ['Pan Pacific Championships', 'PPC']
}
events_name = {
    '1': ['50m Freestyle', '50Fr', 'IND'],
    '2': ['100m Freestyle', '100Fr', 'IND'],
    '3': ['200m Freestyle', '200Fr', 'IND'],
    '5': ['400m Freestyle', '400Fr', 'IND'],
    '6': ['800m Freestyle', '800Fr', 'IND'],
    '8': ['1500m Freestyle', '1500Fr', 'IND'],
    '10': ['100m Backstroke', '100Bk', 'IND'],
    '11': ['200m Backstroke', '200Bk', 'IND'],
    '13': ['100m Breaststroke', '100Br', 'IND'],
    '14': ['200m Breaststroke', '200Br', 'IND'],
    '16': ['100m Butterfly', '100Fly', 'IND'],
    '17': ['200m Butterfly', '200Fly', 'IND'],
    '18': ['200m Medley', '100IM', 'IND'],
    '19': ['400m Medley', '200IM', 'IND'],
    '27': ['4 X 100m Freestyle', '4X100Fr', 'TEAM'],
    '29': ['4 X 200m Freestyle', '4X200Fr', 'TEAM'],
    '40': ['4 X 100m Medley', '4X100M', 'TEAM']
}

# collect athletes from all html files
all_athletes = { 'men': {}, 'women': {} }
node_edges = { 'men': [], 'women': [] }

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
            'place': place,
            'point': int(places[1].string) if places[1].string <> '-' else 0  # case of DSQ
        }

        # for data set
        names = rank.find_all('td', class_='name')

        # team events
        if race_id.split('-')[3] == 'TEAM':
            # case of race: get 4 athletes ID in relay
            for a in names[1].find_all('a'):
                id = re.findall('[0-9]*$', a['href'])[0]
                is_already_entered = is_athlete_entered(id, gender)
                if is_already_entered:
                    update_athlete_info(gender, id, record)
                else:
                    # remove &nbsp in the name
                    nbsp_removed = a.string.strip().encode('ascii','replace')
                    athlete_name = nbsp_removed.replace('?', ' ')
                    first_name = re.findall('[A-Z]*.$', athlete_name)[0]
                    last_name = athlete_name.replace(first_name, '')
                    full_name = first_name + ' ' + last_name.capitalize()
                    add_new_athlete(full_name, names[0].string, record, gender, id)
                athlete_ids.append(id)

        # individual events
        else:
            # check if already athlete is in the dictionary
            id = re.findall('[0-9]*$', names[0].a['href'])[0]
            is_already_entered = is_athlete_entered(id, gender)
            if is_already_entered:
                update_athlete_info(gender, id, record)
            else:
                athlete_name = names[0].string.split(', ')
                full_name = athlete_name[1].strip().capitalize() + ' ' + athlete_name[0].strip().capitalize()
                add_new_athlete(full_name, names[1].string, record, gender, id)
            athlete_ids.append(id)

    # create node-edge dataset
    print('atheltes', athlete_ids)
    if race_id.split('-')[3] == 'TEAM':
        create_node_edge_data(athlete_ids, gender, True, race_id)
    else:
        create_node_edge_data(athlete_ids, gender, False, race_id)

# get data from html file (parsed from swim result html page)
for meet in meets:
    for gender in genders:
        for style in genders[gender]['styles']:

            file_id = meet + '-' + gender + '-' + str(style)

            # set race id with meet and even info
            race_id = meets_name[meets[meet]['type']][1] + '-' + \
                       meets[meet]['year'] + '--' + \
                       events_name[str(style)][2] + '-' + \
                       events_name[str(style)][1]

            # get meet/race info from the scrapped html file - remove \n, then resoup
            html = BeautifulSoup(open('R_results/html/' + file_id + '.html'), 'lxml')
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
# meets_list: { new type id: { name, children: [new id aka year, location] }
# events_list: { new type id: { name, children: [new id aka abbr, full name }
# athletes_list: { gender: [ { name, country, country_code, birth_date, races: [] }] }
# race_list: { rage_id: date }

# meets
meets_list = {}
# group by meet type (e.g., olympics)
meets_grouped = _.groupBy(meets, lambda x, *a: x['type'])
for k, v in meets_grouped.iteritems():
    # [year, location]
    # TODO: sort children
    children = _.map(v, lambda x, *a: [x['year'], x['year'] + ' - ' + x['location']])
    meets_grouped[k] = {
        'name': meets_name[k][0],
        'children': children
    }
    code = meets_name[k][1]
    meets_list[code] = meets_grouped[k]

# events
for k, v in events_name.iteritems(): v.append(k)
# group by event type (e.g., team or individual)
events_list = _.groupBy(events_name, lambda x, *a: x[2])
for k, v in events_list.iteritems():
    # check if the event type is selected
    children = _(v).chain().map(lambda x, *a: [x[1], x[0], x[3]])\
        .sortBy(lambda x, *a: int(x[2]))\
        .map(lambda x, *a: [x[0], x[1], _.contains(genders['1']['styles'], int(x[2]))])\
        .value()
    events_list[k] = {
        'name': 'Individual' if k == 'IND' else 'Team',
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

# node-edge graph data
graph_data = {}
for gender in genders:
    nodes_list = [];
    g = genders[gender]['name']
    for k, v in all_athletes[g].iteritems():
        nodes = {'id': k, 'records': v['records'], 'name': v['name'], 'country': v['country']}
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