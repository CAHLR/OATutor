import React from "react";
import Grid from "@material-ui/core/Grid";
import { renderText } from "../../platform-logic/renderText.js";
import Paper from "@material-ui/core/Paper";
import { styled } from "@material-ui/core/styles";
import axios from "axios";

const Item = styled(Paper)(({ theme, show_boarder }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.primary,
    border: show_boarder === "true" ? "1px solid black" : "none",
}));

class HintVoiceBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isExpanded: props.isExpanded,
        };
    }

    componentDidMount() {
        if (!this.props.hint.audios) {
            this.fetchAudioData(this.props.hint);
        }
    }

    fetchAudioData = async (hint) => {
        // console.log("hint pacedSpeech: ", hint.pacedSpeech);
        try {
            this.setState({ isLoading: true });
            if (!hint.audios) {
                const segments =
                    Array.isArray(hint.pacedSpeech) &&
                    hint.pacedSpeech.length > 0
                        ? hint.pacedSpeech
                        : [hint.text || ""];

                const response = await axios.post(
                    "https://7g3tiigt6paiqrcfub5f6vouqq0gynjn.lambda-url.us-east-2.on.aws/",
                    {
                        segments, // Send the data in the body
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                let audios;
                if (response.data && Array.isArray(response.data.audios)) {
                    audios = response.data.audios;
                } else if (
                    response.data &&
                    typeof response.data.body === "string"
                ) {
                    const parsed = JSON.parse(response.data.body);
                    audios = parsed.audios;
                } else {
                    console.error(
                        "Unexpected TTS response shape in HintVoiceBoard:",
                        response.data
                    );
                    this.setState({ isLoading: false });
                    return;
                }

                hint.audios = audios; // Store audio data
                // console.log("success:", hint.audios);
            }
            this.setState({ isLoading: false }, () => {
                console.log("state is expanded:", this.state.isExpanded, hint);
                if (this.state.isExpanded) {
                    this.props.playAgent(hint);
                }
            });
        } catch (error) {
            console.error("Error fetching audio:", error);
            this.setState({ isLoading: false });
        }
    };

    render() {
        const { hint } = this.props;

        if (this.state.isLoading) {
            return <div>Loading...</div>;
        }

        // Agent mode now displays text directly, same as text mode
        // The play/pause buttons are handled by HintSystem
        return <div>{renderText(hint.text)}</div>;
    }
}

export default HintVoiceBoard;
