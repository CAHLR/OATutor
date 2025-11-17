const express = require("express");
const OpenAI = require("openai");
const logger = require("../logger");

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

const extractIndustry = async (payload) => {
  const industryPrompt = `
Extract the primary industry, field, or career area the student wants to work in from their intake responses.
Be robust to typos, unclear phrasing, and informal language. Return a clean, professional industry/field name (2-4 words max).

Student responses:
- Desired field: "${payload.desiredField || ""}"
- Motivation: "${payload.motivation || ""}"
- Enrollment reason: "${payload.enrollmentReason || ""}"

Return ONLY the industry/field name (e.g., "Data Analytics", "Healthcare", "Software Engineering", "Business Management").
If you cannot determine a clear industry, return "Your Chosen Field".
`;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 20,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts and normalizes industry/field names from student responses.",
        },
        { role: "user", content: industryPrompt },
      ],
    });

    const industry =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Your Chosen Field";
    return industry.replace(/^["']|["']$/g, ""); // Remove quotes if present
  } catch (error) {
    logger.error({ err: error }, "Error extracting industry");
    return "Your Chosen Field";
  }
};

router.post("/api/generate-personalized-message", async (req, res) => {
  try {
    if (!openai) {
      logger.error(
        { hasKey: Boolean(process.env.OPENAI_API_KEY) },
        "OPENAI_API_KEY not configured; personalization unavailable"
      );
      return res.status(500).json({
        error: "OPENAI_API_KEY not configured on the server",
      });
    }

    const missing = requiredFields.filter(
      (field) => !req.body || typeof req.body[field] !== "string"
    );

    if (missing.length) {
      logger.warn({ missing }, "Personalized message request missing fields");
      return res.status(400).json({
        error: `Missing or invalid fields: ${missing.join(", ")}`,
      });
    }

    logger.info(
      {
        lessonTitle: req.body.lessonTitle,
        hasIntake: Boolean(req.body.motivation || req.body.enrollmentReason),
      },
      "Generating personalized lesson message"
    );

    const prompt = buildPrompt(req.body);

    // Extract industry and generate message in parallel
    const [industry, completion] = await Promise.all([
      extractIndustry(req.body),
      openai.chat.completions.create({
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
      }),
    ]);

    const message =
      completion?.choices?.[0]?.message?.content?.trim() || "";

    if (!message) {
      logger.warn(
        { lessonTitle: req.body.lessonTitle },
        "Language model returned empty personalization"
      );
      return res
        .status(502)
        .json({ error: "No message returned from language model" });
    }

    logger.info(
      {
        lessonTitle: req.body.lessonTitle,
        messageLength: message.length,
        industry,
      },
      "Personalized lesson message generated"
    );
    res.json({ message, industry });
  } catch (error) {
    logger.error(
      {
        err: error,
        lessonTitle: req.body?.lessonTitle,
      },
      "Error generating personalized lesson message"
    );
    res.status(500).json({
      error: "Failed to generate personalized message",
    });
  }
});

module.exports = router;

