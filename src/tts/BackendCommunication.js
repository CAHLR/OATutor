import {useState} from 'react';
import axios from 'axios';

export function BackendCommunication() {
  const [text, setText] = useState('');
  // const [audioSrc, setaudioSrc] = useState(false);

  const  handleSynthesize = async () => {
    try {
    const response = await axios.post('http://localhost:3002/synthesize',
        {text}
        );
      
    console.log("Response.data:", response.data);
    // const audioSrc = `data:audio/mp3;base64,${response.data.audioContent}`; // what does this doo?
    // setaudioSrc(audioSrc);
  }
    catch (error){
      console.error("Error during request:", error);
    }    
  }

  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleSynthesize}>Synthesize</button>
    </>
  );
}
//{audioSrc && <audio controls src={audioSrc} />}
