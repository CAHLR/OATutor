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
const MessageRenderer = ({ content }) => {
    // Convert \(...\) to $...$ and \[...\] to $$...$$ for remark-math
    const processedContent = content
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$')
        .replace(/\\\[/g, '$$')
        .replace(/\\\]/g, '$$');

    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
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