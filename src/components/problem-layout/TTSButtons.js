/**
 * TTSButtons - Minimal play/pause/replay button group for TTS audio.
 *
 * Props:
 *   playing  {boolean} - whether audio is currently playing
 *   onToggle {function} - called when play/pause is clicked
 *   onReplay {function} - called when replay is clicked
 *   disabled {boolean}  - disable buttons (e.g. audio not loaded yet)
 */
import React from "react";
import IconButton from "@material-ui/core/IconButton";

const TTSButtons = ({ playing, onToggle, onReplay, disabled }) => (
    <span style={{ display: "inline-flex", gap: 4, verticalAlign: "middle", marginLeft: 8 }}>
        <IconButton
            onClick={onToggle}
            size="small"
            disabled={disabled}
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause" : "Play"}
        >
            <img
                src={`${process.env.PUBLIC_URL}/${playing ? "pause_icon" : "play_icon"}.svg`}
                alt={playing ? "Pause" : "Play"}
                width={16}
                height={16}
            />
        </IconButton>
        <IconButton
            onClick={onReplay}
            size="small"
            disabled={disabled}
            aria-label="Replay"
            title="Replay"
        >
            <img
                src={`${process.env.PUBLIC_URL}/reload_icon.svg`}
                alt="Replay"
                width={16}
                height={16}
            />
        </IconButton>
    </span>
);

export default TTSButtons;
