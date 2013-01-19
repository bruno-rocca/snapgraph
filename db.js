var Db = require('mongodb').Db;
var env = process.env.NODE_ENV || 'development';

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
            db.collection('users').insert(userObject, {w:1}, function(err, result) {
                if (err) return console.dir(err);
		fun;
            });
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
};


var networkData = "";

var getNetwork = function(user, depth, fun) {
    console.log("getNetwork: "+user+", "+depth);
    if(depth == 0) {
	fun(networkData);
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
			if(arOut[0].friends) {
			    for(var i=0; i<arOut[0].friends.length; i++) {
				if(arOut[0].friends[i].name === undefined) {
				    continue;
				}
				else {
				    networkData += arOut[0].friends[i].name+" ";
				    getNetwork(arOut[0].friends[i].name, depth-1, fun);
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

exports.getNetwork = getNetwork;
exports.getUser = getUser;
exports.addUser = addUser;
