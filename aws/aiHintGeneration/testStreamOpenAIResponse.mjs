import { Writable } from "stream";
import { streamOpenAIResponse } from "./utils.mjs"; // Adjust the path as needed
import dotenv from "dotenv";

dotenv.config(); // Load the environment variables

(async () => {
  // Simulated response stream to capture written chunks
  const responseStream = new Writable({
    write(chunk, encoding, callback) {
      // console.log("Chunk received:", chunk.toString()); // Log each chunk of content
      callback();
    },
  });

  // Define the configuration for the OpenAI API call
  const config = {
    model: "gpt-4", // Replace with your desired model
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is 2x = 4? Solve for x." },
    ],
    temperature: 0.7,
  };

  try {
    console.log("Testing streamOpenAIResponse...");
    const fullResponse = await streamOpenAIResponse(responseStream, config);
    console.log(fullResponse); // Log the accumulated response
  } catch (error) {
    console.error("Error testing streamOpenAIResponse:", error);
  }
})();
