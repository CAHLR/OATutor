import axios from 'axios';
// import { synthesize } from './tts';


export async function backendCommunication(text) {
  console.log("text:", text); 
  try {
  const response = await axios.post('http://localhost:3002/synthesize',
      {text}
      );
    
  console.log("Response.data:", response.data);
  // synthesize(response.data); // play the audio 
  // maybe should return response.data

}
  catch (error){
    console.error("Error during request:", error);
  }    
};
