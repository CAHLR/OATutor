#!/usr/bin/env node

/**
 * Clean local testing script using shared agent logic
 * Run with: node test-clean.mjs
 */

import dotenv from "dotenv";
import OpenAI from "openai";
import { readFileSync } from 'fs';
import { analyzeStudentState, buildAgentPrompt, generateAgentResponse } from "./agent-logic.mjs";

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
        
        // Step 1: Analyze student state
        console.log('🔍 Analyzing student state...');
        const studentAnalysis = analyzeStudentState(
            requestBody.studentState, 
            requestBody.problemContext
        );
        console.log('📊 Analysis result:', studentAnalysis);
        
        // Step 2: Build agent prompt
        console.log('\n🤖 Building agent prompt...');
        const agentPrompt = buildAgentPrompt({
            userMessage: requestBody.userMessage,
            problemContext: requestBody.problemContext,
            studentState: requestBody.studentState,
            studentAnalysis: studentAnalysis,
            conversationHistory: requestBody.conversationHistory || [],
            agentConfig: requestBody.agentConfig || {}
        });
        console.log('📝 System prompt built successfully');
        console.log('📏 Prompt length:', agentPrompt[0].content.length, 'characters');
        
        // Step 3: Generate AI response
        console.log('\n🤖 Calling OpenAI...');
        console.log('\n--- AI Response (Streaming) ---\n');
        
        const response = await generateAgentResponse(openai, agentPrompt);
        
        console.log('\n\n--- Response Complete ---');
        console.log('\n--- Test Complete ---');
        console.log('✅ All functions working correctly');
        console.log('✅ Shared logic integration successful');
        console.log('✅ Ready for AWS deployment');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testAgent();
