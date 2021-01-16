var redirect = 'http://169.229.192.135:1377/#/';
var self_url = 'http://169.229.192.135:1379/';
//var redirect = 'https://cahlr.github.io/OpenITS';
var port = process.env.PORT || 1379; //sets local server port to 1379
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
  "Openstax Lesson 1.1": "2",
  "Openstax Lesson 1.2": "2",
  "Openstax Lesson 1.3": "3",
  "Openstax Lesson 1.4": "4",
  "Openstax Lesson 1.5": "5",
  "Openstax Lesson 1.6": "6",
  "Openstax Lesson 2.1": "7",
  "Openstax Lesson 2.2": "8",
  "Openstax Lesson 2.3": "9",
  "Openstax Lesson 2.4": "10",
  "Openstax Lesson 2.5": "11",
  "Openstax Lesson 2.6": "12",
  "Openstax Lesson 2.7": "13",
  "Openstax Lesson 3.1": "14",
  "Openstax Lesson 3.2": "15",
  "Openstax Lesson 3.3": "16",
  "Openstax Lesson 3.4": "17",
  "Openstax Lesson 3.5": "18",
  "Openstax Lesson 3.6": "19",
  "Openstax Lesson 3.7": "20",
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
  console.log("\nInvalid lesson num");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send("Invalid lesson ID. Please contact your teacher or the OpenITS development team to fix this error.");
});

app.post('/auth', function (req, res) {
  /*
  Takes in an LTI post request
  */
  console.log("\nAuth post");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log("Name: " + req.body.lis_person_name_full);
  console.log("Assignment: " + req.body.custom_canvas_assignment_title);

  var lessonNum = lessonMapping[req.body.custom_canvas_assignment_title];
  var provider = new lti.Provider('openits-key', secret);
  provider.valid_request(req, (err, is_valid) => {
    if (!is_valid || !provider.outcome_service) console.log(false);
  });
  providers[encodeURI(req.body.lis_person_name_full + "_lesson" + lessonNum)] = provider;
  
  
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
  console.log("\nGrade post");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log(req.body);
  var provider = providers[req.body.lis_person_name_full + "_lesson" + req.body.lessonNum];
  if (provider == null) {
    console.log("Invalid session detected.");
    console.log("Provider ID: " + req.body.lis_person_name_full + "_lesson" + req.body.lessonNum);
    res.send("Invalid session, likely due to the user sending a score for a lesson not authenticated for.");
    return;
  }
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
