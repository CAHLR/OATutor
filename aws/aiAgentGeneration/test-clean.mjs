"use strict";

import dotenv from "dotenv";
import OpenAI from "openai";
import { analyzeStudentState, buildAgentPrompt, generateAgentResponse } from "./agent-logic.mjs";

// Load environment variables from .env file
dotenv.config();

console.log("🧪 AI Agent Local Test Started");
console.log("================================\n");

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Test data
const testData = {
    sessionId: "test-session-123",
    userMessage: "I don't understand how to set up the equation for this problem",
    problemContext: {
        problemID: "a01e792probsolve1",
        lessonID: "5pH5Clb8-w1p3-vwGhVzSof",
        courseName: "OpenStax: Elementary Algebra",
        problemTitle: "Solve Number Problems",
        problemBody: "Find three consecutive integers whose sum is 24",
        currentStep: {
            id: "a01e792probsolve1a",
            title: "Set up the equation",
            body: "What equation represents the sum of three consecutive integers?",
            answerType: "expression",
            problemType: "word_problem",
            correctAnswer: "x + (x+1) + (x+2) = 24",
            precision: 0.01,
            knowledgeComponents: ["consecutive_integers", "linear_equations"]
        },
        variables: {
            n: 8,
            sum: 24
        },
        seed: "1703123456789"
    },
    studentState: {
        currentAnswer: "x + x + x = 24",
        isCorrect: false,
        attemptCount: 2,
        hintsUsed: ["hint1"],
        timeOnStep: 45,
        stepsCompleted: ["step1"],
        problemsCompleted: ["prob1"],
        skillMastery: {
            consecutive_integers: 0.45,
            linear_equations: 0.73,
            algebraic_expressions: 0.82
        },
        user: {
            user_id: "student123",
            full_name: "John Doe",
            course_name: "Math 101",
            course_id: "course456"
        }
    },
    agentConfig: {
        teachingStyle: "socratic",
        personalityMode: "encouraging",
        maxHintLevel: 4,
        model: "gpt-4"
    }
};

async function runTest() {
    try {
        console.log("📊 Test Data:");
        console.log(`   User: ${testData.studentState.user.full_name}`);
        console.log(`   Problem: ${testData.problemContext.problemTitle}`);
        console.log(`   Current Answer: ${testData.studentState.currentAnswer}`);
        console.log(`   Is Correct: ${testData.studentState.isCorrect}`);
        console.log(`   Attempts: ${testData.studentState.attemptCount}`);
        console.log(`   Hints Used: ${testData.studentState.hintsUsed.length}`);
        console.log(`   Time on Step: ${testData.studentState.timeOnStep}s`);
        console.log(`   Skill Mastery: ${JSON.stringify(testData.studentState.skillMastery, null, 2)}`);
        console.log("\n" + "=".repeat(50) + "\n");

        // Analyze student state
        console.log("🔍 Analyzing student state...");
        const studentAnalysis = analyzeStudentState(testData.studentState, testData.problemContext);
        console.log("✅ Student analysis complete");
        console.log(`   Struggling With: ${studentAnalysis.strugglingWith.join(", ")}`);
        console.log(`   Common Mistakes: ${studentAnalysis.commonMistakes.join(", ")}`);
        console.log(`   Suggested Approach: ${studentAnalysis.suggestedApproach}`);
        console.log(`   Confidence Level: ${studentAnalysis.confidenceLevel}`);
        console.log("\n" + "=".repeat(50) + "\n");

        // Build agent prompt
        console.log("📝 Building agent prompt...");
        const agentPrompt = buildAgentPrompt({
            userMessage: testData.userMessage,
            problemContext: testData.problemContext,
            studentState: testData.studentState,
            studentAnalysis: studentAnalysis,
            conversationHistory: [],
            agentConfig: testData.agentConfig
        });
        console.log("✅ Agent prompt built");
        console.log(`   System prompt length: ${agentPrompt[0].content.length} characters`);
        console.log(`   User message length: ${agentPrompt[1].content.length} characters`);
        console.log(`   Total messages: ${agentPrompt.length}`);
        console.log("\n" + "=".repeat(50) + "\n");

        // Generate response
        console.log("🤖 Calling OpenAI...");
        const startTime = Date.now();
        
        // Create a mock response stream for testing
        let fullResponse = "";
        const mockStream = {
            write: (data) => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === "content") {
                        fullResponse += parsed.content;
                        process.stdout.write(parsed.content);
                    }
                } catch (e) {
                    // Ignore parsing errors for test
                }
            },
            end: () => {
                console.log("\n\n" + "=".repeat(50));
                console.log("✅ Response generation complete");
                console.log(`   Total time: ${Date.now() - startTime}ms`);
                console.log(`   Response length: ${fullResponse.length} characters`);
                console.log("\n🎉 Test completed successfully!");
            }
        };

        await generateAgentResponse(openai, agentPrompt, mockStream);

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
}

// Run the test
runTest();
