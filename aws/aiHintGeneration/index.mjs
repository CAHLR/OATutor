"use strict";

import OpenAI from "openai";
console.log("Lambda started");

export const handler = awslambda.streamifyResponse(
  async (event, responseStream, _context) => {
    console.log("Request started:", event);
    const requestBody = JSON.parse(event.body);
    const message = requestBody.message;
    console.log("Extracted message:", message);
    const startTime = process.hrtime();

    const metadata = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS", // Allowed HTTP methods
        "Access-Control-Allow-Headers": "Origin, Content-Type, Authorization", // Allow specific headers
      },
    };

    // Handle the response
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    try {
      // Stream OpenAI response
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }
      );
      // https://platform.openai.com/docs/api-reference/streaming
      const stream = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: message }],
          stream: true,
      });
      for await (const chunk of stream) {
        responseStream.write(chunk.choices[0]?.delta?.content || "");
      }
  
      
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
