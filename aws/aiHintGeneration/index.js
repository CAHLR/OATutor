/**
 * AI Hint Generation Script for AWS Lambda
 * 
 * This script is designed to generate hints using OpenAI's API, 
 * and is deployed as a serverless function on AWS Lambda.
 * 
 * IMPORTANT:
 * 1. Set the `OPENAI_API_KEY` environment variable in Lambda to enable 
 *    API access for hint generation.
 * 2. Enable Cross-Origin Resource Sharing (CORS) to allow access 
 *    from approved web clients.
 * 
 */

require('dotenv').config();
const express = require("express");
const OpenAI = require('openai');
console.log("OpenAI API Key:", !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serverless = require("serverless-http");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to allow relaxed CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Api-Key"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

app.post("/generateHint", async (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString());
  }

  console.log("Request body:", req.body);

  try {
    const { prompt } = req.body;
    
    const completion = await openai.chat.completions.create({
      messages: prompt,
      temperature: 0.7,
      model: "gpt-4",
    });

    const content = completion.choices[0].message.content;

    res.status(200).send(content);
  } catch (err) {
    console.error("Error creating completion:", err);
    res.status(503).json({ error: err.message });
  }
});

module.exports.handler = serverless(app);
