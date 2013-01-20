function myGraph(el) {
    // Add and remove elements on the graph object
    this.addNode = function (id) {
        nodes.push({"id":id, "attraction": {}, "clicked":false });
        update();
    }

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] == n)||(links[i]['target'] == n)) links.splice(i,1);
            else i++;
        }
        nodes.splice(findNodeIndex(id),1);
        update();
    }

    this.addLink = function (source, target, strength) {
        links.push({"source":findNode(source),"target":findNode(target)});
        findNode(source).attraction[target] = strength*2.4;
        update();
    }

    var findNode = function(id) {
        for (var i in nodes) {if (nodes[i]["id"] === id) return nodes[i]};
    }

    var findNodeIndex = function(id) {
        for (var i in nodes) {if (nodes[i]["id"] === id) return i};
    }

    // set up the D3 visualisation in the specified element
    var w = $(el).innerWidth(),
        h = $(el).innerHeight();

    var vis = this.vis = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var force = d3.layout.force()
        .gravity(.05)
        .distance(function(d) {
            // calculate distance based on sum of their attractions
            var dist = 120 - attractionSum(d);
            return dist > 40 ? dist : 40; })
        .charge(-500)
        .size([w, h]);

    var nodes = force.nodes(),
        links = force.links();

    var update = function () {

        var link = vis.selectAll("line.link")
            .data(links, function(d) { return d.source.id + "-" + d.target.id; });

        link.enter().insert("line")
            .attr("class", "link")
            .style("stroke", function(d) {
                var sum = attractionSum(d);
                return d3.rgb(158+2*sum, 202-sum, 225-2*sum);
            })
            .style("stroke-width", function(d) {
                var sum = attractionSum(d);
                return 2 + (sum/20);
            });

        link.exit().remove();


        var node = vis.selectAll("g.node")
            .data(nodes, function(d) { return d.id;})
	    .on('click', function(d) {
		d.clicked = true;
	    });

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .call(force.drag);


        node.append("circle")
            // .attr("cx", function(d) { return d.x + Math.random()*100; })
            // .attr("cy", function(d) { return d.y; })
            .attr("r", 30)
            .style("fill", "#9b2826")
            .style('stroke-width', 2.5)
            .style('stroke', function(d) {
                return d.clicked ? "#333" : "#9b2826";
            });

        node.append("svg:image")
            .attr('xlink:href', '../img/snapchat.jpg')
            .attr("width", 36)
            .attr("height", 36)
            .attr("x", -18)
            .attr("y", -18)
            .call(fetchTwitterImg);


        node.exit().remove();

        force.on("tick", function() {
            
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        });

        node.order();

        // Restart the force layout.
        force.start();


    } // end update

    function attractionSum(d) {
        var sum = 0;
        if(d.source.attraction[d.target.id] !== undefined)
            sum += d.source.attraction[d.target.id];
        if(d.target.attraction[d.source.id] !== undefined)
            sum += d.target.attraction[d.source.id];
        return sum;
    }

    function fetchTwitterImg(selection) {
        var users = selection[0];
        for(var i = 0; i < users.length; i++) {
            // if always runs, that means we got an image back so we the node's image 
            var currUser = users[i];
            if(currUser !== null) {
                var username = users[i].__data__.id;
                console.log('username is', username);   
                $.ajax({
                    url:'https://api.twitter.com/1/users/profile_image?screen_name='+username+'&size=bigger',
                    crossDomain: true,
                    dataType: 'jsonp'
                }).always(function(eye, usrnm) { 
                    return function(a, b) {
                        users[eye].href.baseVal = 'https://api.twitter.com/1/users/profile_image?screen_name='+usrnm+'&size=bigger';
                    }
                }(i, username));
            }
        }
    }

    // show tooltip
    function mouseover(d) {
        console.log(d3.select(d));
        var svg = d3.select(d)[0][0];
        if(!svg.id) {
            $('#tooltip').html(svg._id);
        } else {
            $('#tooltip').html(svg.id); 
        }
        $('#tooltip').show(0);
    }

    // hide tooltip
    function mouseout(d) {
        $('#tooltip').hide(0);
    }

    // Make it all go
    update();
}
