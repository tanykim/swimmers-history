'use strict';

angular.module('swimmerApp').factory('visualizer', ['_', 'd3', function (_, d3) {

    var linksData;
    var simulation;

    var linkG, nodeG;
    var link, node;

    /* interactoin when a node is dragged */
    function moveAthleteName(id) {
        var draggedNode = nodeG.select('circle[id=\'' + id + '\']');
        nodeG.select('#vis-athlete-name-' + id)
            .transition()
            .attr('x', draggedNode.attr('cx'))
            .attr('y', draggedNode.attr('cy'));
    }

    function checkSimulationStatus(id) {
        var selectedNodeId = id;

        //check if simulation stopped every 0.2 second
        function isStopped() {
            if (simulation.alpha() < 0.05) {
                moveAthleteName(selectedNodeId);
            } else {
                setTimeout(isStopped, 200);
            }
        }
        isStopped();
    }

    function dragstarted(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.5).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d, isClicked) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;

        //check simluation status
        if (isClicked) {
            checkSimulationStatus(d.id);
        }
    }

    /* interaction when node is hovered */
    function showMouseover(obj, d) {

        if (!d.clicked) {
            //change the node color
            obj.attr('class', 'node-over');
            //add athlete's name
            nodeG.append('text')
                .text(d.name)
                .attr('x', d.x)
                .attr('y', d.y)
                .attr('dy', -1 * parseInt(obj.attr('r')) - 6)
                .attr('class', 'size-tiny unselectable pos-middle vis-athlete-name')
                .attr('id', 'vis-athlete-name-' + d.id);
        }

        //highlight connected link
        var connected = _.chain(linksData)
            .filter(function (l) {
                return l.source === d.id || d.target === d.id;
            })
            .map(function (l) {
                return d.id === l.source ? l.target : l.source;
            })
            .value();

        //highlight links and linked nodes
        _.each(connected, function (c) {
            linkG.select('line[id=\'' + c + '-' + d.id + '\']')
                .attr('class', 'link-over vis-link-over');
            linkG.select('line[id=\'' + d.id + '-' + c + '\']')
                .attr('class', 'link-over vis-link-over');
            nodeG.select('circle[id=\'' + c + '\']')
                .attr('class', 'node-linked');
        });
    }

    /* interaction when mouse is out of node */
    function showMouseout(obj, d) {
        //return only if it's not unclicked
        if (!d.clicked) {
            obj.attr('class', 'node-normal');
            nodeG.select('#vis-athlete-name-' + d.id).remove();
        }
        //revert all highlighted (linked) links and nodes
        linkG.selectAll('.vis-link-over').attr('class', 'link-normal');
        nodeG.selectAll('.node-linked').attr('class', function (d) {
            return d.clicked ? 'node-clicked' : 'node-normal';
        });
    }

    /* interaction when vis is initiated */
    function ticked() {
        link.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node.attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
    }

    //TODO: sometimes the vis is frozen at the beginning
    this.drawVis = function (graph, maxPoint, completeLoading, sendAthleteInfo) {

        linksData = angular.copy(graph.links);

        //TODO: meticulous distance depending on the node length
        //TODO: zoom in /pan
        console.log('---vis started');

        var width = document.getElementById('vis').clientWidth;

        var dim = width * 1;
        var svg = d3.select('#vis')
            .append('svg')
            .attr('width', width)
            .attr('height', dim);

        simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function (d) {
                return d.id;
            })
            .distance(function () {
                return dim / 10;
            }))
            .velocityDecay(1) //no animation at first
            .force('charge', d3.forceManyBody()
                .strength( -1 * dim / 10)
                .distanceMax(dim / 4)
            )
            .force('center', d3.forceCenter(width / 2, dim / 2));

        //link as lines
        linkG = svg.append('g')
            .attr('class', 'links');
        link = linkG.selectAll('line')
            .data(graph.links)
            .enter().append('line')
            .attr('stroke-width', function (d) {
                return d.value.length * 0.5;
            })
            .attr('class', 'link-normal')
            .attr('id', function (d) {
                return d.source + '-' + d.target;
            });

        //node as circles
        //set radius size (min: 4), point range min is roughly 700
        var radius = d3.scaleLinear()
            .range([9, graph.nodes.length * 1.2])
            .domain([700, maxPoint]);

        nodeG = svg.append('g')
            .attr('class', 'nodes');
        node = nodeG.selectAll('circle')
            .data(graph.nodes)
            .enter().append('circle')
            .attr('id', function (d) {
                return d.id;
            })
            .attr('r', function (d) {
                var points = _.pluck(d.records, 'point');
                var total = _.reduce(points, function (memo, num) {
                    return memo + num;
                }, 0);
                var r = Math.sqrt(radius(total));
                if (_.isNaN(r)) { //total point is smaller than 700
                    r = 2;
                }
                return r;
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', function (d) {
                    return dragended(d, d.clicked);
                }))
            .on('mouseover', function (d) {
                showMouseover(d3.select(this), d);
            })
            .on('mouseout', function (d) {
                showMouseout(d3.select(this), d);
            })
            .on('click', function (d) {
                d.clicked = true;
                d3.select(this).attr('class', 'node-clicked');

                //callback to main.js
                sendAthleteInfo(d);
            });

        simulation.nodes(graph.nodes).on('tick', ticked);
        simulation.force('link').links(graph.links);

        completeLoading();
    };

    this.sendData = function (data) {
        console.log(data);
    };
    return this;
}]);
