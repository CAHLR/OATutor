import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";

const DOCK_TOP = 80; // just under the fixed page header
const DOCK_MARGIN = 20; // lines up with the AI Tutor window under it
const DOCK_WIDTH = 400;

/**
 * Hints panel that opens above the AI Tutor window, so a hint stays readable while chatting.
 * It starts docked at the top right and can be dragged by its header. While docked it reports
 * where it ends (onDockedBottomChange) so the chat can fill the space below it.
 */
const HintDock = ({ open, portalRef, onDockedBottomChange }) => {
    const panelRef = useRef(null);
    const [position, setPosition] = useState(null); // null = docked

    useEffect(() => {
        const panel = panelRef.current;
        const report = () =>
            onDockedBottomChange(open && !position ? panel.getBoundingClientRect().bottom : null);
        report();
        // Next frame: resizing the chat from inside the callback trips a ResizeObserver loop error.
        const observer = new ResizeObserver(() => requestAnimationFrame(report));
        observer.observe(panel);
        return () => observer.disconnect();
    }, [open, position, onDockedBottomChange]);

    const handleDragStart = (event) => {
        const handle = event.currentTarget;
        const rect = panelRef.current.getBoundingClientRect();
        const grabX = event.clientX - rect.left;
        const grabY = event.clientY - rect.top;
        handle.setPointerCapture(event.pointerId);

        const handleMove = (moveEvent) => {
            setPosition({
                left: Math.min(Math.max(0, moveEvent.clientX - grabX), window.innerWidth - rect.width),
                top: Math.min(Math.max(DOCK_TOP, moveEvent.clientY - grabY), window.innerHeight - 48),
            });
        };
        const handleEnd = () => {
            handle.removeEventListener("pointermove", handleMove);
            handle.removeEventListener("pointerup", handleEnd);
        };
        handle.addEventListener("pointermove", handleMove);
        handle.addEventListener("pointerup", handleEnd);
    };

    return ReactDOM.createPortal(
        <div
            ref={panelRef}
            role="region"
            aria-label="Hints"
            style={{
                display: open ? "flex" : "none",
                flexDirection: "column",
                position: "fixed",
                zIndex: 1001,
                ...(position || { top: DOCK_TOP, right: DOCK_MARGIN }),
                width: DOCK_WIDTH,
                maxWidth: `calc(100vw - ${DOCK_MARGIN * 2}px)`,
                maxHeight: "40vh",
                boxSizing: "border-box",
                background: "#eef4fa",
                border: "1px solid #4c7d9f",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(76, 125, 159, 0.14)",
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <div
                onPointerDown={handleDragStart}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 10px",
                    cursor: "move",
                    touchAction: "none",
                    userSelect: "none",
                }}
            >
                <DragIndicatorIcon style={{ fontSize: 18, color: "#a3b3bf" }} />
                <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "#3f7091" }}>Hints</span>
                <span style={{ fontSize: 12, color: "#8a99a6" }}>Drag to move</span>
            </div>
            <div
                ref={portalRef}
                id="hint-portal-content"
                aria-live="polite"
                style={{ overflowY: "auto", padding: "0 10px 10px", boxSizing: "border-box" }}
            />
        </div>,
        document.body
    );
};

export default HintDock;
