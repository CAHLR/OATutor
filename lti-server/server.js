var redirect = 'http://169.229.192.135:1337/#/';
var self_url = 'http://169.229.192.135:1339/';
//var redirect = 'https://cahlr.github.io/OpenITS';
var port = process.env.PORT || 1339; //sets local server port to 1339
var express = require('express'); // Express web server framework
var https = require("https");
var request = require('request');
var bodyParser = require('body-parser');
var lti = require('ims-lti');

var providers = {};
var secret = 'openits-secret';
// Needs to be configured to know what to redirect to
// Key: Canvas assignment
// Value: Lesson ID from OpenITS
var lessonMapping = {
  "OpenITS Lesson 1": "2",
  "OpenITS Lesson 4": "5"
}

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

// Invalid lesson
app.get('/invalid_lesson_num', function (req, res) {
  console.log("Invalid lesson num");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send("Invalid lesson ID. Please contact your teacher or the OpenITS development team to fix this error.");
});

app.post('/auth', function (req, res) {
  /*
  Takes in an LTI post request
  */
  console.log("Auth post");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log("Name:" + req.body.lis_person_name_full);
  console.log("Assignment:" + req.body.custom_canvas_assignment_title);

  var provider = new lti.Provider('openits-key', secret);
  provider.valid_request(req, (err, is_valid) => {
    if (!is_valid || !provider.outcome_service) console.log(false);
  });
  providers[encodeURI(req.body.lis_person_name_full)] = provider;
  
  var lessonNum = lessonMapping[req.body.custom_canvas_assignment_title];
  if (lessonNum == null) {
    console.log("Lesson: " + req.body.custom_canvas_assignment_title);
    res.writeHead(301,
      { Location: self_url + 'invalid_lesson_num/' }
    );
    res.end();
  } else {
    console.log("Requested lesson:" + lessonNum);
    res.writeHead(301,
      { Location: redirect + 'lessons/' + lessonNum + '?lis_person_name_full=' + req.body.lis_person_name_full }
    );
    res.end();
  }
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
  var provider = providers[req.body.lis_person_name_full];
  var payload = "<h1> Component Breakdown </h1> <br/>";
  payload += "<h3> Overall score: " + req.body.score + "</h3>"
  Object.keys(req.body.components).forEach((key, i) => {
    payload += "<p>" + (i + 1) + ") " + key + ": " + req.body.components[key] + "<p>";
  });
  console.log(parseFloat(req.body.score));
  provider.outcome_service.send_replace_result_with_text(parseFloat(req.body.score), payload, (err, result) => {
    if (!result) {
      console.log(err);
      console.log("Error sending score to Canvas");
    }
  });
  console.log(payload);
  res.send("Graded");
});


app.listen(port, function () { });