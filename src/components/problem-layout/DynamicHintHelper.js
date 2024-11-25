import { renderGPTText } from "../../platform-logic/renderText.js";
export async function fetchDynamicHint(DYNAMIC_HINT_URL, 
    promptParameters, onChunkReceived, onError, problemID, variabilization, context) {
    try {
        const response = await fetch(DYNAMIC_HINT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(promptParameters),
        });
        if (!response.body) {
            throw new Error("No response body from server.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedHint = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                streamedHint = renderGPTText(streamedHint, problemID, variabilization, context);
                console.log(streamedHint);
                break;
            } else {
                let chunk = decoder.decode(value, { stream: true });
                chunk = convertDoubleToSingleQuotes(chunk);
                // Ensure proper string termination
                chunk = ensureProperTermination(chunk);
                // Add the chunk to the streamedHint
                streamedHint += chunk;
            }
            // Callback to process chunks
            onChunkReceived(streamedHint);
        }
    } catch (error) {
        console.error("Error fetching dynamic hint:", error);
        onError(error);
    }
}

function convertDoubleToSingleQuotes(input) {
    if (input.startsWith('"') && input.endsWith('"')) {
      return `'${input.slice(1, -1)}'`;
    }
    return input; // Return unchanged if not surrounded by double quotes
}

function ensureProperTermination(input) {
    // Check if input starts and ends with the same type of quote
    if ((input.startsWith('"') && !input.endsWith('"')) || 
        (input.startsWith("'") && !input.endsWith("'"))) {
        // Append the missing quote
        return input + input[0]; // Add the matching quote at the end
    }
    return input; // Return unchanged if it's already valid
}
