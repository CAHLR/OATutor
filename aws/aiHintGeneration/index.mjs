"use strict";

import { streamOpenAIResponse } from './utils.mjs';
console.log("Lambda started");

export const handler = awslambda.streamifyResponse(
  async (event, responseStream, _context) => {
    console.log("Request started:", event);
    const requestBody = JSON.parse(event.body); // Parse the JSON body
    const message = requestBody.message;       // Access the 'message' field
    console.log("Extracted message:", message);
    const startTime = process.hrtime();

    // Metadata with CORS headers
    const metadata = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        //"Access-Control-Allow-Origin": "*", // Set to the allowed origin or "null"
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS", // Allowed HTTP methods
        "Access-Control-Allow-Headers": "Origin, Content-Type, Authorization", // Allow specific headers
      },
    };

    // Handle the response
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    try {
      // Stream OpenAI response
      console.log(event.queryStringParameters);
      const res_1 = await streamOpenAIResponse(responseStream, {
        messages: [{ role: "user", content: message }], // The user's message
        model: "gpt-4",
        temperature: 0.7,
        max_tokens: 100,
      });

      // Log execution time
      const hrTime = process.hrtime(startTime);
      const totalSeconds = hrTime[0] + hrTime[1] / 1e9;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = (totalSeconds % 60).toFixed(2);
      console.log(`Execution Time: ${minutes} minutes ${seconds} seconds\n`);
    } catch (error) {
      console.error("Error:", error);
      responseStream.write(JSON.stringify({ error: error.message }));
    } finally {
      // End response stream
      responseStream.end();
    }
  }
);
