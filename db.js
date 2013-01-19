var Db = require('mongodb').Db;
var env = process.env.NODE_ENV || 'development';
var async = require('async');

var getUser = function(user, fun) {
    Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
        if(!err) {
            console.log("We are connected!");
            
            db.collection('users').find({_id:user},function(err, result) {
		if (err) return console.dir(err);
                else result.toArray( function(err, arOut) {
                    console.log("output: " + JSON.stringify(arOut));
		    fun(arOut);
                } );
            });
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });

};

var addUser = function(userObject, fun) {
    Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
        if(!err) {
            console.log("We are connected!");
            db.collection('users').update({_id: userObject.name}, userObject, {upsert:true}, function(err) {
                if (err) return console.dir(err);
		fun();
            });
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
};

// returns a JSON of a user's network
var getNetwork = function(user, depth, fun) {
    var netDat = {};

    console.log("getNetwork: "+user+", "+depth);

    if(depth == 0) { // base case
	netDat.name = user;
	netDat.size = 1;
	console.log("in base case, returning "+JSON.stringify(netDat));
	return netDat;
    }
    else {
	Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
            if(!err) {
		console.log("We are connected!");
		
		db.collection('users').find({_id:user},function(err, result) {
		    if (err) return console.dir(err);
                    else result.toArray( function(err, arOut) {
			
			console.log("output: " + JSON.stringify(arOut));
			// loop through all friends
			if(arOut != null)
			{
			    if(arOut[0] === undefined) {
				console.log('arOut is undefined');
			    }
			    else {
				if(arOut[0].friends) {
				    netDat.name = user;
				    var kids = [];
				    
				    for(var i=0; i<arOut[0].friends.length; i++) {
					if(arOut[0].friends[i].name === undefined) {
					    continue;
					}
					else {
					    var child = getNetwork(arOut[0].friends[i].name, depth-1, fun);
					    kids.push(child);
					}
				    }

				    netDat.friends = kids;

				    console.log('depth = '+ depth);
				    if(depth == 2) {
					console.log('netDat: '+JSON.stringify(netDat));
					fun(netDat);
				    }
				    else {
					return netDat;
				    }
				}
			    }
			}
                    } );
		});
            }
            else {
		console.log("Error, not connected: " + err);
            }
	});
    }    
};

var refreshGraph = function(user, res, seen) {
    //Refreshes graph to DB given a username until it can't recurse any farther

    var netDat = {};
    netDat.name = user;

    Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
        if(!err) {
	    console.log("We are connected!");

	    db.collection('users').findOne({_id: user}, function(err, out) {
		if (err) return console.dir(err);

		if (!out) return;

		console.log("the output: " + JSON.stringify(out));
// ----------------------------

		if(seen.indexOf(out._id) > -1){
		    return;
		}
		else{
		    seen.push(out._id);

		    var kids = [];

		    for(var i = 0; i < out.friends.length; i++){

			console.log(out.friends[i].name);

			if(seen.indexOf(out.friends[i].name) > -1){
			    continue;
			}
			else{
			    exports.refreshGraph(out.friends[i].name, res, seen);
			}
		    }

		    res.send("Done");
		}


// ----------------------------
	    });
	}
        else {
	    console.log("Error, not connected: " + err);
        }
    });
};


exports.refreshGraph = refreshGraph;
exports.getNetwork = getNetwork;
exports.getUser = getUser;
exports.addUser = addUser;
