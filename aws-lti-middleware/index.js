const express = require("express");
const lti = require("ims-lti");
const jwt = require("jsonwebtoken");
const jwtMiddleware = require("express-jwt");
const {
  lessonMapping,
  numericalHashMapping,
} = require("./legacy-lesson-mapping.js");
const { SITE_NAME } = require("@common/global-config");
const { calculateSemester } = require("./calculateSemester.js");
const to = require("await-to-js").default;
const firebaseAdmin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serverless = require("serverless-http");
const serviceAccount = require("./oatutor-firebase-adminsdk.json");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand} = require("@aws-sdk/lib-dynamodb");


const consumerKeySecretMap = {
  // main (default) Canvas consumer
  c7d7b10bee2face4e59e48f4bca34a80:
    "bc3b62224d0635c06a2892456232d02a64e5232f9b9ee5d015a9abb65c883000ddcabde26bc630de5d4b71fd58bf5da02a7e8e31022948a3a5bd3f1f",

  // legacy Canvas consumer
  "openits-key": "openits-secret",

  // demo consumer
  key: "secret",
};

const oatsHost = "https://cahlr.github.io/OATutor/#";
const stagingHost = "https://cahlr.github.io/OATutor-Staging/#";
const unlinkedPage = "assignment-not-linked";
const alreadyLinkedPage = "assignment-already-linked";
const jwtAlgorithm = "HS256";
const scorePrecision = 3; // how many decimal points to keep

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
const firestoredb = firebaseAdmin.firestore()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// middleware to allow relaxed CORs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// trust that the reverse proxy has the correct protocol
app.enable("trust proxy");

const getLinkedLesson = async (resource_link_id) => {
  console.log("getting linked lesson");
  const params = {
    TableName: "resource-lesson-linkage",
    Key: {
      "resource_id": resource_link_id
    },
  }
  console.log(params);
  try {
    const data = await docClient.send(new GetCommand(params));
    return data.Item.lesson_id;
  } catch (error) {
    console.log("getLinkedLesson error: ", error)
    return null;
  }
};

const setLinkedLesson = async (resource_link_id, lesson_num) => {
  console.log("setting linked lesson");
  const params = {
    TableName: "resource-lesson-linkage",
    Item: {
      "resource_id": resource_link_id,
      "lesson_id": lesson_num,
    },
  }
  console.log(params);
  try {
    const data = await docClient.send(new PutCommand(params));
    return true;
  } catch (error) {
    console.log("setLinkedLesson error: ", error)
    return false;
  }
};

/**
 * Generates a JWT for the requested user (provider)
 * @param provider
 * @param consumer_secret
 * @param consumer_key
 * @param linkedLesson
 * @param privileged
 * @return {*}
 */
const getJWT = (
  provider,
  consumer_secret,
  consumer_key,
  linkedLesson,
  privileged = false
) => {
  return jwt.sign(
    {
      // unique per assignment
      resource_link_id: provider.body.resource_link_id,

      // important for updating score
      lis_outcome_service_url: provider.body.lis_outcome_service_url,
      lis_result_sourcedid: provider.body.lis_result_sourcedid,
      ext_outcome_data_values_accepted:
        provider.body.ext_outcome_data_values_accepted,
      consumer_key,
      signer: provider.body.signer,

      // general fields
      resource_link_title: provider.body.resource_link_title,
      user_id: provider.userId,
      full_name: provider.body.lis_person_name_full,
      course_name: provider.body.context_title,
      course_code: provider.body.context_label,
      course_id: provider.body.context_id,
      linkedLesson,

      // indicates if user is able to edit the linkage
      privileged,
    },
    consumer_secret,
    {
      algorithm: jwtAlgorithm,
      issuer: consumer_key,
      expiresIn: "7 days",
    }
  );
};

app.post("/launch", async (req, res) => {
  console.log("launch called");
  console.log(req);
  const host = oatsHost;

  const consumer_key = req.body.oauth_consumer_key || "";
  const consumer_secret = consumerKeySecretMap[consumer_key] || "";
  const provider = new lti.Provider(consumer_key, consumer_secret);


  provider.valid_request(req);
  console.log("lti provider initialized, populated");


  const privileged = provider.ta || provider.admin || provider.instructor;
  console.log("privileged: ", privileged);

  let linkedLesson;
  linkedLesson = await getLinkedLesson(provider.body.resource_link_id);
  linkedLesson = await catchLegacyLessonID(linkedLesson, provider);

  const token = getJWT(
    provider,
    consumer_secret,
    consumer_key,
    linkedLesson,
    privileged
  );

  if (provider.student || provider.prospective_student || provider.alumni) {
    // find lesson to send to iff it has been linked by an instructor
    if (!linkedLesson) {
      console.log("student, and not linked");
      console.log(`${host}/${unlinkedPage}?token=${token}`);
      res.writeHead(302, {
        Location: `${host}/${unlinkedPage}?token=${token}`,
      });
    } else {
      console.log("student, and linked");
      console.log(`${host}/lessons/${linkedLesson}?token=${token}`);
      res.writeHead(302, {
        Location: `${host}/lessons/${linkedLesson}?token=${token}`,
      });
    }
  } else if (privileged) {
    // privileged, let them assign a lesson to the canvas assignment
    if (!linkedLesson) {
      console.log("instructor, and not linked");
      console.log(`${host}?token=${token}`)
      res.writeHead(302, { Location: `${host}?token=${token}` });
    } else {
      console.log("instructor, and linked");
      console.log(`${host}/${alreadyLinkedPage}?token=${token}&to=${linkedLesson}`);
      res.writeHead(302, {
        Location: `${host}/${alreadyLinkedPage}?token=${token}&to=${linkedLesson}`,
      });
    }
  } else {
    // invalid user type
    console.log("invalid user type");
    res.writeHead(302, { Location: `${host}/${unlinkedPage}?token=${token}` });
  }
  res.end();
});

/**
 * Determines the secret to check against based on the issuer field on the jwt token
 * @param req
 * @param payload
 * @param done
 * @return {*}
 */
const multiTenantSecret = (req, payload, done) => {
  const issuer = payload.iss;
  if (!issuer) {
    console.debug("issuer was not present on jwt token");
    return done(new Error("invalid_issuer")); // has the external app been set up properly?
  }
  const secret = consumerKeySecretMap[issuer];
  if (!secret) {
    console.debug("issuer does not correspond to an assigned issuer");
    return done(new Error("invalid_issuer")); // has the external app been set up properly?
  }
  return done(null, secret);
};

/**
 * Takes an Express req object and finds the auth token in the fields
 * @param req
 * @return {string|null|*}
 */
const getToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  } else if (req.body && req.body.token) {
    return req.body.token;
  }
  return null;
};

/**
 * Meant for instructors to assign a lesson to a Canvas assignment
 */
app.post(
  "/setLesson",
  jwtMiddleware({
    secret: multiTenantSecret,
    algorithms: [jwtAlgorithm],
    getToken,
  }),
  async (req, res) => {
    console.log("======= setLesson called =======");
    const { user } = req;

    if (!user.privileged) {
      console.log("user not privileged");
      res.status(403).send("user_not_privileged").end();
      console.log("user not privileged");
      return;
    }

    if (!user.resource_link_id) {
      console.log("lost link to resource");
      res.status(400).send("lost_link_to_resource").end();
      return;
    }

    if (!req.body.lesson || !req.body.lesson.id) {
      console.log("no lesson selected");
      res.status(400).send("no_lesson_selected").end();
      return;
    }

    let validPut, linkedLesson;
    linkedLesson = await getLinkedLesson(user.resource_link_id);
    console.log("linkedLesson: ", linkedLesson);

    if (linkedLesson) {
      res
        .status(400)
        .send(
          `resource_already_linked|${JSON.stringify({
            from: user.resource_link_title,
            to: linkedLesson,
          })}`
        )
        .end();
      return;
    }

    validPut = await setLinkedLesson(user.resource_link_id, req.body.lesson.id);

    if (!validPut) {
      res.status(400).send("unknown_error").end();
      return;
    }

    res.status(200).end();
  }
);

/**
 * Handles score updates from learners via platform
 */
app.post(
  "/postScore",
  jwtMiddleware({
    secret: multiTenantSecret,
    algorithms: [jwtAlgorithm],
    getToken,
  }),
  async (req, res) => {
    console.log("======= postScore called =======");
    const { user = {}, body } = req;
    const { consumer_key, linkedLesson, user_id } = user;
    const { components, mastery } = body;

    const consumer_secret = consumerKeySecretMap[consumer_key];
    if (!consumer_key || !consumer_secret) {
      res.status(400).send("lost_link_to_lms").end();
      return;
    }

    if (!linkedLesson) {
      res.status(400).send("lost_link_to_lms").end();
      return;
    }

    // TODO: check if this works properly
    const coursePlans = require("coursePlans.json");
    const _coursePlansNoEditor = coursePlans.filter(({ editor }) => !!!editor);
    let lessonName = null;

    for (const course of _coursePlansNoEditor) {
      const { lessons = [] } = course;
      const idxOfFind = lessons.findIndex(
        (lesson) => lesson.id === linkedLesson
      );
      if (idxOfFind > -1) {
        lessonName =
          lessons[idxOfFind].name.split(" ")[1] +
          " " +
          lessons[idxOfFind].topics;
        break;
      }
    }

    const provider = new lti.Provider(consumer_key, consumer_secret);
    provider.parse_request(null, user);

    if (!provider.outcome_service) {
      res.status(400).send("unable_to_handle_score").end();
      return;
    }

    const score =
      Math.round(mastery * Math.pow(10, scorePrecision)) /
      Math.pow(10, scorePrecision);

    let semester = calculateSemester(Date.now());
    let lmsUserId = user_id;
    let lesson = lessonName;
    const submissionsRef = firestoredb.collection("problemSubmissions");
    // const submissionsRef = firestoredb.collection('development_problemSubmissions');

    const queryRef = submissionsRef
      .where("semester", "==", semester)
      .where("lms_user_id", "==", lmsUserId)
      .where("lesson", "==", lesson)
      .orderBy("time_stamp", "asc")
      .orderBy("problemID", "asc");
    const result = await queryRef.get();

    var formattedText = `
        <style>
            .tb { border-collapse: collapse; text-align: center; }
            .tb th, .tb td { padding: 10px; border: solid 1px #777; }
            .correct { background-color: #bde9ba; }
            .wrong { background-color: #f2a6a2; }
        </style>
        <table class="tb">
            <thead><tr>
                <th>Problem ID</th>
                <th>Step ID</th>
                <th>Action Type</th>
                <th>Student Answer</th>
                <th>Time Taken (s)</th>
            </tr></thead>
            <tbody>
    `;

    var lastProblemID = "";
    var lastStepID = "";
    var lastTime = -1;

    // get time of first action
    const firstQueryRef = submissionsRef
      .where("semester", "==", semester)
      .where("lms_user_id", "==", lmsUserId)
      .where("lesson", "==", lesson)
      .orderBy("time_stamp", "asc")
      .orderBy("problemID", "asc")
      .limit(1);
    const firstResult = await firstQueryRef.get();

    firstResult.forEach((action) => {
      let data = action.data();
      lastTime = data["time_stamp"];
    });

    // get time of last action before this lesson
    const prevQueryRef = submissionsRef
      .where("lms_user_id", "==", lmsUserId)
      .where("time_stamp", "<", lastTime)
      .orderBy("time_stamp", "desc")
      .limit(1);
    const prevResult = await prevQueryRef.get();

    if (prevResult.size == 0) {
      lastTime = -1;
    } else {
      prevResult.forEach((action) => {
        let data = action.data();
        lastTime = data["time_stamp"];
      });
    }

    result.forEach((action) => {
      let data = action.data();
      var problemID = "";
      if (data["problemID"] != lastProblemID) {
        problemID = `<a href="https://cahlr.github.io/OATutor-Content-Staging/#/debug/${data["problemID"]}">${data["problemID"]}</a>`;
        lastProblemID = data["problemID"];
      }
      var stepID = "";
      if (data["stepID"] != lastStepID) {
        stepID = data["stepID"];
        lastStepID = data["stepID"];
      }

      let eventType = data["eventType"];

      let input = data["input"]
        ? data["input"]
        : data["hintInput"]
        ? data["hintInput"]
        : "";

      var time =
        lastTime == -1
          ? "N/A"
          : Math.round((data["time_stamp"] - lastTime) / 1000);
      if (time > 300) {
        time = ">300";
      }

      var correct = null;
      if (data["isCorrect"] || data["hintIsCorrect"]) {
        correct = true;
      } else if (data["isCorrect"] == false || data["hintIsCorrect"] == false) {
        correct = false;
      }

      let bgColor = correct ? "correct" : correct !== null ? "wrong" : "na";

      if (eventType === "unlockHint") {
        bgColor = "na";
      }

      lastTime = data["time_stamp"];

      formattedText += `
        <tr>
            <td>${problemID}</td>
            <td>${stepID}</td>
            <td>${eventType}</td>
            <td class="${bgColor}">${input}</td>
            <td>${time}</td>
        </tr>
        `;
    });

    formattedText += `
                </tbody>
            </table>
            `;

    if (result.size == 0) {
      formattedText = "No student activity found for this lesson.";
    }

    const text = `
        <h1> Component Breakdown </h1>
        <h4> Overall score: ${Math.round(score * 10000) / 100}%</h4>
        ${Object.keys(components)
          .map(
            (key, i) =>
              `<p>${i + 1}) ${key.replace(/_/g, " ")}: 
        ${"&#9646;".repeat(+components[key] * 10)}
        ${"&#9647;".repeat(10 - +components[key] * 10)}
        </p>`
          )
          .join("")}
        <h4 style="padding-top: 10px"> Problem Stats </h4>
        ${formattedText}
    `;

    provider.outcome_service.send_replace_result_with_text(
      score,
      text,
      (err, result) => {
        if (err || !result) {
          console.debug("was unable to send result to your LMS", err);
          res.status(400).send("unable_to_handle_score").end();
          return;
        }

        res.status(200).end();
      }
    );
  }
);

/**
 * Support legacy Canvas middleware integration (where Canvas assignment names are mapped to lesson numbers)
 */
app.post("/auth", async (req, res) => {
  const { body = {} } = req;
  const {
    lis_person_name_full,
    resource_link_title,
    resource_link_id,
    custom_canvas_assignment_title,
    tool_consumer_info_product_family_code,
    context_label,
    context_title,
    oauth_consumer_key,
  } = body;

  const host = oatsHost;

  // just in case it is not from Canvas
  const assignment_title =
    custom_canvas_assignment_title || resource_link_title || "";

  console.debug("received legacy launch request");
  console.debug(
    `platform: ${tool_consumer_info_product_family_code}, course: ${context_title} (${context_label})`
  );
  console.debug("student name: " + lis_person_name_full);
  console.debug("assignment title: " + assignment_title);

  const lessonNum = lessonMapping[assignment_title];
  let lessonID = null;
  if (
    (Boolean(lessonNum) || lessonNum.toString() === "0") &&
    !isNaN(+lessonNum) &&
    +lessonNum < 150
  ) {
    lessonID = numericalHashMapping[+lessonNum];
  }
  const consumer_key = oauth_consumer_key || "";
  const consumer_secret = consumerKeySecretMap[consumer_key] || "";
  const provider = new lti.Provider(consumer_key, consumer_secret);

  let errFlag = false;

  provider.valid_request(req, (err, is_valid) => {
    if (!is_valid) {
      console.debug(
        "legacy launch from lti consumer was invalid",
        err,
        is_valid,
        provider
      );
      res.send("Invalid request. Please try again or contact your teacher.");
      res.end();
      errFlag = true;
    }
  });

  if (errFlag) return;

  if (lessonNum == null || lessonID == null) {
    console.log(`Lesson does not exist for "${assignment_title}"`);
    res.send(
      `Invalid lesson ID. Please contact your teacher or the ${SITE_NAME} development team to fix this error.`
    );
    res.end();
  } else {
    let err, linkedLesson;
    linkedLesson = await getLinkedLesson(resource_link_id);
    if (!linkedLesson) {
      err = await setLinkedLesson(resource_link_id, lessonID);
      if (err) {
        console.error(
          `unable to set association for ${resource_link_id}, ${resource_link_title}, to lessonID: ${lessonID}`
        );
        // dangerous because grades may not be able to be parsed correctly
      }
    } else {
      linkedLesson = await catchLegacyLessonID(linkedLesson, provider);
    }

    const privileged = provider.ta || provider.admin || provider.instructor;

    const token = getJWT(
      provider,
      consumer_secret,
      consumer_key,
      linkedLesson,
      privileged
    );

    res.writeHead(302, {
      Location: `${host}/lessons/${linkedLesson || lessonID}?token=${token}`,
    });
    res.end();
  }
});

async function catchLegacyLessonID(linkedLesson, provider) {
  if (
    (Boolean(linkedLesson) || linkedLesson === "0" || linkedLesson === 0) &&
    !isNaN(+linkedLesson) &&
    +linkedLesson < 150
  ) {
    // should catch all lessons that were set using numerical lesson IDs instead of the new uuid
    console.debug(
      `updating legacy numerical lesson id: ${linkedLesson} to ${
        numericalHashMapping[+linkedLesson]
      }`
    );
    linkedLesson = numericalHashMapping[+linkedLesson];
    await setLinkedLesson(provider.body.resource_link_id, linkedLesson);
  }
  return linkedLesson;
}

module.exports.handler = serverless(app);