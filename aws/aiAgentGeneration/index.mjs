import dotenv from "dotenv";
import OpenAI from "openai";
import AWS from "aws-sdk";
import { analyzeStudentState, buildAgentPrompt, generateAgentResponse } from "./agent-logic.mjs";

dotenv.config();

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
            const requestBody = JSON.parse(event.body);
            const {
                sessionId,
                userMessage,
                problemContext,
                studentState,
                conversationHistory = [],
                agentConfig = {}
            } = requestBody;

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

            const studentAnalysis = analyzeStudentState(studentState, problemContext);
            
            const agentPrompt = buildAgentPrompt({
                userMessage,
                problemContext,
                studentState,
                studentAnalysis,
                conversationHistory: fullConversationHistory,
                agentConfig
            });

            const response = await generateAgentResponse(openai, agentPrompt, httpResponseStream);

            if (response) {
                await updateConversationHistory(sessionId, userMessage, response);
            }

        } catch (error) {
            console.error("Agent error:", error);
            if (httpResponseStream) {
                httpResponseStream.write(JSON.stringify({
                    error: error.message,
                    type: "error"
                }));
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