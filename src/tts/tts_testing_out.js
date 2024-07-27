const OpenAI = require("openai");
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const Speaker = require("speaker");
const axios = require("axios");

// ffmpeg - for audio processing and conversion
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);


async function retrieveSpeech(speechPath, inputText) {
  
  const outputPath = path.resolve(speechPath);
  const secretKey = process.env.REACT_APP_OPENAI_API_KEY; 
  const openai = new OpenAI({
      apiKey: secretKey,
  }); 

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: inputText,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(outputPath, buffer);
}


function playSpeech(speechPath){

  const speaker = new Speaker({
    channels: 2, 
    bitDepth: 16,
    sampleRate: 44100,
  });

    // Convert WAV to PCM using FFmpeg - needed for some speaker packages
  ffmpeg(speechPath)
    .audioCodec('pcm_s16le') 
    .audioChannels(2) 
    .audioFrequency(44100)
    .format('wav') 
    .on('error', (err) => {
      console.error('FFmpeg Error:', err);
    })
    .pipe(speaker);
}

 function tts(inputText){
  const speechPath = "./speech-files/speech.mp3";
  retrieveSpeech(speechPath, inputText);
  playSpeech(speechPath);
}
