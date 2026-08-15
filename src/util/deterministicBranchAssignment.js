/**
 * Deterministically hashes a string ID down to a non-negative 32-bit integer.
 * Same input always produces the same output, on any device/browser/JS engine --
 * that's the whole point (it's what lets branch assignment be based on the student's
 * real LMS identity instead of random-then-persisted-per-browser).
 *
 * This is the classic "djb2-style" string hash (same basic idea as Java's
 * String.hashCode()): each character is folded into a running total via
 * `hash * 31 + charCode`, written with a bit-shift for speed. The `hash & hash`
 * forces the running total back into the 32-bit integer range at every step
 * (JS bitwise ops always operate on 32-bit ints internally; ANDing a value with
 * itself doesn't change it, but performing the AND at all triggers that 32-bit
 * conversion) -- without this, the running total could grow as a full-precision
 * float and behave subtly differently across JS engines for very large numbers.
 *
 * @param {string} userId
 * @return {number} a non-negative integer, deterministic for a given userId
 */
export function hashUserIdToInt(userId) {
    if (typeof userId !== "string") {
        userId = String(userId ?? "");
    }
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Deterministically picks one of `numberOfChoices` branch indices for a given userId.
 * Same userId always returns the same index -- this is what makes branch assignment
 * stable across devices/browsers for the same real student, instead of the
 * random-then-persisted-in-this-browser behavior used elsewhere.
 *
 * @param {string} userId - a stable, real identity (e.g. the Canvas lms_user_id).
 *   Do NOT pass a browser-local ID like oats_user_id here -- that would silently
 *   recreate the exact "different device = different assignment" problem this
 *   mechanism exists to avoid.
 * @param {number} numberOfChoices - how many branches to choose between (e.g. 2 for
 *   a two-condition meta-lesson)
 * @return {number} an integer in [0, numberOfChoices), deterministic for a given userId
 */
export function getDeterministicBranchIndex(userId, numberOfChoices) {
    if (!Number.isInteger(numberOfChoices) || numberOfChoices <= 0) {
        throw new Error(
            `getDeterministicBranchIndex: numberOfChoices must be a positive integer, got ${numberOfChoices}`
        );
    }
    return hashUserIdToInt(userId) % numberOfChoices;
}
