const Speaker = require('speaker');
const { PassThrough } = require('stream');
const { BufferListStream } = require('bl');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);


function playAudioStream(response) {
  // takes in mp3 and plays it
  
  return new Promise((resolve, reject) => {  // resolving the promise when the Speaker has finished playing
      const audioStream = new PassThrough();
      response.data.pipe(audioStream);
      const speaker = new Speaker({
          channels: 2, 
          bitDepth: 16,
          sampleRate: 44100,
      });

      const bufferedStream = new BufferListStream();
      audioStream.pipe(bufferedStream);

      bufferedStream.on('finish', () => {
          const playbackStream = new PassThrough();
          playbackStream.end(bufferedStream.slice());
          
          // Convert the response to the desired audio format and play it
          ffmpeg(playbackStream)
          .toFormat("s16le")
          .audioChannels(2)
          .audioFrequency(44100)
          .pipe(speaker)
          .on('finish', resolve) // when finished spoken => resolved => return to for loop for next sentence
          .on('error', reject);
      });
  });
}

export async function synthesize(responses) {
   try{
        // play them one by one 
        for (const response of responses) {
            await playAudioStream(response);        // frontend - send over all responses
            console.log("Finished playing audio");
            // SEND MESSAGE TO TOGGLE MATH HERE 
        }
    }
    catch(error){
        console.log(error);
    }
}