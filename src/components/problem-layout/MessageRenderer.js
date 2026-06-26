import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

/**
 * MessageRenderer component
 * Renders markdown text with LaTeX math support
 * 
 * Supports:
 * - Markdown: **bold**, *italic*, lists, etc.
 * - Inline math: \(...\) 
 * - Display math: \[...\]
 * - GitHub Flavored Markdown (tables, strikethrough, etc.)
 */

// Unicode characters the LLM frequently slips into math regions that KaTeX
// can't parse. We replace them with their LaTeX equivalents to keep math
// rendering clean. Scoped to math regions only — leaving prose untouched
// preserves the student's natural use of these characters in plain text.
const UNICODE_MATH_REPLACEMENTS = [
    [/[°º]/g, '^{\\circ}'],
    [/²/g, '^{2}'],
    [/³/g, '^{3}'],
    [/×/g, '\\times '],
    [/÷/g, '\\div '],
    [/±/g, '\\pm '],
    [/≈/g, '\\approx '],
    [/≤/g, '\\leq '],
    [/≥/g, '\\geq '],
    [/≠/g, '\\neq '],
    [/→/g, '\\to '],
    [/∞/g, '\\infty '],
    [/−/g, '-'], // Unicode minus → ASCII minus
    [/π/g, '\\pi '],
    [/θ/g, '\\theta '],
    [/α/g, '\\alpha '],
    [/β/g, '\\beta '],
    [/γ/g, '\\gamma '],
    [/Δ/g, '\\Delta '],
    [/δ/g, '\\delta '],
    [/μ/g, '\\mu '],
    [/ω/g, '\\omega '],
    [/Ω/g, '\\Omega '],
    [/Σ/g, '\\Sigma '],
    [/σ/g, '\\sigma '],
    [/λ/g, '\\lambda '],
    [/φ/g, '\\phi '],
    [/ρ/g, '\\rho '],
];

function sanitizeMathBody(body) {
    let out = body;
    for (const [pattern, replacement] of UNICODE_MATH_REPLACEMENTS) {
        out = out.replace(pattern, replacement);
    }
    return out;
}

function sanitizeMathRegions(text) {
    // Process display math first ($$...$$) so its `$$` delimiters don't get
    // half-matched by the inline $...$ pass. Inline math is restricted to a
    // single line to avoid swallowing prose with stray `$` characters.
    return text
        .replace(/\$\$([\s\S]+?)\$\$/g, (_, body) => `$$${sanitizeMathBody(body)}$$`)
        .replace(/\$([^$\n]+?)\$/g, (_, body) => `$${sanitizeMathBody(body)}$`);
}

const MessageRenderer = ({ content }) => {
    // Convert \(...\) to $...$ and \[...\] to $$...$$ for remark-math
    const processedContent = sanitizeMathRegions(
        content
            .replace(/\\\(/g, '$')
            .replace(/\\\)/g, '$')
            .replace(/\\\[/g, '$$')
            .replace(/\\\]/g, '$$')
    );

    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            // `throwOnError: false` lets KaTeX render unknown tokens in red
            // instead of crashing the entire React tree. Combined with the
            // Unicode sanitizer above, this means a stray `°`, weird Greek
            // letter, or malformed brace from the LLM degrades to a small
            // visual hiccup rather than blanking the chat.
            rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
            components={{
                // Custom styling for paragraphs
                p: ({ children }) => (
                    <p style={{ margin: '0.5em 0' }}>{children}</p>
                ),
                // Custom styling for lists
                ol: ({ children }) => (
                    <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ol>
                ),
                ul: ({ children }) => (
                    <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ul>
                ),
                li: ({ children }) => (
                    <li style={{ margin: '0.25em 0' }}>{children}</li>
                ),
                // Custom styling for code blocks
                code: ({ inline, children }) => (
                    inline ? (
                        <code style={{
                            backgroundColor: '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: 3,
                            fontFamily: 'monospace'
                        }}>
                            {children}
                        </code>
                    ) : (
                        <pre style={{
                            backgroundColor: '#f5f5f5',
                            padding: '12px',
                            borderRadius: 6,
                            overflow: 'auto',
                            fontFamily: 'monospace'
                        }}>
                            <code>{children}</code>
                        </pre>
                    )
                ),
            }}
        >
            {processedContent}
        </ReactMarkdown>
    );
};

export default MessageRenderer;

