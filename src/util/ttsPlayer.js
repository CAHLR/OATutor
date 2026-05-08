/**
 * TTS Player Utility
 *
 * Standalone module for fetching and playing TTS audio via the Lambda API.
 * Components can use this without any coupling to the TTS processing pipeline.
 *
 * Usage:
 *   const player = new TTSPlayer();
 *   await player.fetchAudio(["Hello world", "This is a test"]);
 *   player.play();
 *   player.pause();
 *   player.replay();
 *   player.destroy(); // cleanup when component unmounts
 */
import axios from "axios";
import { TTS_API_URL } from "../config/config";

class TTSPlayer {
    constructor() {
        this.audios = null;      // base64 audio data array from API
        this.audioRef = null;    // current Audio element
        this.audioUrl = null;    // current object URL
        this.playing = false;
        this.currentSegment = 0;
        this._onStateChange = null; // callback: (playing) => void
        this._onReady = null;       // callback: () => void — fired when audio is fetched
        this._destroyed = false;
    }

    /**
     * Set a callback that fires when play/pause state changes
     */
    onStateChange(callback) {
        this._onStateChange = callback;
    }

    /**
     * Set a callback that fires when audio data is ready
     */
    onReady(callback) {
        this._onReady = callback;
    }

    _setPlaying(val) {
        this.playing = val;
        if (this._onStateChange) {
            this._onStateChange(val);
        }
    }

    /**
     * Fetch audio from TTS API
     * @param {string[]} segments - array of text segments to convert to speech
     * @returns {Promise<boolean>} true if audio was fetched successfully
     */
    async fetchAudio(segments) {
        if (this._destroyed) return false;
        if (!segments || segments.length === 0) return false;

        try {
            const response = await axios.post(
                TTS_API_URL,
                { segments },
                { headers: { "Content-Type": "application/json" } }
            );

            let audios;
            if (response.data && Array.isArray(response.data.audios)) {
                audios = response.data.audios;
            } else if (response.data && typeof response.data.body === "string") {
                const parsed = JSON.parse(response.data.body);
                audios = parsed.audios;
            } else {
                console.error("Unexpected TTS response shape:", response.data);
                return false;
            }

            this.audios = audios;
            if (this._onReady) this._onReady();
            return true;
        } catch (error) {
            console.error("Error fetching TTS audio:", error);
            return false;
        }
    }

    /**
     * Check if audio data is loaded and ready to play
     */
    isReady() {
        return this.audios && this.audios.length > 0;
    }

    /**
     * Play audio from a specific segment index
     */
    _playSegment(segmentIndex) {
        if (this._destroyed || !this.audios || segmentIndex >= this.audios.length) {
            this._setPlaying(false);
            return;
        }

        // Cleanup previous
        this._cleanupCurrentAudio();

        const audioBlob = new Blob(
            [new Uint8Array(atob(this.audios[segmentIndex]).split("").map(c => c.charCodeAt(0)))],
            { type: "audio/mp3" }
        );
        this.audioUrl = window.URL.createObjectURL(audioBlob);
        this.audioRef = new Audio(this.audioUrl);
        this.currentSegment = segmentIndex;

        this.audioRef.play();
        this._setPlaying(true);

        this.audioRef.onended = () => {
            if (segmentIndex + 1 < this.audios.length) {
                this._playSegment(segmentIndex + 1);
            } else {
                this._setPlaying(false);
                this.currentSegment = 0;
            }
        };
    }

    /**
     * Start playing from beginning or resume
     */
    play() {
        if (this._destroyed || !this.isReady()) return;

        if (this.audioRef && this.audioRef.paused && this.audioRef.currentTime > 0 && !this.audioRef.ended) {
            // Resume paused audio
            this.audioRef.play();
            this._setPlaying(true);
        } else {
            // Start from current segment (or beginning)
            this._playSegment(this.currentSegment);
        }
    }

    /**
     * Pause playback
     */
    pause() {
        if (this.audioRef && this.playing) {
            this.audioRef.pause();
            this._setPlaying(false);
        }
    }

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Replay from beginning
     */
    replay() {
        this.currentSegment = 0;
        this._playSegment(0);
    }

    _cleanupCurrentAudio() {
        if (this.audioRef) {
            this.audioRef.pause();
            this.audioRef.onended = null;
            this.audioRef = null;
        }
        if (this.audioUrl) {
            window.URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
        }
    }

    /**
     * Cleanup all resources — call on component unmount
     */
    destroy() {
        this._destroyed = true;
        this._cleanupCurrentAudio();
        this.audios = null;
        this._onStateChange = null;
        this._onReady = null;
    }
}

export default TTSPlayer;
