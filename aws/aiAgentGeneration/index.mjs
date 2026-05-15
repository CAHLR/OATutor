import dotenv from "dotenv";
import OpenAI from "openai";
import AWS from "aws-sdk";
import { buildAgentPrompt, generateAgentResponse } from "./agent-logic.mjs";
import crypto from "crypto";

dotenv.config();

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function sha256Hex(s) {
    return crypto.createHash("sha256").update(String(s || ""), "utf8").digest("hex");
}

function nowMs() {
    return Date.now();
}

function logEvent(evt) {
    // Single-line JSON for CloudWatch Logs Insights friendliness.
    console.log(JSON.stringify({ ...evt, timestampMs: evt.timestampMs ?? nowMs() }));
}

function safeJsonParse(str) {
    try { return JSON.parse(str); } catch { return null; }
}

function getPath(event) {
    return (
        event.rawPath ||
        event.requestContext?.http?.path ||
        event.path ||
        ""
    );
}

async function writeTranscriptLine({
    bucket,
    key,
    lineObj,
}) {
    if (!bucket) return;
    const line = JSON.stringify(lineObj) + "\n";
    await s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: line,
        ContentType: "application/x-ndjson",
    }).promise();
}

export const handler = awslambda.streamifyResponse(
    async (event, responseStream, _context) => {
        const httpMethod = event.requestContext?.http?.method || 
                          event.httpMethod || 
                          event.method ||
                          event.requestContext?.method;
        
        const isOptionsRequest = httpMethod === 'OPTIONS' || 
                                event.requestContext?.http?.method === 'OPTIONS' ||
                                event.httpMethod === 'OPTIONS' ||
                                event.method === 'OPTIONS';
        
        if (isOptionsRequest) {
            const metadata = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization,Origin",
                    "Access-Control-Max-Age": "86400",
                    "Content-Type": "application/json"
                },
            };
            const httpResponseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
            httpResponseStream.write("");
            httpResponseStream.end();
            return;
        }

        let httpResponseStream;

        try {
            const requestBody = safeJsonParse(event.body);
            if (!requestBody) {
                throw new Error("Invalid JSON body");
            }
            const {
                sessionId,
                userMessage,
                problemContext,
                studentState,
                extracted = {},
                conversationHistory = []
            } = requestBody;
            const condition = requestBody.condition ?? extracted?.condition;
            const lessonId = requestBody.lessonId ?? extracted?.lessonId;
            const chatPrompt = requestBody.chatPrompt ?? problemContext?.chatPrompt;
            const chatDisplayMode = requestBody.chatDisplayMode ?? extracted?.chatDisplayMode;

            // Lightweight client lifecycle log endpoint.
            // POST { eventType: 'chat_opened' | 'chat_closed' | ... , payload?: {...} }
            const path = getPath(event);
            const isLogEvent = requestBody?.eventType && !requestBody?.userMessage;
            if (isLogEvent || path.endsWith("/log")) {
                const metadata = {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                        "Access-Control-Allow-Headers": "Origin,Content-Type,Authorization",
                    },
                };
                httpResponseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
                logEvent({
                    ...requestBody,
                    eventType: String(requestBody.eventType),
                    source: "client",
                });
                httpResponseStream.write(JSON.stringify({ ok: true }) + "\n");
                httpResponseStream.end();
                return;
            }

            const metadata = {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Origin,Content-Type,Authorization",
                    "Transfer-Encoding": "chunked",
                    "X-Content-Type-Options": "nosniff"
                },
            };

            httpResponseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

            const existingConversation = await loadConversationHistory(sessionId);
            const fullConversationHistory = [...existingConversation, ...conversationHistory];
            
            const agentPrompt = buildAgentPrompt({
                userMessage,
                problemContext,
                studentState,
                conversationHistory: fullConversationHistory,
                extracted,
                chatPrompt,
            });

            const lastMsg = agentPrompt[agentPrompt.length - 1];
            const lastPreview = typeof lastMsg?.content === 'string'
                ? lastMsg.content
                : JSON.stringify(lastMsg?.content)?.slice(0, 300);

            const promptText = agentPrompt?.[0]?.content || "";
            const promptHash = sha256Hex(promptText);
            const imagesCount = Array.isArray(extracted?.images) ? extracted.images.length : 0;

            const turnId = requestBody.turnId ?? undefined;
            const userIdHash = requestBody.userIdHash ?? undefined;
            const startedAt = nowMs();

            // Optional emergency debug: log full prompt when explicitly enabled.
            if (process.env.LOG_FULL_PROMPT === "true") {
                logEvent({ eventType: "debug_prompt_full", sessionId, turnId, promptHash, prompt: promptText });
            }

            logEvent({
                eventType: "turn_started",
                sessionId,
                turnId,
                userIdHash,
                promptHash,
                model: process.env.OPENAI_MODEL || undefined,
                imagesCount,
                condition,
                lessonId,
                chatPrompt,
                chatDisplayMode,
                problemId: problemContext?.problemID,
                stepId: problemContext?.currentStep?.id,
                courseName: problemContext?.courseName,
                userMessagePreview: String(lastPreview || "").slice(0, 200),
            });

            const response = await generateAgentResponse(openai, agentPrompt, httpResponseStream);

            if (response) {
                await updateConversationHistory(sessionId, userMessage, response);
            }

            // Append full transcript to S3 (research logging).
            const transcriptBucket = process.env.TRANSCRIPT_BUCKET;
            const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const turnKey = (role, ts) =>
                `transcripts/${date}/sessionId=${sessionId}/turnId=${turnId ?? "na"}/${ts}-${role}.jsonl`;
            const common = {
                sessionId,
                turnId,
                userIdHash,
                problemId: problemContext?.problemID,
                stepId: problemContext?.currentStep?.id,
                courseName: problemContext?.courseName,
                promptHash,
                condition,
                lessonId,
                chatPrompt,
                chatDisplayMode,
            };
            // User line (do not store images bytes; only metadata).
            await writeTranscriptLine({
                bucket: transcriptBucket,
                key: turnKey("user", startedAt),
                lineObj: {
                    ...common,
                    role: "user",
                    content: userMessage,
                    imagesCount,
                    timestampMs: startedAt,
                },
            });
            // Assistant line.
            await writeTranscriptLine({
                bucket: transcriptBucket,
                key: turnKey("assistant", nowMs()),
                lineObj: {
                    ...common,
                    role: "assistant",
                    content: response,
                    timestampMs: nowMs(),
                },
            });

            logEvent({
                eventType: "turn_completed",
                sessionId,
                turnId,
                userIdHash,
                latencyMs: nowMs() - startedAt,
                responseCharCount: typeof response === "string" ? response.length : 0,
                assistantMessage: typeof response === "string" ? response : "",
                promptHash,
                condition,
                lessonId,
                chatPrompt,
                chatDisplayMode,
                problemId: problemContext?.problemID,
                stepId: problemContext?.currentStep?.id,
                courseName: problemContext?.courseName,
            });

        } catch (error) {
            logEvent({
                eventType: "turn_error",
                message: error?.message,
                stack: process.env.LOG_ERROR_STACK === "true" ? String(error?.stack || "") : undefined,
            });
            console.error("Agent error:", error);
            if (httpResponseStream) {
                httpResponseStream.write(
                    JSON.stringify({ error: error.message, type: "error" }) + "\n"
                );
            }
        } finally {
            if (httpResponseStream) {
                httpResponseStream.end();
            }
        }
    }
);

async function loadConversationHistory(sessionId) {
    try {
        const params = {
            TableName: process.env.CONVERSATION_TABLE_NAME || "agent-conversations",
            Key: { sessionId: sessionId }
        };

        const result = await dynamoClient.get(params).promise();
        return result.Item?.messages || [];
    } catch (error) {
        return [];
    }
}

async function updateConversationHistory(sessionId, userMessage, agentResponse) {
    if (!agentResponse) return;
    
    try {
        const existingMessages = await loadConversationHistory(sessionId);
        
        const updatedMessages = [
            ...existingMessages,
            {
                role: "user",
                content: userMessage,
                timestamp: Date.now()
            },
            {
                role: "assistant",
                content: agentResponse,
                timestamp: Date.now()
            }
        ];
        
        const params = {
            TableName: process.env.CONVERSATION_TABLE_NAME || "agent-conversations",
            Item: {
                sessionId: sessionId,
                messages: updatedMessages,
                lastUpdated: Date.now(),
                ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
            }
        };

        await dynamoClient.put(params).promise();
    } catch (error) {
        console.error("Error updating conversation history:", error);
    }
}