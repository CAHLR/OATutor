/**
 * OpenAI Chat Completions params differ by model family.
 * Classic (gpt-4o, gpt-4-turbo): max_tokens + temperature.
 * Newer (gpt-5*, o1/o3/o4): max_completion_tokens; reasoning models omit temperature.
 *
 * Unknown models get a best-effort profile, then one remap if the API 400s.
 */

function normalizeModel(model) {
    return String(model || "").trim().toLowerCase();
}

export function isReasoningModel(model) {
    const name = normalizeModel(model);
    return /^(o1|o3|o4)([.-]|$)/.test(name);
}

export function usesMaxCompletionTokens(model) {
    const name = normalizeModel(model);
    return isReasoningModel(name) || name.startsWith("gpt-5");
}

/** Smoke-test budget. Reasoning models spend tokens before any visible text. */
export function smokeTestMaxTokens(model) {
    return isReasoningModel(model) ? 512 : 8;
}

export function defaultChatMaxTokens(model, fallback = 800) {
    return isReasoningModel(model) ? 2000 : fallback;
}

export function buildChatCompletionParams({
    model,
    messages,
    stream,
    temperature,
    maxTokens,
    ...rest
}) {
    const params = { model, messages, ...rest };
    if (stream != null) {
        params.stream = stream;
    }
    if (maxTokens != null) {
        if (usesMaxCompletionTokens(model)) {
            params.max_completion_tokens = maxTokens;
        } else {
            params.max_tokens = maxTokens;
        }
    }
    if (temperature != null && !isReasoningModel(model)) {
        params.temperature = temperature;
    }
    return params;
}

export function remapParamsFromApiError(params, err) {
    const msg = String(err?.message || err?.error?.message || "").toLowerCase();
    const next = { ...params };
    let changed = false;

    if (msg.includes("max_completion_tokens") && Object.prototype.hasOwnProperty.call(next, "max_tokens")) {
        next.max_completion_tokens = next.max_tokens;
        delete next.max_tokens;
        changed = true;
    }
    if (
        (msg.includes("unsupported") || msg.includes("not support")) &&
        msg.includes("temperature") &&
        Object.prototype.hasOwnProperty.call(next, "temperature")
    ) {
        delete next.temperature;
        changed = true;
    }

    return changed ? next : null;
}

export async function createChatCompletion(openai, spec) {
    let params = buildChatCompletionParams(spec);
    try {
        return await openai.chat.completions.create(params);
    } catch (err) {
        const remapped = remapParamsFromApiError(params, err);
        if (!remapped) {
            throw err;
        }
        return await openai.chat.completions.create(remapped);
    }
}
