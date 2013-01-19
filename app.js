var express = require('express');
var nodeio = require('node.io');
var qs = require('querystring');
var app = express.createServer(express.logger());

app.get('/', function(req, res) {
  res.send('index');
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
