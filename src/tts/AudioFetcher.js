import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useAudioFetcher = () => {
    const [audioUrl, setAudioUrl] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const fetchAudio = async (text) => {
        try {
            const response = await axios.post('http://localhost:3002/synthesize', { text }, { responseType: 'blob' });
            console.log("Response:", response);

            const url = URL.createObjectURL(response.data);
            setAudioUrl(url);
        } catch (error) {
            console.error('Error fetching audio file:', error);
        }
    };

    useEffect(() => {
        if (audioUrl) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.addEventListener('ended', () => setIsPlaying(false));
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [audioUrl]);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return {
        fetchAudio,
        isPlaying,
        togglePlayPause,
    };
};

export default useAudioFetcher;




// import React, { useState, useEffect, useRef } from 'react';
// // import { playAudioStream } from './tts.js';
// import axios from 'axios';

// const useAudioPlayer  = (url) => { // custom hook
//     const [isPlaying, setIsPlaying] = useState(false);
//     const audioRef = useRef(null);

//     useEffect(() => {
//         if (url) {
//             audioRef.current = new Audio(url);
//         }
//     }, [url]);

//     const tooglePlayPause = () => {
//         if (audioRef.current) {
//             if (isPlaying) {
//                 audioRef.current.pause();
//             } else {
//                 audioRef.current.play();
//             }
//             setIsPlaying(!isPlaying);
//         }
//     }
//     return {
//         isPlaying,
//         tooglePlayPause,
//     };
// };


// const AudioFetcher = ({text}) => {
//     const [audioUrl, setAudioUrl] = useState("");

//     useEffect(() => {
//         const fetchAudio = async () => {
//             try {
//                 const response = await axios.post('http://localhost:3002/synthesize',
//                     {text}
//                     );
//                 console.log("Response.data:", response.data);

//                 // Make apropriate for lists later
//                 const blob = await response.blob();
//                 const url = URL.createObjectURL(blob);
//                 setAudioUrl(url);
//             } catch (error) {
//                 console.error('Error fetching audio file:', error);
//             }
//         };

//         fetchAudio();

//         return () => {
//             if (audioUrl) {
//                 URL.revokeObjectURL(audioUrl);
//             }
//         };
//     }, [audioUrl]);

//     const { isPlaying, togglePlayPause } = useAudioPlayer(audioUrl);

//     return {
//         isPlaying,
//         togglePlayPause,
//     };
// };

// export default AudioFetcher;
