import { renderGPTText } from "../../platform-logic/renderText.js";
import AWS from "aws-sdk";

export async function fetchDynamicHint(
    DYNAMIC_HINT_URL, 
    promptParameters, 
    onChunkReceived,
    onSuccessfulCompletion,
    onError,
    problemID, 
    variabilization, 
    context
    ) {
    try {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: "us-west-1",
        });
        
        const request = new AWS.HttpRequest(DYNAMIC_HINT_URL, AWS.config.region);
        request.method = "POST";
        request.headers["Content-Type"] = "application/json";
        request.headers['Host'] = new URL(DYNAMIC_HINT_URL).host;
        request.body = JSON.stringify(promptParameters);

        const signer = new AWS.Signers.V4(request, "lambda");
        signer.addAuthorization(AWS.config.credentials, new Date());

        // Send the signed request using fetch
        let response;
        try {
            response = await fetch(DYNAMIC_HINT_URL, {
            mode: 'cors',
            method: request.method,
            headers: request.headers,
            body: request.body,
        });
        } catch (error) {
            console.error('Error sending request:', error);
            throw error;
        }

        if (!response.body) {
            throw new Error("No response body from server.");
        }
        if (!response.ok) {
            const errorText = await response.text();
            console.error("AWS Error Response:", errorText);
            throw new Error(`Request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedHint = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                const finalHint = renderGPTText(streamedHint, problemID, variabilization, context);
                console.log("GPT OUTPUT: ", finalHint);
                onChunkReceived(finalHint); // Call the final processing callback
                onSuccessfulCompletion(); //Set `isHintGenerating` to false
                break;
            } else {
                let chunk = decoder.decode(value, { stream: true });
                chunk = convertDoubleToSingleQuotes(chunk);
                // Ensure proper string termination
                chunk = ensureProperTermination(chunk);
                // Add the chunk to the streamedHint
                streamedHint += chunk;
            }
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
