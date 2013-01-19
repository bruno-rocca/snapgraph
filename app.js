var express = require('express');

var nodeio = require('node.io');
var qs = require('querystring');
var app = express.createServer(express.logger());
var scraper = require('./routes.js');

var db = require('./db.js');

app.get('/', function(req, res) {
  res.send("Index");
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

/** GETUSER
* Client: u = "octopi"
* Server: scrapes http://snapchat.com/octopi using nodeio
*         returns username, highscore, friends and associated scores
*/
app.get('/getuser', function(req, res) {
  var name = req.query.u;
  
  if (typeof name === "undefined"){
    res.send({"error":"No username given"});
  }
  else{
    console.log("Making a request for user: " + name);
    scraper.getUser(name, res);
  }
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
