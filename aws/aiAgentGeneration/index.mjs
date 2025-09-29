"use strict";

import dotenv from "dotenv";
import OpenAI from "openai";
// AWS SDK is built into Lambda, no need to import
import { analyzeStudentState, buildAgentPrompt, generateAgentResponse } from "./agent-logic.mjs";

// Load environment variables from .env file
dotenv.config();

console.log("AI Agent Lambda started");

// Initialize AWS clients (uses built-in AWS SDK)
import AWS from 'aws-sdk';
const dynamoClient = new AWS.DynamoDB.DocumentClient();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handler = awslambda.streamifyResponse(
    async (event, responseStream, _context) => {
        console.log("Agent request started:", event);

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

            const startTime = process.hrtime();

            // Set up response metadata
            const metadata = {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Origin, Content-Type, Authorization",
                },
            };

            responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

            // Load existing conversation from DynamoDB
            const existingConversation = await loadConversationHistory(sessionId);
            const fullConversationHistory = [...existingConversation, ...conversationHistory];

            // Analyze student state and build context
            const studentAnalysis = analyzeStudentState(studentState, problemContext);
            
            // Build intelligent prompt
            const agentPrompt = buildAgentPrompt({
                userMessage,
                problemContext,
                studentState,
                studentAnalysis,
                conversationHistory: fullConversationHistory,
                agentConfig
            });

            // Generate response
            const response = await generateAgentResponse(openai, agentPrompt, responseStream);

            // Update conversation history in DynamoDB
            await updateConversationHistory(sessionId, userMessage, response);

            // Log execution time
            const hrTime = process.hrtime(startTime);
            const totalSeconds = hrTime[0] + hrTime[1] / 1e9;
            console.log(`Agent execution time: ${totalSeconds.toFixed(2)} seconds`);

        } catch (error) {
            console.error("Agent error:", error);
            responseStream.write(JSON.stringify({
                error: error.message,
                type: "error"
            }));
        } finally {
            responseStream.end();
        }
    }
);

/**
 * Load conversation history from DynamoDB
 */
async function loadConversationHistory(sessionId) {
    try {
        const params = {
            TableName: process.env.CONVERSATION_TABLE_NAME || "agent-conversations",
            Key: {
                sessionId: sessionId
            }
        };

        const result = await dynamoClient.get(params).promise();
        return result.Item?.messages || [];
    } catch (error) {
        console.log("No existing conversation found or error loading:", error.message);
        return [];
    }
}

/**
 * Update conversation history in DynamoDB
 */
async function updateConversationHistory(sessionId, userMessage, agentResponse) {
    try {
        const params = {
            TableName: process.env.CONVERSATION_TABLE_NAME || "agent-conversations",
            Item: {
                sessionId: sessionId,
                messages: [
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
                ],
                lastUpdated: Date.now(),
                ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            }
        };

        await dynamoClient.put(params).promise();
    } catch (error) {
        console.error("Error updating conversation history:", error);
    }
}


// Functions moved to agent-logic.mjs for shared use
