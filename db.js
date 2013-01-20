var Db = require('mongodb').Db;
var env = process.env.NODE_ENV || 'development';
var async = require('async');

var getUser = function(user, fun) {
    Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
        if(!err) {
            console.log("We are connected!");
            
            db.collection('users').findOne({_id:user},function(err, result) {
		if (err)
		    return console.dir(err);
		else{
            	    fun(result);
		}
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
	    userObject.t = new Date();

	    console.log('adding to db: ' + JSON.stringify(userObject));

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
			// loop through all children
			if(arOut != null)
			{
			    if(arOut[0] === undefined) {
				console.log('arOut is undefined');
			    }
			    else {
				if(arOut[0].children) {
				    netDat.name = user;
				    var kids = [];
				    
				    for(var i=0; i<arOut[0].children.length; i++) {
					if(arOut[0].children[i].name === undefined) {
					    continue;
					}
					else {
					    var child = getNetwork(arOut[0].children[i].name, depth-1, fun);
					    kids.push(child);
					}
				    }

				    netDat.children = kids;

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

var refreshGraph = function(user, res) {
    //Refreshes graph to DB given a username until it can't recurse any farther

    var dat = {};
    dat.name = user;

    Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
        if(!err) {
	    console.log("We are connected!");
	    db.collection('users').findOne({_id: user}, function(err, out) {
		if (err) return console.dir(err);
		if (!out) return;


		console.log('user ' + JSON.stringify(out.children));

		switch(out.children.length) {
		    
		case 0: 
		    dat.children = [];
		    res.send(dat);
		    break;

		case 1: 
		    db.collection('users').findOne({_id: out.children[0].name}, function(err, out0) {
			var f = [];
			f.push({name: out0._id, score: out0.score});
			dat.children = f;
			
			res.send(JSON.stringify(dat));
			
		    });
		    break;

		case 2: 
                    db.collection('users').findOne({_id: out.children[0].name}, function(err, out0) {
		        db.collection('users').findOne({_id: out.children[1].name}, function(err, out1) {
			    var f = [];
			    
			    f.push({name: out0._id, score: out0.score});
			    f.push({name: out1._id, score: out1.score});

			    dat.children = f;
			    
			    res.send(JSON.stringify(dat));
			});
		    });		

		    break;

		case 3: 
                    db.collection('users').findOne({_id: out.children[0].name}, function(err, out0) {
		        db.collection('users').findOne({_id: out.children[1].name}, function(err, out1) {
			    db.collection('users').findOne({_id: out.children[2].name}, function(err, out2) {
			        var f = [];
				
				f.push({name: out0._id, score: out0.score});
				f.push({name: out1._id, score: out1.score});
				f.push({name: out2._id, score: out2.score});

				dat.children = f;
				
				res.send(JSON.stringify(dat));
			    });
			});
		    });		
		    break;
		}

	    });
	}
        else {
	    console.log("Error, not connected: " + err);
        }
    });
};


var leaderboard = function(fun){
    Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
        if(!err) {
	    var options = {
		"limit": 10
	    };

            console.log("We are connected!");
            db.collection('users').find({}, {_id:true, score:true}, options).toArray(function(err, users) {
                if (err) return console.dir(err);
                else{
		    fun(users.sort(function(a, b){return b.score-a.score;}));
                }
            });
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
};

var globalDb = [];

var getGlobal = function(u1, u2, fun) {
    Db.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test', function(err, db) {
        if(!err) {
            console.log("We are connected!");
            db.collection('users').find({}).toArray(function(err, users) {
                if (err) return console.dir(err);
                else{
		    console.log(JSON.stringify(users));
		    globalDb = users;

		    fun( findB(u1, u2) );
                }
            });
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
};

var done = false;

var findB = function (u1, u2) {

    var cache = [];
    var queue = [];
    var next = u1;
    var retrace = {};
    
    while (next) {
	
	console.log('searched ' + next);

	if(cache.indexOf(next) == -1) {

	    if(next == u2) {
		console.log('done!');
		console.log('retrace: '+JSON.stringify(retrace));

		var path = [u2];

		var t2 = u2;
		while(t2 != u1) {
		    t2 = retrace[t2];
		    path.push(t2);
		}

		return path;
	    }
	    
	    // search for user in db
	    var u1Obj = null;
	    for(var i=0; i<globalDb.length; i++) {
		if(globalDb[i]._id == next) {
		    u1Obj = globalDb[i];
		    break;
		}
	    }
	    
	    if(u1Obj) {
		for(var i=0; i<u1Obj.children.length; i++) {
		    queue.push( u1Obj.children[i].name );
		    retrace[ u1Obj.children[i].name ] = u1Obj._id;
		}
	    }
	    
	}
	
	cache.push(next);

        next = queue.shift();
    }

    return [];

};


exports.getGlobal = getGlobal;
exports.refreshGraph = refreshGraph;
exports.leaderboard = leaderboard;
exports.getNetwork = getNetwork;
exports.getUser = getUser;
exports.addUser = addUser;
