/**
 * Personalized Message Route
 * 
 * Generates personalized lesson orientation messages using OpenAI based on student intake data.
 * Also extracts and normalizes industry/field names from student responses.
 * 
 * @author Aritro Datta
 */

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

/**
 * Builds the prompt for generating personalized lesson messages.
 * Extracts meaningful lesson topic from titles with colon format (e.g., "Lesson Professional: Skills" → "Skills").
 * 
 * @param {Object} payload - Contains lesson title, content, and student intake responses
 * @returns {string} Formatted prompt for OpenAI
 * @author Aritro Datta
 */
const buildPrompt = (payload) => {
  // Extract meaningful lesson topic from title (handle formats like "Lesson Professional: Skills")
  // If title has a colon, use the part after the colon as the actual topic
  let lessonTopic = payload.lessonTitle || "";
  if (lessonTopic.includes(":")) {
    const parts = lessonTopic.split(":").map(s => s.trim());
    lessonTopic = parts.length > 1 ? parts.slice(1).join(": ") : lessonTopic;
  }
  // Remove redundant "Lesson" prefix if present
  lessonTopic = lessonTopic.replace(/^Lesson\s+/i, "").trim();

  return `
You are a supportive learning coach writing a single concise paragraph (2-4 sentences)
that motivates an adult learner at the start of a lesson. 

Student background:
- Motivation: ${payload.motivation || "N/A"}
- Enrollment reason: ${payload.enrollmentReason || "N/A"}
- Personal choice: ${payload.personalChoice || "N/A"}
- Desired field: ${payload.desiredField || "N/A"}

Lesson context:
- Topic: ${lessonTopic || payload.lessonTitle || "N/A"}
- Full title: ${payload.lessonTitle || "N/A"}
- Description: ${payload.lessonContent || "N/A"}

Guidelines:
- Reference both the learner context and the lesson topic.
- When mentioning the lesson, use the meaningful topic name (e.g., "Skills" not "Lesson Professional: Skills").
- If the lesson title has a format like "Lesson X: Y", refer to it as "Y" (the part after the colon).
- Avoid repeating redundant prefixes like "Lesson" in your message.
- Highlight how the lesson supports their goals.
- Keep tone encouraging but professional.
- Output only the paragraph, no bullet points or extra commentary.
`;
};

/**
 * Extracts and normalizes industry/field name from student intake responses.
 * Uses OpenAI to understand context and nuance, transforming informal language
 * into proper, grammatical industry names suitable for display in:
 * "How This Lesson Supports Your Career in [Industry]"
 * 
 * @param {Object} payload - Contains student intake responses (motivation, enrollmentReason, desiredField)
 * @returns {Promise<string>} Normalized industry name (e.g., "Tech Entrepreneurship", "Software Engineering")
 * @author Aritro Datta
 */
const extractIndustry = async (payload) => {
  const industryPrompt = `
You are extracting the primary industry, field, or career area a student wants to work in from their intake responses.

Student responses:
- Desired field: "${payload.desiredField || ""}"
- Motivation: "${payload.motivation || ""}"
- Enrollment reason: "${payload.enrollmentReason || ""}"

Your task: Extract a proper, grammatical industry/field name (2-4 words) that will be inserted into this exact sentence:
"How This Lesson Supports Your Career in [YOUR_RESPONSE]"

CRITICAL REQUIREMENTS:
1. The output must be grammatically correct when inserted into the sentence above
2. Use professional, industry-standard terminology with proper capitalization
3. Transform informal or vague language into proper industry names
4. Consider context and nuance - understand what the student really means, not just what they literally said
5. If they mention "startup" or "entrepreneurship", determine if it's tech-related ("Tech Entrepreneurship") or business-related ("Business Entrepreneurship") based on context
6. If they mention "coding" or "programming", use "Software Engineering"
7. If they mention "data" or "analytics", use "Data Analytics" or "Data Science" as appropriate
8. Be smart about context - if someone says "tech startup", they mean "Tech Entrepreneurship", not literally "tech startup"
9. If the response is vague, infer the most likely professional industry name from context clues

Examples of transformations:
- "tech startup" → "Tech Entrepreneurship" (not "tech startup" - that's not grammatical in the sentence)
- "I want to start a startup in tech" → "Tech Entrepreneurship"
- "coding" or "I want to code" → "Software Engineering"
- "data science" or "working with data" → "Data Analytics" or "Data Science"
- "healthcare field" → "Healthcare Administration" or "Healthcare"
- "business" or "corporate" → "Business Management"
- "finance" or "banking" → "Financial Services"

Return ONLY the industry/field name. No explanations, no quotes, no punctuation, no prefixes like "the" or "in". Just the proper industry name that makes grammatical sense in the sentence.
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
            "You are an expert at extracting and normalizing industry/field names from student responses. You understand context, nuance, and informal language. Your output will be inserted into: 'How This Lesson Supports Your Career in [YOUR_OUTPUT]'. Return ONLY a proper, grammatical industry name (2-4 words) with correct capitalization. Transform informal phrases into professional industry terminology. No explanations, quotes, or extra text.",
        },
        { role: "user", content: industryPrompt },
      ],
    });

    let industry = completion?.choices?.[0]?.message?.content?.trim() || "";
    
    // Clean up: remove quotes, periods, colons, and any explanatory text
    industry = industry.replace(/^["']|["']$/g, ""); // Remove quotes
    industry = industry.replace(/^[:\-\.]\s*|\s*[:\-\.]$/g, ""); // Remove leading/trailing punctuation
    industry = industry.split(/[\.\:]/)[0].trim(); // Take only first part if there's a colon/period
    industry = industry.split(/\s+in\s+/i)[0].trim(); // Remove "in [something]" if present
    
    // If still empty or generic, try fallback extraction
    if (!industry || industry.toLowerCase().includes("chosen field") || industry.toLowerCase().includes("various")) {
      const fallbackPrompt = `
Extract a proper, grammatical industry or career field name from this student response:
"${payload.desiredField || payload.motivation || payload.enrollmentReason || ""}"

Your output will be inserted into: "How This Lesson Supports Your Career in [YOUR_OUTPUT]"

Understand the context and nuance. Transform informal language into proper industry terminology.
- "startup" or "tech startup" → "Tech Entrepreneurship" (not "tech startup" - that's not grammatical)
- "coding" or "programming" → "Software Engineering"
- "data" or "analytics" → "Data Analytics" or "Data Science"
- Be smart about what the student really means, not just what they literally said

Return ONLY the proper industry name (2-4 words) with correct capitalization. No explanations, quotes, or extra text.
`;

      const fallbackCompletion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.3,
        max_tokens: 15,
        messages: [
          {
            role: "system",
            content:
              "You understand context and nuance. Extract a proper, grammatical industry name (2-4 words) that makes sense in 'How This Lesson Supports Your Career in [YOUR_OUTPUT]'. Transform informal phrases into professional terminology. No explanations, quotes, or extra text.",
          },
          { role: "user", content: fallbackPrompt },
        ],
      });
      
      industry = fallbackCompletion?.choices?.[0]?.message?.content?.trim() || "";
      
      // Clean up fallback result
      industry = industry.replace(/^["']|["']$/g, ""); // Remove quotes
      industry = industry.replace(/^[:\-\.]\s*|\s*[:\-\.]$/g, ""); // Remove leading/trailing punctuation
      industry = industry.split(/[\.\:]/)[0].trim(); // Take only first part if there's a colon/period
      industry = industry.split(/\s+in\s+/i)[0].trim(); // Remove "in [something]" if present
    }
    
    // Final fallback: extract basic words from desiredField if all else fails
    if (!industry || industry.length < 2) {
      const rawField = payload.desiredField || payload.motivation || payload.enrollmentReason || "";
      // Extract first few meaningful words
      const words = rawField.split(/\s+/).filter(w => w.length > 2).slice(0, 3);
      industry = words.join(" ") || "Professional Development";
    }
    
    return industry;
  } catch (error) {
    logger.error({ err: error }, "Error extracting industry");
    // Even on error, try to extract from desiredField
    const rawField = payload.desiredField || payload.motivation || payload.enrollmentReason || "";
    const words = rawField.split(/\s+/).filter(w => w.length > 2).slice(0, 3);
    return words.join(" ") || "Professional Development";
  }
};

/**
 * POST /api/generate-personalized-message
 * 
 * Generates a personalized lesson orientation message and extracts industry name
 * from student intake data using OpenAI.
 * 
 * Request body:
 * - motivation: Student's motivation for taking the course
 * - enrollmentReason: Reason for enrollment
 * - personalChoice: Personal choice/interest
 * - desiredField: Desired career field/industry
 * - lessonTitle: Title of the lesson
 * - lessonContent: Description/summary of lesson content
 * 
 * Response:
 * - message: Personalized orientation paragraph
 * - industry: Normalized industry/field name
 * 
 * @author Aritro Datta
 */
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

    // Extract industry and generate message in parallel for better performance
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

