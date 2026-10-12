import React, { useEffect, useRef, useState } from "react";

export async function prepareFeedbackScreenshot(file) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
        throw new Error("Choose a PNG, JPEG, or WebP image smaller than 5 MB.");
    }
    const url = URL.createObjectURL(file);
    try {
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("This image could not be opened."));
            img.src = url;
        });
        const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Screenshots are not supported in this browser.");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.85, 0.65, 0.45]) {
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            if (dataUrl.length <= 280000) {
                return { dataUrl, width: canvas.width, height: canvas.height, mimeType: "image/jpeg" };
            }
        }
        throw new Error("Please crop the screenshot to the problem area and try again.");
    } finally {
        URL.revokeObjectURL(url);
    }
}

export default function FeedbackScreenshot({ value, onChange, onBusyChange, disabled }) {
    const [error, setError] = useState("");
    const request = useRef(0);
    useEffect(() => () => { request.current++; }, []);
    return <div style={{ margin: "12px 0" }}>
        <label>
            Screenshot (optional)
            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled}
                style={{ display: "block", marginTop: 8 }}
                onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    const id = ++request.current;
                    setError("");
                    onBusyChange(true);
                    try {
                        const screenshot = await prepareFeedbackScreenshot(file);
                        if (id === request.current) onChange(screenshot);
                    } catch (err) {
                        if (id === request.current) setError(err.message);
                    } finally {
                        if (id === request.current) onBusyChange(false);
                    }
                }} />
        </label>
        <p style={{ fontSize: 13 }}>Attach only the problem area you want to share with the support team.</p>
        {error && <p role="alert">{error}</p>}
        {value && <div>
            <img src={value.dataUrl} alt="Screenshot to include with the bug report" style={{ maxWidth: "100%", maxHeight: 240 }} />
            <button type="button" disabled={disabled} onClick={() => { request.current++; onChange(null); onBusyChange(false); }}>Remove screenshot</button>
        </div>}
    </div>;
}
