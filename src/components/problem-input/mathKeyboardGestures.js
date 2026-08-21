/** Animated show/hide + pull-down-to-dismiss for MathLive's virtual keyboard. */

const CLOSE_DRAG_PX = 64;
const HANDLE_CLASS = 'oat-math-kb-drag';
const ANIM_MS = 280;
const SUPPRESS_SHOW_MS = 800;

let boundBackdrop = null;
let hideTimer = null;
let hiding = false;
let suppressShowUntil = 0;
/** Bumps on every hide so in-flight show rAFs/timeouts become no-ops. */
let showGeneration = 0;
let showGuarded = false;
let nativeShow = null;
let dragState = {
    active: false,
    startY: 0,
    dy: 0,
};

function getKeyboardRoot() {
    return document.querySelector('body > .ML__keyboard') || document.querySelector('.ML__keyboard');
}

function restingBackdropTransform() {
    return 'translate(0, calc(-1 * var(--_keyboard-height)))';
}

function hiddenBackdropTransform() {
    return 'translate(0, 0)';
}

function clearHideTimer() {
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
}

export function isMathKeyboardShowSuppressed() {
    return hiding || Date.now() < suppressShowUntil;
}

/**
 * Keep MathLive show() gated forever so dismiss races can't reopen after we
 * temporarily patch/restore during exit animation.
 */
export function ensureMathKeyboardShowGuard() {
    if (typeof window === 'undefined') return;
    const kb = window.mathVirtualKeyboard;
    if (!kb || typeof kb.show !== 'function') return;
    if (showGuarded && nativeShow) return;

    nativeShow = kb.show.bind(kb);
    showGuarded = true;
    kb.show = (...args) => {
        if (isMathKeyboardShowSuppressed()) return;
        return nativeShow(...args);
    };
}

function ensureShowGuard() {
    ensureMathKeyboardShowGuard();
}

function blurMathFields() {
    try {
        const active = document.activeElement;
        if (active) {
            if (active.tagName === 'MATH-FIELD') {
                active.blur();
            } else if (typeof active.blur === 'function') {
                const host = active.getRootNode?.()?.host;
                if (host?.tagName === 'MATH-FIELD') {
                    host.blur();
                } else {
                    active.blur();
                }
            }
        }
        document.querySelectorAll('math-field').forEach((mf) => {
            try {
                mf.blur?.();
            } catch (_) {
                // ignore
            }
        });
    } catch (_) {
        // ignore
    }
}

/**
 * Animate keyboard closed, then tear down via MathLive hide().
 * Invalidates any in-flight show reinforcements so they can't slide it back up.
 */
export function hideMathKeyboardAnimated(options = {}) {
    if (typeof window === 'undefined') return;
    if (hiding) return;

    ensureShowGuard();
    const kb = window.mathVirtualKeyboard;
    const root = getKeyboardRoot();
    clearHideTimer();

    // Cancel pending show side-effects (rAF / setTimeout from showMathKeyboardAnimated).
    showGeneration += 1;
    suppressShowUntil = Date.now() + SUPPRESS_SHOW_MS;
    blurMathFields();

    if (!kb?.visible || !root) {
        try {
            kb?.hide?.();
        } catch (_) {
            // ignore
        }
        hiding = false;
        return;
    }

    hiding = true;
    const backdrop = root.querySelector('.MLK__backdrop') || boundBackdrop;
    const fromDy = typeof options.fromDy === 'number' ? options.fromDy : null;
    const hideGen = showGeneration;

    // MathLive hide() removes DOM instantly — no-op it until exit animation ends.
    const origHide = typeof kb.hide === 'function' ? kb.hide.bind(kb) : null;
    if (origHide) kb.hide = () => {};

    root.classList.add('animate');
    if (backdrop) {
        backdrop.classList.remove('is-oat-dragging');
        if (fromDy != null) {
            backdrop.style.transition = 'none';
            backdrop.style.transform = `translate(0, calc(-1 * var(--_keyboard-height) + ${fromDy}px))`;
            void backdrop.getBoundingClientRect();
            backdrop.style.transition =
                'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
        } else if (!backdrop.style.transform) {
            backdrop.style.transform = restingBackdropTransform();
            void backdrop.getBoundingClientRect();
        }
        requestAnimationFrame(() => {
            if (hideGen !== showGeneration || !backdrop) return;
            backdrop.style.opacity = '0';
            backdrop.style.transform = hiddenBackdropTransform();
            root.classList.remove('is-visible');
        });
    } else {
        root.classList.remove('is-visible');
    }

    let finished = false;
    const finish = () => {
        if (finished) return;
        if (hideGen !== showGeneration) return;
        finished = true;
        clearHideTimer();
        if (backdrop) {
            backdrop.style.transition = '';
            backdrop.style.transform = '';
            backdrop.style.opacity = '';
        }
        if (origHide) {
            kb.hide = origHide;
            try {
                origHide();
            } catch (_) {
                // ignore
            }
        }
        hiding = false;
        // Keep show blocked a bit longer while focus/geometry settles.
        suppressShowUntil = Date.now() + SUPPRESS_SHOW_MS;
        ensureShowGuard();
    };

    backdrop?.addEventListener('transitionend', finish, { once: true });
    hideTimer = setTimeout(finish, ANIM_MS + 40);
}

export function showMathKeyboardAnimated() {
    if (typeof window === 'undefined') return;
    if (isMathKeyboardShowSuppressed()) return;

    ensureShowGuard();
    const kb = window.mathVirtualKeyboard;
    if (!kb) return;

    if (kb.visible) {
        bindMathKeyboardDismissDrag();
        return;
    }

    const gen = showGeneration;

    try {
        kb.show({ animate: true });
    } catch (_) {
        try {
            kb.show();
        } catch (__) {
            // ignore
        }
    }

    // Only reinforce enter animation for THIS show generation.
    requestAnimationFrame(() => {
        if (gen !== showGeneration || isMathKeyboardShowSuppressed()) return;
        const root = getKeyboardRoot();
        if (!root) return;
        root.classList.add('animate');
        if (!root.classList.contains('is-visible')) {
            requestAnimationFrame(() => {
                if (gen !== showGeneration || isMathKeyboardShowSuppressed()) return;
                root.classList.add('is-visible');
                bindMathKeyboardDismissDrag();
            });
        } else {
            bindMathKeyboardDismissDrag();
        }
        setTimeout(() => {
            if (gen !== showGeneration || isMathKeyboardShowSuppressed()) return;
            bindMathKeyboardDismissDrag();
        }, 80);
        setTimeout(() => {
            if (gen !== showGeneration || isMathKeyboardShowSuppressed()) return;
            bindMathKeyboardDismissDrag();
        }, 250);
    });
}

function detachDocumentDragListeners() {
    document.removeEventListener('pointermove', onDocPointerMove, true);
    document.removeEventListener('pointerup', onDocPointerUp, true);
    document.removeEventListener('pointercancel', onDocPointerUp, true);
}

function onDocPointerMove(event) {
    if (!dragState.active || !boundBackdrop) return;
    event.preventDefault();
    const dy = Math.max(0, event.clientY - dragState.startY);
    dragState.dy = dy;
    boundBackdrop.style.transform = `translate(0, calc(-1 * var(--_keyboard-height) + ${dy}px))`;
}

function onDocPointerUp(event) {
    if (!dragState.active) return;
    event?.preventDefault?.();
    detachDocumentDragListeners();

    const dy = dragState.dy;
    dragState = { active: false, startY: 0, dy: 0 };
    if (!boundBackdrop) return;

    boundBackdrop.classList.remove('is-oat-dragging');
    if (dy >= CLOSE_DRAG_PX) {
        hideMathKeyboardAnimated({ fromDy: dy });
        return;
    }
    boundBackdrop.style.transition =
        'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    boundBackdrop.style.transform = restingBackdropTransform();
    window.setTimeout(() => {
        if (boundBackdrop && !boundBackdrop.classList.contains('is-oat-dragging')) {
            boundBackdrop.style.transition = '';
            boundBackdrop.style.transform = '';
        }
    }, 220);
}

function onHandlePointerDown(event) {
    if (hiding || isMathKeyboardShowSuppressed()) return;
    event.preventDefault();
    event.stopPropagation();
    const root = getKeyboardRoot();
    const backdrop = root?.querySelector('.MLK__backdrop');
    if (!backdrop) return;
    boundBackdrop = backdrop;

    dragState = { active: true, startY: event.clientY, dy: 0 };
    backdrop.classList.add('is-oat-dragging');
    backdrop.style.transition = 'none';
    backdrop.style.transform = restingBackdropTransform();

    document.addEventListener('pointermove', onDocPointerMove, true);
    document.addEventListener('pointerup', onDocPointerUp, true);
    document.addEventListener('pointercancel', onDocPointerUp, true);

    try {
        event.currentTarget.setPointerCapture(event.pointerId);
    } catch (_) {
        // ignore
    }
}

function ensureDragHandle(keyboardRoot) {
    let handle = keyboardRoot.querySelector(`.${HANDLE_CLASS}`);
    if (handle) return handle;

    handle = document.createElement('div');
    handle.className = HANDLE_CLASS;
    handle.setAttribute('role', 'button');
    handle.setAttribute('aria-label', 'Drag down to close keyboard');
    handle.addEventListener('pointerdown', onHandlePointerDown, { passive: false });

    const plate = keyboardRoot.querySelector('.MLK__plate');
    const host = plate || keyboardRoot.querySelector('.MLK__backdrop') || keyboardRoot;
    if (getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
    }
    handle.style.position = 'absolute';
    handle.style.top = '0';
    handle.style.left = '0';
    handle.style.right = '0';
    host.prepend(handle);
    return handle;
}

export function bindMathKeyboardDismissDrag() {
    if (typeof document === 'undefined') return false;
    if (isMathKeyboardShowSuppressed()) return false;
    ensureShowGuard();
    const keyboardRoot = getKeyboardRoot();
    if (!keyboardRoot) return false;

    const backdrop = keyboardRoot.querySelector('.MLK__backdrop');
    boundBackdrop = backdrop || keyboardRoot;
    ensureDragHandle(keyboardRoot);
    return true;
}
