const port = process.env.PORT || 1339
const express = require('express')
const lti = require('ims-lti')
const jwt = require('jsonwebtoken');
const jwtMiddleware = require('express-jwt');
const level = require('level')
const { SITE_NAME } = require("../src/config/shared-config");
const { lessonMapping, numericalHashMapping } = require("./legacy-lesson-mapping");
const to = require("await-to-js").default;
const {spawn} = require('child_process');
var fs = require('fs'); 
const memoize = require("lodash.memoize")
const readJsExportedObject = require("../src/tools/readJsExportedObject");
const path = require("path")

const db = level('.mapping-db')

const consumerKeySecretMap = {
    // main (default) Canvas consumer
    'c7d7b10bee2face4e59e48f4bca34a80': 'bc3b62224d0635c06a2892456232d02a64e5232f9b9ee5d015a9abb65c883000ddcabde26bc630de5d4b71fd58bf5da02a7e8e31022948a3a5bd3f1f',

    // legacy Canvas consumer
    'openits-key': 'openits-secret',

    // demo consumer
    'key': 'secret',
}

const oatsHost = "https://cahlr.github.io/OATutor/#"
const stagingHost = "https://cahlr.github.io/OATutor-Staging/#"
const unlinkedPage = "assignment-not-linked"
const alreadyLinkedPage = "assignment-already-linked"
const jwtAlgorithm = "HS256"

const scorePrecision = 3 // how many decimal points to keep

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

/**
 * Gets the lesson associated with a resource_link_id
 * @param resource_link_id
 * @return {Promise<[Error, undefined]|[null, unknown]>}
 */
const getLinkedLesson = async (resource_link_id) => {
    return await to(db.get(resource_link_id))
}

/**
 * Creates (or updates) an association between resource_link_id and lesson_num
 * @param resource_link_id
 * @param lesson_num
 * @return {Promise<[Error, undefined]|[null, unknown]>}
 */
const setLinkedLesson = async (resource_link_id, lesson_num) => {
    return await to(db.put(resource_link_id, lesson_num))
}

/**
 * Generates a JWT for the requested user (provider)
 * @param provider
 * @param consumer_secret
 * @param consumer_key
 * @param linkedLesson
 * @param privileged
 * @return {*}
 */
const getJWT = (provider, consumer_secret, consumer_key, linkedLesson, privileged = false) => {
    return jwt.sign({
        // unique per assignment
        resource_link_id: provider.body.resource_link_id,

        // important for updating score
        lis_outcome_service_url: provider.body.lis_outcome_service_url,
        lis_result_sourcedid: provider.body.lis_result_sourcedid,
        ext_outcome_data_values_accepted: provider.body.ext_outcome_data_values_accepted,
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
        privileged
    }, consumer_secret, {
        algorithm: jwtAlgorithm,
        issuer: consumer_key,
        expiresIn: "7 days"
    })
}

app.post('/launch', async (req, res) => {
    const use_staging = !!req.body.use_staging || !!req.body.custom_use_staging
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

    let err, linkedLesson;
    [err, linkedLesson] = await getLinkedLesson(provider.body.resource_link_id);
    linkedLesson = await catchLegacyLessonID(linkedLesson, provider)

    const token = getJWT(provider, consumer_secret, consumer_key, linkedLesson, privileged)

    if (provider.student || provider.prospective_student || provider.alumni) {
        // find lesson to send to iff it has been linked by an instructor
        if (err || !linkedLesson) {
            res.writeHead(302, { Location: `${host}/${unlinkedPage}?token=${token}` })
        } else {
            res.writeHead(302, { Location: `${host}/lessons/${linkedLesson}?token=${token}` })
        }
    } else if (privileged) {
        // privileged, let them assign a lesson to the canvas assignment
        if (err || !linkedLesson) {
            res.writeHead(302, { Location: `${host}?token=${token}` })
        } else {
            res.writeHead(302, { Location: `${host}/${alreadyLinkedPage}?token=${token}&to=${linkedLesson}` })
        }
    } else {
        // invalid user type
        res.writeHead(302, { Location: `${host}/${unlinkedPage}?token=${token}` })
    }
    res.end()
})

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

/**
 * Takes an Express req object and finds the auth token in the fields
 * @param req
 * @return {string|null|*}
 */
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

    if (!req.body.lesson || !req.body.lesson.id) {
        res.status(400).send('no_lesson_selected').end()
        return
    }

    let err, linkedLesson;
    [err, linkedLesson] = await getLinkedLesson(user.resource_link_id);

    if (!err && linkedLesson) {
        res.status(400).send(`resource_already_linked|${JSON.stringify({
            from: user.resource_link_title,
            to: linkedLesson
        })}`).end()
        return;
    }

    [err] = await setLinkedLesson(user.resource_link_id, req.body.lesson.id);

    if (err) {
        console.debug('db put error', err)
        res.status(400).send('unknown_error').end()
        return
    }

    res.status(200).end()
})

/**
 * Handles score updates from learners via platform
 */
app.post('/postScore', jwtMiddleware({
    secret: multiTenantSecret,
    algorithms: [jwtAlgorithm],
    getToken
}), async (req, res) => {
    const { user = {}, body } = req
    const { consumer_key, linkedLesson } = user
    const { components, mastery } = body

    // console.debug('component and mastery from client: ', { components, mastery })

    const consumer_secret = consumerKeySecretMap[consumer_key]
    if (!consumer_key || !consumer_secret) {
        res.status(400).send('lost_link_to_lms').end()
        return
    }

    if (!linkedLesson) {
        res.status(400).send('lost_link_to_lms').end()
        return
    }

    const getCoursePlans = memoize(readJsExportedObject);
    const coursePlans = await getCoursePlans(path.join(__dirname, "..", "src", "config", "coursePlans.js"));
    let lessonName = null
    for (const course of coursePlans) {
        const { lessons = [] } = course
        const idxOfFind = lessons.find(lesson => lesson.id === linkedLesson)
        if (idxOfFind > -1) {
            lessonName = lessons[idxOfFind].name
            break
        }
    }

    const provider = new lti.Provider(consumer_key, consumer_secret)
    provider.parse_request(null, user)

    if (!provider.outcome_service) {
        res.status(400).send('unable_to_handle_score').end()
        return
    }

    const score = Math.round(mastery * Math.pow(10, scorePrecision)) / Math.pow(10, scorePrecision)    

    let semester = 'Spring 2022';
    let lesson = '1.1 Use the Language of Algebra';
    let canvasUserId = 'aaf8e7a1f1b767b5fdcb7ef73276814f810e639f';

    var formattedText = `
        <style>
            .tb { border-collapse: collapse;}
            .tb th, .tb td { padding: 10px; border: solid 1px #777; }
        </style>
    `;

    fs.readFile('data_script/data/full_analysis.csv', 'utf8', function(err, data){
        var dataList = data.split("\n");
        var problemInfo = {};
        dataList.forEach(problem => {
            let info = problem.split("\t");
            if (info[1] == semester && info[2] == lesson && info[3] == canvasUserId) {
                if (info[4] in problemInfo) {
                    problemInfo[info[4]].push(info.slice(5, 8));
                } else {
                    problemInfo[info[4]] = [info.slice(5, 8)];
                }
            }
        });

        for (const problem in problemInfo) {
            formattedText += `
                <a href="https://cahlr.github.io/OATutor-Content-Staging/#/debug/${problem}">
                    <h5 style="padding-top: 15px"> ${problem} </h5>
                </a>
                <table class="tb">
                <thead><tr>
                    <th>StepID</th>
                    <th>Student Answers</th>
                    <th>Time for Each Hint</th>
                </tr></thead>
                <tbody>
            `;
            problemInfo[problem].forEach(step => {
                formattedText += `
                <tr>
                    <td>${step[0]}</td>
                    <td>${step[1]}</td>
                    <td>${step[2]}</td>
                </tr>
            `;
            });
            formattedText += `
                </tbody>
            </table>
            `;
        }

        if (Object.keys(problemInfo).length === 0) {
            formattedText = "No student activity found for this lesson";
        }

        const text = `
            <h1> Component Breakdown </h1>
            <h4> Overall score: ${score}%</h4>
            ${Object
                .keys(components)
                .map((key, i) =>
                    `<p>${i + 1}) ${key.replace(/_/g, ' ')}: 
            ${"&#9646;".repeat((+components[key]) * 10)}
            ${"&#9647;".repeat(10 - (+components[key]) * 10)}
            </p>`
                )
                .join("")}
            <h4 style="padding-top: 10px"> Problem Stats </h4>
            ${formattedText}
        `;

        provider.outcome_service.send_replace_result_with_text(score, text, (err, result) => {
            if (err || !result) {
                console.debug('was unable to send result to your LMS', err)
                res.status(400).send('unable_to_handle_score').end()
                return
            }
    
            res.status(200).end()
        })
    });

})

/**
 * Support legacy Canvas middleware integration (where Canvas assignment names are mapped to lesson numbers)
 */
app.post('/auth', async (req, res) => {
    const { body = {} } = req
    const {
        lis_person_name_full,
        resource_link_title,
        resource_link_id,
        custom_canvas_assignment_title,
        tool_consumer_info_product_family_code,
        context_label,
        context_title,
        oauth_consumer_key,
    } = body

    const use_staging = !!req.body.use_staging || !!req.body.custom_use_staging
    const host = use_staging ? stagingHost : oatsHost

    // just in case it is not from Canvas
    const assignment_title = custom_canvas_assignment_title || resource_link_title || ""

    console.debug('received legacy launch request')
    console.debug(`platform: ${tool_consumer_info_product_family_code}, course: ${context_title} (${context_label})`)
    console.debug("student name: " + lis_person_name_full);
    console.debug("assignment title: " + assignment_title);

    const lessonNum = lessonMapping[assignment_title];
    let lessonID = null
    if ((Boolean(lessonNum) || lessonNum.toString() === "0") && !isNaN(+lessonNum) && (+lessonNum) < 150) {
        lessonID = numericalHashMapping[+lessonNum]
    }
    const consumer_key = oauth_consumer_key || "";
    const consumer_secret = consumerKeySecretMap[consumer_key] || "";
    const provider = new lti.Provider(consumer_key, consumer_secret);

    let errFlag = false

    provider.valid_request(req, (err, is_valid) => {
        if (!is_valid) {
            console.debug("legacy launch from lti consumer was invalid", err, is_valid, provider)
            res.send("Invalid request. Please try again or contact your teacher.")
            res.end()
            errFlag = true
        }
    });

    if (errFlag) return

    if (lessonNum == null || lessonID == null) {
        console.log(`Lesson does not exist for "${assignment_title}"`);
        res.send(`Invalid lesson ID. Please contact your teacher or the ${SITE_NAME} development team to fix this error.`);
        res.end();
    } else {
        let err, linkedLesson;
        [err, linkedLesson] = await getLinkedLesson(resource_link_id);
        if (err || !linkedLesson) {
            [err] = await setLinkedLesson(resource_link_id, lessonID);
            if (err) {
                console.error(`unable to set association for ${resource_link_id}, ${resource_link_title}, to lessonID: ${lessonID}`)
                // dangerous because grades may not be able to be parsed correctly
            }
        } else {
            linkedLesson = await catchLegacyLessonID(linkedLesson, provider)
        }

        const privileged = provider.ta || provider.admin || provider.instructor

        const token = getJWT(provider, consumer_secret, consumer_key, linkedLesson, privileged)

        res.writeHead(302, { Location: `${host}/lessons/${linkedLesson || lessonID}?token=${token}` })
        res.end();
    }
});

async function catchLegacyLessonID(linkedLesson, provider) {
    if ((Boolean(linkedLesson) || (linkedLesson === "0" || linkedLesson === 0)) && !isNaN(+linkedLesson) && (+linkedLesson) < 150) {
        // should catch all lessons that were set using numerical lesson IDs instead of the new uuid
        console.debug(`updating legacy numerical lesson id: ${linkedLesson} to ${numericalHashMapping[+linkedLesson]}`)
        linkedLesson = numericalHashMapping[+linkedLesson]
        await setLinkedLesson(provider.body.resource_link_id, linkedLesson)
    }
    return linkedLesson
}

app.get("/", (req, res) => {
    res.send(`Please visit ${oatsHost}`).end()
})

app.listen(port, () => {
    console.log(`LTI Provider Server is listening on port: ${port}`);
})
