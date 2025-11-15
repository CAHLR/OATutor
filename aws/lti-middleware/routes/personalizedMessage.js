const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const OPENAI_MODEL =
  process.env.OPENAI_PERSONALIZED_MODEL || "gpt-4o-mini";

const openai =
  process.env.OPENAI_API_KEY &&
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

const requiredFields = [
  "motivation",
  "enrollmentReason",
  "personalChoice",
  "desiredField",
  "lessonTitle",
  "lessonContent",
];

const buildPrompt = (payload) => `
You are a supportive learning coach writing a single concise paragraph (2-4 sentences)
that motivates an adult learner at the start of a lesson. 

Student background:
- Motivation: ${payload.motivation || "N/A"}
- Enrollment reason: ${payload.enrollmentReason || "N/A"}
- Personal choice: ${payload.personalChoice || "N/A"}
- Desired field: ${payload.desiredField || "N/A"}

Lesson context:
- Title: ${payload.lessonTitle || "N/A"}
- Description: ${payload.lessonContent || "N/A"}

Guidelines:
- Reference both the learner context and the lesson topic.
- Highlight how the lesson supports their goals.
- Keep tone encouraging but professional.
- Output only the paragraph, no bullet points or extra commentary.
`;

router.post("/api/generate-personalized-message", async (req, res) => {
  try {
    if (!openai) {
      return res.status(500).json({
        error: "OPENAI_API_KEY not configured on the server",
      });
    }

    const missing = requiredFields.filter(
      (field) => !req.body || typeof req.body[field] !== "string"
    );

    if (missing.length) {
      return res.status(400).json({
        error: `Missing or invalid fields: ${missing.join(", ")}`,
      });
    }

    const prompt = buildPrompt(req.body);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.7,
      max_tokens: 250,
      messages: [
        {
          role: "system",
          content:
            "You are OATutor's personalization assistant. Provide supportive, specific orientation messages.",
        },
        { role: "user", content: prompt },
      ],
    });

    const message =
      completion?.choices?.[0]?.message?.content?.trim() || "";

    if (!message) {
      return res
        .status(502)
        .json({ error: "No message returned from language model" });
    }

    res.json({ message });
  } catch (error) {
    console.error(
      "[personalizedMessage] error generating message",
      error
    );
    res.status(500).json({
      error: "Failed to generate personalized message",
    });
  }
});

module.exports = router;

