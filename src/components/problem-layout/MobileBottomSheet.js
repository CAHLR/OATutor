import React, { useCallback, useEffect, useRef, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export const MOBILE_HINT_SHEET_HEIGHT = 'min(60vh, 600px)';
export const MOBILE_CHAT_SHEET_HEIGHT = 'min(82vh, 820px)';
export const MOBILE_BACKDROP_Z = 1200;
export const MOBILE_SHEET_Z = 1300;

const SHEET_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const SHEET_MS = 280;
const CLOSE_DRAG_PX = 110;

const BADGE_COLORS = {
    border: '#a3c5de',
    bg: '#ffffff',
    color: '#3f7091',
};

/**
 * Animated mobile bottom sheet with backdrop fade + pull-down to close.
 *
 * handleMode:
 * - "bar": dedicated drag strip (only when there is no built-in header)
 * - "content": drag via child marked [data-sheet-drag-handle]
 * Built-in title header is always itself the drag handle when showHeader is true.
 */
export default function MobileBottomSheet({
    open,
    onClose,
    title,
    badge,
    children,
    keepMounted = false,
    height = MOBILE_HINT_SHEET_HEIGHT,
    showHeader = true,
    handleMode = 'bar',
}) {
    const [mounted, setMounted] = useState(open || keepMounted);
    const [entered, setEntered] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const dragStartY = useRef(0);
    const dragYRef = useRef(0);
    const dragActive = useRef(false);
    const exitTimer = useRef(null);
    const sheetRef = useRef(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (exitTimer.current) {
            clearTimeout(exitTimer.current);
            exitTimer.current = null;
        }

        if (open) {
            setMounted(true);
            dragYRef.current = 0;
            setDragY(0);
            const id = requestAnimationFrame(() => {
                requestAnimationFrame(() => setEntered(true));
            });
            return () => cancelAnimationFrame(id);
        }

        setEntered(false);
        dragYRef.current = 0;
        setDragY(0);
        setDragging(false);
        dragActive.current = false;
        if (!keepMounted) {
            exitTimer.current = setTimeout(() => {
                setMounted(false);
                exitTimer.current = null;
            }, SHEET_MS);
        }
        return () => {
            if (exitTimer.current) {
                clearTimeout(exitTimer.current);
                exitTimer.current = null;
            }
        };
    }, [open, keepMounted]);

    const endDrag = useCallback(() => {
        if (!dragActive.current) return;
        dragActive.current = false;
        setDragging(false);
        if (dragYRef.current >= CLOSE_DRAG_PX) {
            dragYRef.current = 0;
            setDragY(0);
            onCloseRef.current?.();
            return;
        }
        dragYRef.current = 0;
        setDragY(0);
    }, []);

    const onHandlePointerDown = useCallback((event) => {
        if (!open) return;
        // Allow buttons (e.g. close) inside the drag header to work normally
        if (event.target.closest?.('button, a, input, textarea, [role="button"]')) {
            return;
        }
        dragActive.current = true;
        dragStartY.current = event.clientY;
        dragYRef.current = 0;
        setDragging(true);
        setDragY(0);
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch (_) {
            // ignore
        }
    }, [open]);

    const onHandlePointerMove = useCallback((event) => {
        if (!dragActive.current) return;
        const dy = Math.max(0, event.clientY - dragStartY.current);
        dragYRef.current = dy;
        setDragY(dy);
    }, []);

    // Bind drag to any [data-sheet-drag-handle] (built-in header or agent header)
    useEffect(() => {
        if (!mounted) return undefined;
        const root = sheetRef.current;
        const handle = root?.querySelector('[data-sheet-drag-handle]');
        if (!handle) return undefined;

        handle.style.cursor = 'grab';
        handle.style.touchAction = 'none';
        handle.addEventListener('pointerdown', onHandlePointerDown);
        handle.addEventListener('pointermove', onHandlePointerMove);
        handle.addEventListener('pointerup', endDrag);
        handle.addEventListener('pointercancel', endDrag);

        return () => {
            handle.removeEventListener('pointerdown', onHandlePointerDown);
            handle.removeEventListener('pointermove', onHandlePointerMove);
            handle.removeEventListener('pointerup', endDrag);
            handle.removeEventListener('pointercancel', endDrag);
        };
    }, [mounted, open, showHeader, handleMode, onHandlePointerDown, onHandlePointerMove, endDrag]);

    if (!mounted) {
        return null;
    }

    const isVisible = entered && open;
    const sheetTransform = isVisible
        ? `translateY(${dragY}px)`
        : 'translateY(100%)';
    // No extra drag strip when the title header (or content header) is the handle
    const showBarHandle = handleMode === 'bar' && !showHeader;

    return (
        <>
            <div
                role="presentation"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(16, 24, 40, 0.35)',
                    zIndex: MOBILE_BACKDROP_Z,
                    opacity: isVisible ? Math.max(0.25, 1 - dragY / 320) : 0,
                    transition: dragging ? 'none' : `opacity ${SHEET_MS}ms ${SHEET_EASE}`,
                    pointerEvents: isVisible ? 'auto' : 'none',
                }}
            />
            <div
                ref={sheetRef}
                role="dialog"
                aria-modal={isVisible ? 'true' : undefined}
                aria-hidden={!isVisible}
                aria-label={title || 'Sheet'}
                style={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height,
                    zIndex: MOBILE_SHEET_Z,
                    backgroundColor: '#ffffff',
                    borderRadius: '20px 20px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isVisible
                        ? '0 -10px 40px rgba(16, 24, 40, 0.16)'
                        : 'none',
                    overflow: 'hidden',
                    fontFamily:
                        '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    transform: sheetTransform,
                    visibility: mounted ? 'visible' : 'hidden',
                    pointerEvents: isVisible ? 'auto' : 'none',
                    transition: dragging
                        ? 'none'
                        : `transform ${SHEET_MS}ms ${SHEET_EASE}`,
                    willChange: 'transform',
                }}
            >
                {showBarHandle && (
                    <div
                        onPointerDown={onHandlePointerDown}
                        onPointerMove={onHandlePointerMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        style={{
                            paddingTop: 10,
                            paddingBottom: showHeader ? 0 : 10,
                            display: 'flex',
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: 'grab',
                            touchAction: 'none',
                        }}
                        aria-label="Drag down to close"
                    >
                        <div
                            style={{
                                width: 40,
                                height: 4,
                                borderRadius: 999,
                                backgroundColor: '#d0d5dd',
                            }}
                        />
                    </div>
                )}

                {showHeader && (
                    <div
                        data-sheet-drag-handle
                        style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #e8edf2',
                            flexShrink: 0,
                            cursor: 'grab',
                            touchAction: 'none',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: 8,
                            }}
                        >
                            <div style={{ minWidth: 0 }}>
                                {title && (
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: '#3f7091',
                                        }}
                                    >
                                        {title}
                                    </h2>
                                )}
                                {badge && (
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            marginTop: 8,
                                            padding: '3px 8px',
                                            borderRadius: 999,
                                            border: `1px solid ${BADGE_COLORS.border}`,
                                            backgroundColor: BADGE_COLORS.bg,
                                            color: BADGE_COLORS.color,
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <IconButton
                                onClick={onClose}
                                size="small"
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </div>
                )}

                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: showHeader ? '12px 16px' : 0,
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        touchAction: 'pan-y',
                    }}
                >
                    {children}
                </div>
            </div>
        </>
    );
}
