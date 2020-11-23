var redirect = 'http://169.229.192.135:1337/';
//var redirect = 'https://cahlr.github.io/OpenITS';
var port = process.env.PORT || 1339; //sets local server port to 1339
var express = require('express'); // Express web server framework
var https = require("https");
var request = require('request');
var bodyParser = require('body-parser');
var lti = require('ims-lti');

var providers = {};
var provider;
var secret = 'openits-secret';
var app = express();

app.use(express.json());
app.use(bodyParser.json());                            // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies

// Disable cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

console.log("Starting up server on port: " + port);

// Routes
app.get('/auth', function (req, res) {
  console.log("Auth get");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send("Server only accepts post requests.");
});

app.post('/auth', function (req, res) {
  /*
  Takes in an LTI post request
  */
  console.log("Auth post");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log(req.body);
  provider = new lti.Provider('openits-key', secret);
  provider.valid_request(req, (err, is_valid) => {
    if (!is_valid || !provider.outcome_service) console.log(false);
  });
  providers[req.body.lis_person_name_full] = provider;
  
  res.writeHead(301,
    { Location: redirect + '/?lis_person_name_full=' + req.body.lis_person_name_full }
  );
  res.end();
  //res.send(req.body);
});


app.get('/grade', function (req, res) {
  console.log("Grade get");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send("Server only accepts post requests.");
});

app.post('/grade', function (req, res) {
  /*
  Takes in a body with 2 params:
  :param lis_person_name_full: Name, must match from the LTI request
  :param score: Float from range [0, 1]
  */
  console.log("Grade post");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log(req.body);
  provider = providers[req.body.lis_person_name_full];
  provider.outcome_service.send_replace_result_with_text(parseFloat(req.body.score), JSON.stringify(req.body.components), (err, result) => {
    if (!result) {
      console.log(result);
    }
  });
  res.send("Graded");
});


app.listen(port, function () { });