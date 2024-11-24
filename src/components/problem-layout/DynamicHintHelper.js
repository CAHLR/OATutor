export async function fetchDynamicHint(DYNAMIC_HINT_URL, promptParameters, onChunkReceived, onError) {
    try {
        const response = await fetch(DYNAMIC_HINT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            queryStringParameters: JSON.stringify(promptParameters),
        });

        if (!response.body) {
            throw new Error("No response body from server.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedHint = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            console.log(streamedHint);
            streamedHint += decoder.decode(value, { stream: true });

            // Callback to process chunks
            onChunkReceived(streamedHint);
        }
    } catch (error) {
        console.error("Error fetching dynamic hint:", error);
        onError(error);
    }
}
