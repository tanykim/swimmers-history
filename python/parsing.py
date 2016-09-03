from bs4 import BeautifulSoup
import re
import pprint
import json

# meets = {}
# with open('R_results/meets.json') as meetsObj:
#     meets = json.load(meetsObj)
#
# genders = {
#     '1': {'name': 'Men', 'styles': [1, 2, 3, 5, 8, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40]},
#     '2': {'name': 'Women', 'styles': [1, 2, 3, 5, 6, 10, 11, 13, 14, 16, 17, 18, 19, 27, 29, 40]}
# }

# testing version
# with open('R_results/meets.json') as meetsObj:
#     meets = json.load(meetsObj)
#
meets = {
    "596227": {"type":"1","year":"2016","location":"Rio (BRA)","name":"XXXI Olympic Games"},
    "589276": {"type":"2","year":"2015","location":"Kazan (RUS)","name":"FINA: 16th World Championships"}
}
genders = {
    '1': {'name': 'Men', 'styles': [1, 8, 10]},
    '2': {'name': 'Women', 'styles': [1, 6, 10]}
}

# add race at each html read
race = {}

# collect athletes from all html files
all_athletes = { 'Men': {}, 'Women': {} }
node_edges = { 'Men': [], 'Women': [] }

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
            html = BeautifulSoup(open('R_results/' + race_id + '.html'), 'lxml')
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

print('Men athletes', len(all_athletes['Men']))
print('Women athletes', len(all_athletes['Women']))
print(race)

# save data file as json
simplejson = json
for gender in genders:
    athletes_list = [];
    g = genders[gender]['name']
    for key, value in all_athletes[g].iteritems():
        nodes = {'id': key, 'value': value['point'], 'name': value['name']}
        athletes_list.append(nodes)
    dataset = {
        'nodes': athletes_list,
        'links': node_edges[g]
    }
    jsondata = simplejson.dumps(dataset, indent = 4, sort_keys = True)
    fd = open('../_testing/' + g + '.json', 'w')
    fd.write(jsondata)
    fd.close()