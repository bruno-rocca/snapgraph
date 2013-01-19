var express = require('express');
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
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
