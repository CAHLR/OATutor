import React from "react";
import axios from "axios";
import ZoomImage from "./ZoomImage";
import TTSPlayer from "../util/ttsPlayer";
import TTSButtons from "./problem-layout/TTSButtons";
import { IMAGE_ANALYSIS_URL, TTS_API_URL } from "../config/config";

const REGEX_YOUTUBE = /^((?:https?:)?\/\/)?((?:www|m)\.)?(youtube(-nocookie)?\.com|youtu.be)(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

async function fetchImageAsBase64(url, signal) {
    const resp = await fetch(url, { signal });
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function fetchImageDescription(imageBase64, mimeType, context) {
    const response = await axios.post(
        IMAGE_ANALYSIS_URL,
        { imageBase64, mimeType, context },
        { headers: { "Content-Type": "application/json" } }
    );
    if (response.data && response.data.description) return response.data.description;
    if (response.data && typeof response.data.body === "string") {
        return JSON.parse(response.data.body).description;
    }
    throw new Error("Unexpected image analysis response shape");
}

class RenderMedia extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ttsPlaying: false,
            ttsReady: false,
            ttsLoading: false,
            ttsPlayerSet: false,
        };
        this.ttsPlayer = null;
        this._mounted = false;
        this._abortController = null;
    }

    componentDidMount() {
        this._mounted = true;
        if (this.props.enableTTS) {
            this._loadTTS();
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.enableTTS && this.props.enableTTS) {
            this._loadTTS();
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this._abortController) this._abortController.abort();
        if (this.ttsPlayer) this.ttsPlayer.destroy();
    }

    async _loadTTS() {
        if (!IMAGE_ANALYSIS_URL || !TTS_API_URL) return;

        const { url, problemID, contentSource, context = "" } = this.props;
        if (!url || url.match(REGEX_YOUTUBE)) return;

        if (this._mounted) this.setState({ ttsLoading: true });

        this._abortController = new AbortController();
        const imageUrl = `${process.env.PUBLIC_URL}/static/images/figures/${contentSource}/${problemID}/${url}`;
        const mimeType = url.endsWith(".png") ? "image/png" : url.endsWith(".jpg") || url.endsWith(".jpeg") ? "image/jpeg" : "image/gif";

        try {
            const imageBase64 = await fetchImageAsBase64(imageUrl, this._abortController.signal);
            if (!this._mounted) return;

            const description = await fetchImageDescription(imageBase64, mimeType, context);
            if (!this._mounted) return;

            this.ttsPlayer = new TTSPlayer();
            this.ttsPlayer.onStateChange((playing) => {
                if (this._mounted) this.setState({ ttsPlaying: playing });
            });
            this.ttsPlayer.onReady(() => {
                if (this._mounted) this.setState({ ttsReady: true, ttsLoading: false, ttsPlayerSet: true });
            });
            await this.ttsPlayer.fetchAudio([description]);
        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("RenderMedia TTS error:", err);
            if (this._mounted) this.setState({ ttsLoading: false });
        }
    }

    render() {
        const { url, problemID, contentSource, enableTTS } = this.props;
        const { ttsPlaying, ttsReady, ttsLoading, ttsPlayerSet } = this.state;

        const yt_match = url?.toString().match(REGEX_YOUTUBE);
        if (yt_match) {
            const vid_id = yt_match[6];
            return (
                <div style={{ maxWidth: 520 }}>
                    <div style={{ paddingBottom: "56.25%", position: "relative", width: "100%" }}>
                        <iframe allowFullScreen={true} frameBorder={0} width={800} height={480}
                            title={"Video"}
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                            src={`https://www.youtube-nocookie.com/embed/${vid_id}/?controls=1&modestbranding=1&showinfo=0&iv_load_policy=3&html5=1&fs=1&rel=0&hl=en&cc_lang_pref=en&cc_load_policy=1&start=0`}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: "inline-block", width: "100%" }}>
                <center>
                    <ZoomImage
                        src={`${process.env.PUBLIC_URL}/static/images/figures/${contentSource}/${problemID}/${url}`}
                        alt={`${problemID} figure`}
                        style={{ width: "100%", objectFit: "scale-down" }}
                    />
                </center>
                {enableTTS && (ttsLoading || ttsPlayerSet) && (
                    <center>
                        <TTSButtons
                            playing={ttsPlaying}
                            onToggle={() => this.ttsPlayer?.togglePlayPause()}
                            onReplay={() => this.ttsPlayer?.replay()}
                            disabled={!ttsReady}
                        />
                    </center>
                )}
            </div>
        );
    }
}

export default RenderMedia;
