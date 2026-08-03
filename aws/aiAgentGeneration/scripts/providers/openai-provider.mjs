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
            const completion = await client.chat.completions.create({
                model,
                temperature: 0.1,
                max_tokens: 8000,
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
            const text = completion.choices?.[0]?.message?.content || '{}';
            return JSON.parse(text);
        },
    };
}
