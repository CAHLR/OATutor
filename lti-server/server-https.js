var redirect = 'https://cahlr.github.io/OpenITS/#/';
var self_url = 'https://askoski.berkeley.edu:1339/';
//var redirect = 'https://cahlr.github.io/OpenITS';
var port = process.env.PORT || 1339; //sets local server port to 1339
var express = require('express'); // Express web server framework
var https = require("https");
var request = require('request');
var bodyParser = require('body-parser');
var lti = require('ims-lti');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/askoski.berkeley.edu/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/askoski.berkeley.edu/cert.pem')
};

var providers = {};
var secret = 'openits-secret';
// Needs to be configured to know what to redirect to
// Key: Canvas assignment
// Value: Lesson ID from OpenITS
var lessonMapping = {
  "OpenITS Lesson 1.1" : "11",
  "OpenITS Lesson 1.2" : "12",
  "OpenITS Lesson 1.3" : "13",
  "OpenITS Lesson 1.4" : "14",
  "OpenITS Lesson 1.5" : "15",
  "OpenITS Lesson 1.6" : "16",
  "OpenITS Lesson 2.1" : "17",
  "OpenITS Lesson 2.2" : "18",
  "OpenITS Lesson 2.3" : "19",
  "OpenITS Lesson 2.4" : "20",
  "OpenITS Lesson 2.5" : "21",
  "OpenITS Lesson 2.6" : "22",
  "OpenITS Lesson 2.7" : "23",
  "OpenITS Lesson 3.1" : "24",
  "OpenITS Lesson 3.2" : "25",
  "OpenITS Lesson 3.3" : "26",
  "OpenITS Lesson 3.4" : "27",
  "OpenITS Lesson 3.5" : "28",
  "OpenITS Lesson 3.6" : "39",
  "OpenITS Lesson 3.7" : "30",
  "OpenITS Lesson 4.1" : "31",
  "OpenITS Lesson 4.2" : "32",
  "OpenITS Lesson 5.1" : "33",
  "OpenITS Lesson 5.2" : "34",
  "OpenITS Lesson 5.3" : "35",
  "OpenITS Lesson 5.4" : "36",
  "OpenITS Lesson 5.5" : "37",
  "OpenITS Lesson 5.6" : "38",
  "OpenITS Lesson 5.7" : "39",
  "OpenITS Lesson 5.8" : "40",
  "OpenITS Lesson 6.1" : "41",
  "OpenITS Lesson 6.2" : "42",
  "OpenITS Lesson 6.3" : "43",
  "OpenITS Lesson 6.4" : "44",
  "OpenITS Lesson 6.5" : "45",
  "OpenITS Lesson 6.6" : "46",
  "OpenITS Lesson 6.7" : "47",
  "OpenITS Lesson 6.8" : "48",
  "OpenITS Lesson 7.1" : "49",
  "OpenITS Lesson 7.2" : "50",
  "OpenITS Lesson 7.3" : "51",
  "OpenITS Lesson 7.4" : "52",
  "OpenITS Lesson 7.5" : "53",
  "OpenITS Lesson 7.6" : "54",
  "OpenITS Lesson 7.7" : "55",
  "OpenITS Lesson 7.8" : "56",
  "Elementary Algebra Lesson 1.1" : "57",
  "Elementary Algebra Lesson 1.2" : "58",
  "Elementary Algebra Lesson 1.3" : "59",
  "Elementary Algebra Lesson 1.4" : "60",
  "Elementary Algebra Lesson 1.5" : "61",
  "Elementary Algebra Lesson 1.6" : "62",
  "Elementary Algebra Lesson 1.7" : "63",
  "Elementary Algebra Lesson 1.8" : "64",
  "Elementary Algebra Lesson 1.9" : "65",
  "Elementary Algebra Lesson 1.10" : "66",
  "Elementary Algebra Lesson 2.1" : "67",
  "Elementary Algebra Lesson 2.2" : "68",
  "Elementary Algebra Lesson 2.3" : "69",
  "Elementary Algebra Lesson 2.4" : "70",
  "Elementary Algebra Lesson 2.5" : "71",
  "Elementary Algebra Lesson 2.6" : "72",
  "Elementary Algebra Lesson 2.7" : "73",
  "Elementary Algebra Lesson 3.1" : "74",
  "Elementary Algebra Lesson 3.2" : "75",
  "Elementary Algebra Lesson 3.3" : "76",
  "Elementary Algebra Lesson 3.4" : "77",
  "Elementary Algebra Lesson 3.5" : "78",
  "Elementary Algebra Lesson 3.6" : "79",
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
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

  // Calculate overall score
  var score = req.body.score;
  var MASTERED = 0.95;
  score = Math.round(Math.min(mastery / (MASTERED - 0.1), 1.0) * 100);
  payload += "<h3> Overall score: " + score + "</h3>"
  Object.keys(req.body.components).forEach((key, i) => {
    // payload += "<p>" + (i + 1) + ") " + key + ": " + req.body.components[key] + "<p>";
    var r = Math.round(parseFloat(req.body.components[key]) * 10)
    payload += "<p>" + (i + 1) + ") " + key.replace(/_/g, ' ') + ": " + "&#9646;".repeat(r) +  "&#9647;".repeat(10 - r)   + "<p>";
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


//app.listen(port, function () { });

https.createServer(options, app).listen(port);