var port = process.env.PORT || 8888; //sets local server port to 8888
var express = require('express'); // Express web server framework
var request = require('request');


var redirect_uri = 'http://localhost:8888'; // Your redirect uri in case you are using apis
var app = express();

console.log("Starting up server... Making requests");

var https = require("https");

app.get('/auth', function(req, res) {
  console.log("Displaying get");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send("Hello World");
});

app.post('/auth', function(req, res) {
    console.log("Displaying post");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send("Hello World"+req);
  });


app.listen(port, function() {}); //starts the server, alternatively you can use app.listen(port)