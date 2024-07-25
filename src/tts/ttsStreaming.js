const OpenAI = require("openai");
require('dotenv').config();
const Speaker = require("speaker");
const axios = require("axios");

// ffmpeg - for audio processing and conversion
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);
// have installed speaker (could not be done), openai, axios, fluent-ffmpeg, ffmpeg-static
// had to install node-gyp globally


const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: secretKey,
}); 

// Default voice setting for text-to-speech
const inputVoice = "echo"; // https://platform.openai.com/docs/guides/text-to-speech/voice-options
const inputModel = "tts-1"; // https://platform.openai.com/docs/guides/text-to-speech/audio-quality


// Function to convert text to speech and play it using Speaker
export async function tts(
  inputText,
  model = inputModel,
  voice = inputVoice
) {
  const url = "https://api.openai.com/v1/audio/speech";
  const headers = {
    Authorization: `Bearer ${secretKey}`, // API key for authentication
  };

  const data = {
    model: model,
    input: inputText,
    voice: voice,
    response_format: "mp3",
  };

  try {
    // Make a POST request to the OpenAI audio API
    const response = await axios.post(url, data, {
      headers: headers,
      responseType: "stream",
    });

    // Configure speaker settings
    const speaker = new Speaker({
      channels: 2, // Stereo audio
      bitDepth: 16,
      sampleRate: 44100,
    });

    // Convert the response to the desired audio format and play it
    ffmpeg(response.data)
      .toFormat("s16le")
      .audioChannels(2)
      .audioFrequency(44100)
      .pipe(speaker);
  } catch (error) {
    // Handle errors from the API or the audio processing
    if (error.response) {
      console.error(
        `Error with HTTP request: ${error.response.status} - ${error.response.statusText}`
      );
    } else {
      console.error(`Error in streamedAudio: ${error.message}`);
    }
  }
}

// streamedAudio("Hello, world!");