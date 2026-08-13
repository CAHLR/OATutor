import OpenAI from 'openai';

export function createOpenAiProvider() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is required for the OpenAI semantic compiler.');
    }
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_COMPILER_MODEL || 'gpt-4o';

    return {
        name: 'openai',
        model,
        async completeJson({ system, user, schemaHint }) {
            const maxTokens = Number(process.env.OPENAI_COMPILER_MAX_TOKENS) || 16000;
            const completion = await client.chat.completions.create({
                model,
                temperature: 0.1,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content:
                            system +
                            (schemaHint
                                ? `\n\nReturn JSON matching this shape guidance:\n${schemaHint}`
                                : ''),
                    },
                    { role: 'user', content: user },
                ],
            });
            const choice = completion.choices?.[0];
            const text = choice?.message?.content || '{}';
            if (choice?.finish_reason === 'length') {
                throw new Error(
                    `OpenAI compiler response truncated (finish_reason=length, max_tokens=${maxTokens}). ` +
                        'Raise OPENAI_COMPILER_MAX_TOKENS or reduce prompt output size.'
                );
            }
            try {
                return JSON.parse(text);
            } catch (err) {
                throw new Error(
                    `OpenAI compiler returned invalid JSON: ${err.message}`
                );
            }
        },
    };
}
