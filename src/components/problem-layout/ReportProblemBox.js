import React, { useEffect, useRef, useState } from "react";
import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import SendRoundedIcon from "@material-ui/icons/SendRounded";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import PhotoCameraOutlinedIcon from "@material-ui/icons/PhotoCameraOutlined";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import { REPORT_DETAIL_FIELDS } from "../../util/reportDetails";

const FONT = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CLOSE_AFTER_SENT_MS = 2000;
const CLOSE_AFTER_PREVIEW_SENT_MS = 5000;
const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;

const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 6,
    margin: 0,
    fontFamily: FONT,
    fontSize: 14,
};

const inputStyle = {
    flex: 1,
    minWidth: 0,
    height: 36,
    padding: "0 10px",
    border: "1px solid #C9D7E2",
    borderRadius: 8,
    outline: "none",
    fontFamily: FONT,
    fontSize: 14,
    color: "#253444",
    backgroundColor: "#FFFFFF",
};

const slotStyle = {
    position: "relative",
    width: 48,
    height: 36,
    flexShrink: 0,
    borderRadius: 8,
    border: "1px solid #C9D7E2",
    backgroundColor: "#F3F7FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
};

/** Reads an image file into a data URL, or resolves null if it isn't a usable image. */
const readImage = (file) =>
    new Promise((resolve) => {
        if (!file || !file.type.startsWith("image/") || file.size > MAX_SCREENSHOT_BYTES) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });

/** Screenshot slot at the start of the row: thumbnail (with remove) or a button to attach one. */
const ScreenshotSlot = ({ screenshot, onPick, onRemove }) => {
    if (screenshot) {
        return (
            <div style={{ ...slotStyle, backgroundColor: "#FFFFFF" }} title="Screenshot attached">
                <img
                    src={screenshot}
                    alt="Screenshot attached to this report"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }}
                />
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Remove screenshot"
                    title="Remove screenshot"
                    style={{
                        position: "absolute",
                        top: 1,
                        right: 1,
                        width: 16,
                        height: 16,
                        padding: 0,
                        border: 0,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(37, 52, 68, 0.8)",
                        color: "#FFFFFF",
                        cursor: "pointer",
                    }}
                >
                    <CloseRoundedIcon style={{ fontSize: 12 }} />
                </button>
            </div>
        );
    }
    return (
        <IconButton
            size="small"
            onClick={onPick}
            aria-label="Attach a screenshot"
            title="Attach a screenshot (or paste one)"
            style={{ ...slotStyle, color: "#3F7091" }}
        >
            <PhotoCameraOutlinedIcon style={{ fontSize: 18 }} />
        </IconButton>
    );
};

/** What the report contained, so the flow can be checked end to end without a backend. */
const SentPreview = ({ report }) => (
    <div style={{ padding: "0 12px 12px", fontFamily: FONT, fontSize: 12, color: "#374151" }}>
        {report.screenshot ? (
            <img
                src={report.screenshot}
                alt="Screenshot sent with the report"
                style={{ display: "block", width: "100%", maxHeight: 200, objectFit: "contain", border: "1px solid #DFE8EE", borderRadius: 8, backgroundColor: "#F6F6F6" }}
            />
        ) : (
            <p style={{ margin: 0, color: "#667085" }}>No screenshot attached.</p>
        )}
        <dl style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "4px 10px", margin: "10px 0 0" }}>
            <dt style={{ color: "#667085" }}>Message</dt>
            <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{report.text}</dd>
            {REPORT_DETAIL_FIELDS.map(([key, label]) => (
                <React.Fragment key={key}>
                    <dt style={{ color: "#667085" }}>{label}</dt>
                    <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{report.details[key] || "—"}</dd>
                </React.Fragment>
            ))}
        </dl>
    </div>
);

/**
 * One-line "Report a problem" box that opens under its button. Students can attach a
 * screenshot from a file or by pasting one. Enter sends; Esc or clicking elsewhere closes it.
 * Mounted only while open, so every report starts from an empty box.
 */
const ReportProblemBox = ({ anchorEl, onClose, onSubmit, saved }) => {
    const [text, setText] = useState("");
    const [screenshot, setScreenshot] = useState(null);
    const fileRef = useRef(null);
    const [sentReport, setSentReport] = useState(null);
    const [showSent, setShowSent] = useState(false);
    const inputRef = useRef(null);

    // Close shortly after sending, unless the "what was sent" preview is open.
    useEffect(() => {
        if (!sentReport || showSent) return undefined;
        const timer = setTimeout(onClose, saved ? CLOSE_AFTER_SENT_MS : CLOSE_AFTER_PREVIEW_SENT_MS);
        return () => clearTimeout(timer);
    }, [sentReport, showSent, saved, onClose]);

    const report = text.trim();
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!report || sentReport) return;
        setSentReport(onSubmit(report, screenshot) || { text: report, screenshot, details: {} });
    };

    const attach = async (file) => {
        const dataUrl = await readImage(file);
        if (dataUrl) setScreenshot(dataUrl);
    };

    // A screenshot pasted into the box (e.g. after Cmd/Ctrl+Shift+4) gets attached.
    const handlePaste = (event) => {
        const file = Array.from(event.clipboardData?.files || []).find((f) => f.type.startsWith("image/"));
        if (!file) return;
        event.preventDefault();
        attach(file);
    };

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            disableScrollLock
            // Above the toasts (z-index 9999): on phones "Incorrect Answer!" spans the
            // top of the screen and would cover the box right when students report.
            style={{ zIndex: 10000 }}
            // Centered under the button; near the screen edge MUI slides it in so it sits
            // flush with a 12px margin instead of running off screen.
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            marginThreshold={12}
            TransitionProps={{ onEntered: () => inputRef.current?.focus() }}
            PaperProps={{
                style: {
                    marginTop: 8,
                    width: "min(400px, calc(100vw - 24px))",
                    maxHeight: "calc(100vh - 96px)",
                    borderRadius: 12,
                    border: "1px solid #DFE8EE",
                    boxShadow: "0 8px 24px rgba(15, 46, 95, 0.14)",
                },
            }}
        >
            {sentReport ? (
                <>
                    <div role="status" style={{ ...rowStyle, padding: "12px 12px", color: "#0B7A6E", fontWeight: 600 }}>
                        <CheckCircleRoundedIcon style={{ fontSize: 20 }} />
                        <span style={{ flex: 1 }}>{saved ? "Thanks, sent." : "Thanks! Reports aren't saved in this preview."}</span>
                        {!saved && (
                            <button
                                type="button"
                                onClick={() => setShowSent((open) => !open)}
                                aria-expanded={showSent}
                                style={{ border: 0, background: "none", padding: 0, cursor: "pointer", color: "#3F7091", fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                            >
                                {showSent ? "Hide details" : "See what was sent"}
                            </button>
                        )}
                    </div>
                    {showSent && <SentPreview report={sentReport} />}
                </>
            ) : (
                <form onSubmit={handleSubmit} onPaste={handlePaste} style={rowStyle} aria-label="Report a problem with this question">
                    <ScreenshotSlot
                        screenshot={screenshot}
                        onPick={() => fileRef.current?.click()}
                        onRemove={() => setScreenshot(null)}
                    />
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) => {
                            attach(event.target.files?.[0]);
                            event.target.value = "";
                        }}
                    />
                    <input
                        ref={inputRef}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="e.g. right answer marked wrong"
                        aria-label="Describe the problem"
                        maxLength={500}
                        style={inputStyle}
                    />
                    <IconButton
                        type="submit"
                        size="small"
                        aria-label="Send report"
                        title="Send report"
                        disabled={!report}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            color: "#FFFFFF",
                            backgroundColor: report ? "#3F7091" : "#B8C7D3",
                        }}
                    >
                        <SendRoundedIcon style={{ fontSize: 18 }} />
                    </IconButton>
                </form>
            )}
        </Popover>
    );
};

export default ReportProblemBox;
