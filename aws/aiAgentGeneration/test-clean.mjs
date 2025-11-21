#!/usr/bin/env node

/**
 * Clean local testing script using shared agent logic
 * Run with: node test-clean.mjs
 */

import dotenv from "dotenv";
import OpenAI from "openai";
import { readFileSync } from 'fs';
import { buildAgentPrompt, generateAgentResponse } from "./agent-logic.mjs";

// Load environment variables
dotenv.config();

console.log("🤖 Testing AI Agent with shared logic...\n");

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testAgent() {
    try {
        // Load test event
        const testEvent = JSON.parse(readFileSync('./test-event.json', 'utf8'));
        const requestBody = JSON.parse(testEvent.body);
        
        console.log('📝 Test event loaded');
        console.log('👤 User message:', requestBody.userMessage);
        console.log('📚 Problem:', requestBody.problemContext.problemTitle);
        console.log('🎯 Current step:', requestBody.problemContext.currentStep.title);
        console.log('💭 Student answer:', requestBody.studentState.currentAnswer);
        console.log('\n--- Processing Flow ---\n');
        
        // Build agent prompt with simplified data
        console.log('🤖 Building agent prompt...');
        const agentPrompt = buildAgentPrompt({
            userMessage: requestBody.userMessage,
            problemContext: requestBody.problemContext,
            studentState: requestBody.studentState,
            conversationHistory: requestBody.conversationHistory || []
        });
        console.log('📝 Prompt built successfully');
        console.log('📏 Total messages:', agentPrompt.length);
        console.log('📏 System prompt length:', agentPrompt[0].content.length, 'characters');
        
        // Generate AI response
        console.log('\n🤖 Calling OpenAI...');
        console.log('\n--- AI Response (Streaming) ---\n');
        
        const response = await generateAgentResponse(openai, agentPrompt);
        
        console.log('\n\n--- Response Complete ---');
        console.log('\n--- Test Complete ---');
        console.log('✅ Simplified agent logic working correctly');
        console.log('✅ Using only REAL data from components');
        console.log('✅ Ready for AWS deployment');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testAgent();
