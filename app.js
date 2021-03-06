var express = require('express');

var nodeio = require('node.io');
var qs = require('querystring');
var app = express.createServer(express.logger());

app.use(express.static(__dirname + '/public'));


var scraper = require('./routes.js');

var db = require('./db.js');

app.get('/', function(req, res) {
  res.render('landing.ejs', {layout: false});
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
*         returns username, highscore, children and associated scores
*/
app.get('/getuser', function(req, res) {
  var name = req.query.u;
   
  if (typeof name === "undefined" || name === ""){
    res.send({"error":"No username given"});
  }
  else{
    console.log("Making a /getUser request for user: " + name);
    scraper.getUser(name, res);
  }
});


app.get('/graph', function(req, res) {
  var name = req.query.u;
  db.refreshGraph(name, res);
});

/** REFRESHGRAPH
*   Client: u = "octopi"
*   Server: Updates the DB by doing a raw scrape of all connected users' pages, returns status of operation
*
*/
app.get('/refreshgraph', function(req, res){
  var name = req.query.u;
  var depth = req.query.depth || 4;
  
  if (typeof name === "undefined"){
    res.send({"error":"No username given"});
  }
  else if(depth > 10 || depth <= 0){
   res.send({"error":"Depth out of range"});
  }
  else{
    console.log("Making a /refreshgraph request for user: " + name);

    //Start depth off at 0
    scraper.refreshGraph(name, res, depth, 0, [name]);
  }
});

/** LEADERBOARD
*   Client: None
*   Server: JSON Array containing top 10 results from DB sorted descending by score
*/
app.get('/leaderboard', function(req, res){
  db.leaderboard(function(users){
    res.send(users);
  });
});

app.get('/link', function(req, res){
    var u1 = req.query.u1;
    var u2 = req.query.u2;
    db.getGlobal(u1, u2, function(out){
	res.send(JSON.stringify(out));
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
