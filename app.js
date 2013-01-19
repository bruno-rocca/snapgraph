var express = require('express');
<<<<<<< HEAD
var nodeio = require('node.io');
var qs = require('querystring');
var app = express.createServer(express.logger());

var db = require('./db');

app.get('/', function(req, res) {
  db.myFunc1();
  res.send('index');
=======
var scraper = require('./routes.js');
var app = express.createServer(express.logger());

app.get('/getuser', function(req, res) {
  var name = req.query.u;
  
  if (typeof name === "undefined"){
	res.send({"error":"No username given"});
  }
  else{
	console.log("Making a request for user: " + name);
	var result = scraper.getUser(name);
	res.send(result);
  }
>>>>>>> b90ae74c0312914f79cd9cba9cbd21683c4c6691
});

// API endpoints

/** ADDUSER
 * Client: u = "binroot"
 * Server: scrapes http://snapchat.com/binroot using nodeio
 *         to save data to mongodb
 */
app.post('/adduser', function(req, res) {
    var body = '';
    req.on('data', function(data) {
        body += data;
    });
    req.on('end', function(data) {
        var POST_data = qs.parse(body);
	console.log("u = "+ POST_data.u );

	// TODO: call nodeio code

	res.send('works');
    });
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
