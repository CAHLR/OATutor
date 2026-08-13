/**
 * LLM provider interface for the semantic compiler.
 */
export function resolveProviderName(explicit) {
    return (
        explicit ||
        process.env.SEMANTIC_COMPILER_PROVIDER ||
        'openai'
    ).toLowerCase();
}

export async function createLlmProvider(name) {
    const resolved = resolveProviderName(name);
    if (resolved === 'openai') {
        const mod = await import('./openai-provider.mjs');
        return mod.createOpenAiProvider();
    }
    if (resolved === 'bedrock') {
        const mod = await import('./bedrock-provider.mjs');
        return mod.createBedrockProvider();
    }
    throw new Error(`Unknown SEMANTIC_COMPILER_PROVIDER: ${resolved}`);
}
