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
        };
    }

    componentDidMount() {
        if (!this.props.hint.audios) {
            this.fetchAudioData(this.props.hint);
        }
    }

    fetchAudioData = async (hint) => {
        console.log("hint pacedSpeech: ", hint.pacedSpeech);
        try {
            this.setState({ isLoading: true });
            const response = await axios.post(
                "https://627d80hft0.execute-api.us-east-1.amazonaws.com/v0",
                {
                    segments: hint.pacedSpeech, // Send the data in the body
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            hint.audios = JSON.parse(response.data.body).audios; // Store audio data
            console.log("success:", response, hint.audios);
            this.setState({ isLoading: false });
            this.props.playAgent(hint);
        } catch (error) {
            console.error("Error fetching audio:", error);
            this.setState({ isLoading: false });
        }
    };

    render() {
        const { hint, hintIndex } = this.props;

        if (this.state.isLoading) {
            return <div>Loading...</div>;
        }

        return hint.math ? (
            hint.math == "" ? (
                "" // if no math show nothing (only == works not ===)
            ) : (
                <Grid
                    container
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                >
                    {hint.math.map((math, index) => (
                        <Grid item xs={12} md={6} key={`voice-board-${index}`}>
                            <Item
                                show_boarder={
                                    index === hintIndex ? "true" : "false"
                                }
                            >
                                {renderText(math)}
                            </Item>
                        </Grid>
                    ))}
                </Grid>
            ) // for 2 col: md ={6}
        ) : (
            hint.text
        ); // if math attribute nonexistent
    }
}

export default HintVoiceBoard;
