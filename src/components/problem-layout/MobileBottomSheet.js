import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export const MOBILE_HINT_SHEET_HEIGHT = 'min(60vh, 600px)';
export const MOBILE_CHAT_SHEET_HEIGHT = 'min(82vh, 820px)';
export const MOBILE_BACKDROP_Z = 1200;
export const MOBILE_SHEET_Z = 1300;

const BADGE_COLORS = {
    border: '#a3c5de',
    bg: '#ffffff',
    color: '#3f7091',
};

/**
 * Bottom sheet overlay for mobile hint panels.
 */
export default function MobileBottomSheet({
    open,
    onClose,
    title,
    badge,
    children,
    keepMounted = false,
    height = MOBILE_HINT_SHEET_HEIGHT,
}) {
    if (!open && !keepMounted) {
        return null;
    }

    const isVisible = open;

    return (
        <>
            {isVisible && (
                <div
                    role="presentation"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(16, 24, 40, 0.35)',
                        zIndex: MOBILE_BACKDROP_Z,
                    }}
                />
            )}
            <div
                role="dialog"
                aria-modal={isVisible ? 'true' : undefined}
                aria-hidden={!isVisible}
                aria-label={title}
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
                    boxShadow: isVisible ? '0 -10px 40px rgba(16, 24, 40, 0.16)' : 'none',
                    overflow: 'hidden',
                    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
                    visibility: isVisible ? 'visible' : 'hidden',
                    pointerEvents: isVisible ? 'auto' : 'none',
                    transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div
                    style={{
                        paddingTop: 10,
                        display: 'flex',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
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

                <div
                    style={{
                        padding: '8px 16px 12px',
                        borderBottom: '1px solid #e8edf2',
                        flexShrink: 0,
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
                        <IconButton onClick={onClose} size="small" aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '12px 16px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                    }}
                >
                    {children}
                </div>
            </div>
        </>
    );
}
