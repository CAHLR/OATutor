"use strict";

import { streamOpenAIResponse } from './utils.mjs';
console.log("Lambda started");

export const handler = awslambda.streamifyResponse(
  async (event, responseStream, _context) => {
    // Get current process time
    const startTime = process.hrtime();

    // Start response stream
    const metadata = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow all origins (change "*" to specific origin in production)
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    };
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    console.log("Request started");
    // Stream OpenAI response
    const res_1 = await streamOpenAIResponse(responseStream, {
      messages: [{ role: "user", content: event.queryStringParameters.message }], // The user's message (in testing from event.json)
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 100
    });

    // Return execution time (optional)
    const hrTime = process.hrtime(startTime);
    const totalSeconds = hrTime[0] + hrTime[1] / 1e9;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    console.log(`Execution Time: ${minutes} minutes ${seconds} seconds\n`);

    // End response stream
    responseStream.end();
  }
);
