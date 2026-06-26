/**
 * Lightweight fallback for converting LaTeX text to readable speech.
 *
 * Primary TTS text comes from pre-computed pacedSpeech fields in content JSON,
 * generated offline by src/math-to-speech/scripts/autoTTSProcessor.js using SRE.
 *
 * This module is only used as a fallback when pacedSpeech is not available.
 */

/**
 * Basic LaTeX-to-readable fallback (no SRE dependency).
 * Strips LaTeX commands and returns roughly readable text.
 */
function latexExprToReadable(latex) {
    if (!latex) return "";
    let s = latex;
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1 over $2");
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, "the square root of $1");
    s = s.replace(/\\geq/g, " is greater than or equal to ");
    s = s.replace(/\\leq/g, " is less than or equal to ");
    s = s.replace(/\\neq/g, " is not equal to ");
    s = s.replace(/\\times/g, " times ");
    s = s.replace(/\\cdot/g, " times ");
    s = s.replace(/\\div/g, " divided by ");
    s = s.replace(/\\pm/g, " plus or minus ");
    s = s.replace(/\\infty/g, "infinity");
    s = s.replace(/\\pi/g, "pi");
    s = s.replace(/\\[a-zA-Z]+/g, " ");
    s = s.replace(/[{}]/g, "");
    s = s.replace(/\s+/g, " ").trim();
    return s;
}

/**
 * Convert a full text string (possibly containing $$...$$ LaTeX) to readable speech.
 * Used as fallback when pacedSpeech is not available.
 */
export function textToReadable(text) {
    if (!text) return "";

    const DOLLAR_PLACEHOLDER = "XDOLLARX";
    let result = text.replace(/\\\$/g, DOLLAR_PLACEHOLDER);

    // Replace $$...$$ blocks
    result = result.replace(/\$\$(.*?)\$\$/g, (_, latex) => {
        return " " + latexExprToReadable(latex) + " ";
    });

    result = result.replace(new RegExp(DOLLAR_PLACEHOLDER, "g"), "dollar");

    // Escaped newlines
    result = result.replace(/\\n/g, ". ");

    // Remove image references
    result = result.replace(/##\S+/g, "");

    // Unicode math symbols outside $$
    result = result.replace(/≥/g, " is greater than or equal to ");
    result = result.replace(/≤/g, " is less than or equal to ");
    result = result.replace(/≠/g, " is not equal to ");
    result = result.replace(/−/g, " minus ");
    result = result.replace(/×/g, " times ");
    result = result.replace(/∘/g, " composed with ");

    result = result.replace(/\\\\/g, "");
    result = result.replace(/\s+/g, " ").trim();

    return result;
}

export default textToReadable;
