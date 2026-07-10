/** Shared positioning for stacked mobile hint + agent FABs (bottom-right). */

export const MOBILE_FAB_RIGHT = 16;
export const MOBILE_AGENT_FAB_BOTTOM = 20;
export const MOBILE_AGENT_BUTTON_SIZE = 64;
export const MOBILE_AGENT_AVATAR_WIDTH = MOBILE_AGENT_BUTTON_SIZE;
export const MOBILE_AGENT_AVATAR_HEIGHT = Math.round(MOBILE_AGENT_BUTTON_SIZE * (74 / 80));
export const MOBILE_HINT_BUTTON_SIZE = 48;
export const MOBILE_HINT_BADGE_SIZE = MOBILE_HINT_BUTTON_SIZE;
export const MOBILE_HINT_ICON_SIZE = Math.round(MOBILE_HINT_BUTTON_SIZE * (42 / 64));
export const MOBILE_HINT_FAB_BOTTOM =
    MOBILE_AGENT_FAB_BOTTOM + MOBILE_AGENT_AVATAR_HEIGHT + 10;

export const HINT_BADGE_COLORS = {
    accent: '#EF9F27',
    accentSoft: '#FAEEDA',
    accentIcon: '#854F0B',
};

export const mobileFabButtonStyle = {
    position: 'fixed',
    right: MOBILE_FAB_RIGHT,
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
};
