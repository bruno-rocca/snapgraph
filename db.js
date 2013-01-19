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

/* 
var networkData = {};

var getNetwork = function(user, depth, fun) {
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
			
                    } );
		});
            }
            else {
		console.log("Error, not connected: " + err);
            }
	});
    }
};
*/
exports.getUser = getUser;
exports.addUser = addUser;
