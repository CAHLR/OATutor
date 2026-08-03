import {
    BedrockRuntimeClient,
    ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';

export function createBedrockProvider() {
    const region =
        process.env.AWS_REGION ||
        process.env.AWS_DEFAULT_REGION ||
        'us-west-2';
    const modelId =
        process.env.BEDROCK_COMPILER_MODEL_ID ||
        'anthropic.claude-3-5-sonnet-20241022-v2:0';
    const client = new BedrockRuntimeClient({ region });

    return {
        name: 'bedrock',
        model: modelId,
        async completeJson({ system, user, schemaHint }) {
            const command = new ConverseCommand({
                modelId,
                system: [
                    {
                        text:
                            system +
                            (schemaHint
                                ? `\n\nReturn ONLY valid JSON matching this shape guidance:\n${schemaHint}`
                                : '\n\nReturn ONLY valid JSON.'),
                    },
                ],
                messages: [
                    {
                        role: 'user',
                        content: [{ text: user }],
                    },
                ],
                inferenceConfig: {
                    temperature: 0.1,
                    maxTokens: 8000,
                },
            });
            const response = await client.send(command);
            const text =
                response.output?.message?.content
                    ?.map((c) => c.text || '')
                    .join('') || '{}';
            const cleaned = text
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            return JSON.parse(cleaned);
        },
    };
}
