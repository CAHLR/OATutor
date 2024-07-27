const OpenAI = require("openai");

// solve the file download without using fs

export async function retrieveSpeech(inputText) {
  
  const outputPath = "src/tts/speech-files/speech.mp3"; //path.resolve(speechPath);
  const secretKey = process.env.REACT_APP_OPENAI_API_KEY 
  const openai = new OpenAI({
      apiKey: secretKey,
  }); 

  const mp3 = await openai.audio.speech.creaste({
    model: "tts-1",
    voice: "alloy",
    input: inputText,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(outputPath, buffer);
}