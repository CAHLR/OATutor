const port = process.env.PORT || 1339
const express = require('express')
const lti = require('ims-lti')
const jwt = require('jsonwebtoken');
const jwtMiddleware = require('express-jwt');
const level = require('level')
const to = require("await-to-js").default;

const db = level('.mapping-db')

const consumerKeySecretMap = {
  // main canvas consumer
  'c7d7b10bee2face4e59e48f4bca34a80': 'bc3b62224d0635c06a2892456232d02a64e5232f9b9ee5d015a9abb65c883000ddcabde26bc630de5d4b71fd58bf5da02a7e8e31022948a3a5bd3f1f'
}

const oatsHost = "https://cahlr.github.io/OpenITS/#"
const stagingHost = "https://cahlr.github.io/OATutor-Staging/#"
const unlinkedPage = "assignment-not-linked"
const jwtAlgorithm = "HS256"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// middleware to allow relaxed CORs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

// trust that the reverse proxy has the correct protocol
app.enable('trust proxy')

const getLinkedLesson = async (resource_link_id) => {
  return await to(db.get(resource_link_id))
}

app.post('/launch', async (req, res) => {
  const use_staging = !!req.body.use_staging
  const host = use_staging ? stagingHost : oatsHost

  const consumer_key = req.body.oauth_consumer_key || "";
  const consumer_secret = consumerKeySecretMap[consumer_key] || "";
  const provider = new lti.Provider(consumer_key, consumer_secret);

  let errFlag = false

  provider.valid_request(req, (err, is_valid) => {
    if (!is_valid) {
      console.debug("launch from lti consumer was invalid", err, is_valid, provider)
      res.send("Invalid request. Please try again or contact your teacher.")
      res.end()
      errFlag = true
    }
  });

  if (errFlag) return

  const privileged = provider.ta || provider.admin || provider.instructor

  const token = jwt.sign({
    // unique per assignment
    resource_link_id: provider.body.resource_link_id,

    // important for updating score
    lis_outcome_service_url: provider.body.lis_outcome_service_url,
    lis_result_sourcedid: provider.body.lis_result_sourcedid,
    ext_outcome_data_values_accepted: provider.body.ext_outcome_data_values_accepted,
    signer: provider.body.signer,

    // general fields
    resource_link_title: provider.body.resource_link_title,
    user_id: provider.userId,
    full_name: provider.body.lis_person_name_full,

    // indicates if user is able to edit the linkage
    privileged
  }, consumer_secret, {
    algorithm: jwtAlgorithm,
    issuer: consumer_key,
    expiresIn: "7 days"
  })

  if (provider.student || provider.prospective_student || provider.alumni) {
    // find lesson to send to iff it has been linked by an instructor
    let err, result;
    [err, result] = await getLinkedLesson(provider.body.resource_link_id);
    if(err || !result){
      res.writeHead(302, { Location: `${host}/${unlinkedPage}?token=${token}` })
    }else{
      res.writeHead(302, { Location: `${host}/lessons/${result}?token=${token}` })
    }
  } else if (privileged) {
    // privileged, let them assign a lesson to the canvas assignment
    res.writeHead(302, { Location: `${host}?token=${token}` })
  } else {
    // invalid user type
    res.writeHead(302, { Location: `${host}/${unlinkedPage}?token=${token}` })
  }
  res.end()
})

const multiTenantSecret = (req, payload, done) => {
  const issuer = payload.iss;
  if (!issuer) {
    console.debug('issuer was not present on jwt token')
    return done(new Error("invalid_issuer")) // has the external app been set up properly?
  }
  const secret = consumerKeySecretMap[issuer];
  if (!secret) {
    console.debug('issuer does not correspond to an assigned issuer')
    return done(new Error("invalid_issuer")) // has the external app been set up properly?
  }
  return done(null, secret)
}

const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  } else if (req.body && req.body.token) {
    return req.body.token;
  }
  return null;
}

/**
 * Meant for instructors to assign a lesson to a Canvas assignment
 */
app.post('/setLesson', jwtMiddleware({
  secret: multiTenantSecret,
  algorithms: [jwtAlgorithm],
  getToken
}), async (req, res) => {
  const { user } = req

  if (!user.privileged) {
    res.status(403).send('user_not_privileged').end()
    return
  }

  if (!user.resource_link_id) {
    res.status(400).send('lost_link_to_resource').end()
    return
  }

  if (!req.body.lesson || !req.body.lesson.lessonNum) {
    res.status(400).send('no_lesson_selected').end()
    return
  }

  let err, result;
  [err, result] = await getLinkedLesson(user.resource_link_id);

  if (!err && result) {
    res.status(400).send(`resource_already_linked|${JSON.stringify({
      from: user.resource_link_title,
      to: result
    })}`).end()
    return;
  }

  [err] = await to(db.put(user.resource_link_id, req.body.lesson.lessonNum));

  if (err) {
    console.debug('db put error', err)
    res.status(400).send('unknown_error').end()
    return
  }

  res.status(200).end()
})

app.listen(port, () => {
  console.log(`LTI Provider Server is listening on port: ${port}`);
})
