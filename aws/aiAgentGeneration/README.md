# OATutor AI Agent

An intelligent chatbot agent that provides TA-like assistance to students working on OATutor math problems.

## Features

- **Context-Aware**: Knows which problem the student is working on
- **Personalized**: Adapts to student's skill level and learning patterns
- **Socratic Method**: Guides students to discover answers through questions
- **Conversation Memory**: Remembers previous interactions in the session
- **Real-time Streaming**: Provides responses as they're generated

## Architecture

```
Frontend Chat UI → Agent Helper → AWS Lambda Agent → OpenAI GPT-4.1
                      ↓                    ↓
                 Rich Context        DynamoDB Storage
                 Data Collection     Conversation History
```

## Local Development

### Prerequisites

1. **OpenAI API Key**: Get from Professor Pardos (GPT-5 access)
2. **Node.js**: Version 20+ 
3. **AWS Credentials**: For DynamoDB access (optional for local testing)

### Setup

1. **Install dependencies**:
   ```bash
   cd aws/aiAgentGeneration
   npm install
   ```

2. **Set environment variables**:
   ```bash
   export OPENAI_API_KEY="your-openai-key"
   export CONVERSATION_TABLE_NAME="agent-conversations"
   ```

3. **Test locally**:
   ```bash
   node test-clean.mjs
   ```

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4.1/GPT-5 access
- `CONVERSATION_TABLE_NAME`: DynamoDB table for storing conversations (default: "agent-conversations")
- `NODE_ENV`: Environment (development/production)

## API Usage

### Request Format

```javascript
{
  "sessionId": "unique-session-id",
  "userMessage": "I don't understand how to set up the equation",
  "problemContext": {
    "problemID": "a01e792probsolve1",
    "lessonID": "5pH5Clb8-w1p3-vwGhVvzSof",
    "courseName": "OpenStax: Elementary Algebra",
    "problemTitle": "Solve Number Problems",
    "problemBody": "Find three consecutive integers whose sum is 24",
    "currentStep": {
      "id": "a01e792probsolve1a",
      "title": "Set up the equation",
      "body": "What equation represents the sum of three consecutive integers?",
      "answerType": "expression",
      "correctAnswer": "x + (x+1) + (x+2) = 24"
    },
    "variables": { "n": 8, "sum": 24 },
    "seed": "1703123456789"
  },
  "studentState": {
    "currentAnswer": "x + x + x = 24",
    "isCorrect": false,
    "attemptCount": 2,
    "hintsUsed": ["hint1"],
    "timeOnStep": 45,
    "skillMastery": {
      "linear_equations": 0.73,
      "consecutive_integers": 0.45,
      "algebraic_expressions": 0.82
    },
    "user": {
      "user_id": "student123",
      "full_name": "John Doe",
      "course_name": "Math 101"
    }
  },
  "conversationHistory": [],
  "agentConfig": {
    "teachingStyle": "socratic",
    "personalityMode": "encouraging",
    "maxHintLevel": 4
  }
}
```

### Response Format

The agent streams responses in real-time:

```javascript
// Content chunks
{"type": "content", "content": "I see you're working on consecutive integers...", "timestamp": 1703123456789}

// Completion signal
{"type": "complete", "fullResponse": "Complete response text", "timestamp": 1703123456789}
```

## Teaching Approach

The agent uses several teaching strategies:

1. **Socratic Method**: Asks guiding questions to help students discover answers
2. **Scaffolding**: Breaks complex problems into manageable steps
3. **Personalization**: Adapts to individual student skill levels
4. **Encouragement**: Provides positive reinforcement and motivation
5. **Misconception Detection**: Identifies and addresses common student errors

## Integration with OATutor

The agent integrates with the existing OATutor system by:

1. **Receiving rich context** from the frontend about the current problem
2. **Accessing student mastery data** from the BKT system
3. **Storing conversation history** in DynamoDB for session continuity
4. **Providing streaming responses** for real-time chat experience

## Deployment

### AWS Lambda Deployment

1. **Package the function**:
   ```bash
   zip -r aiAgentGeneration.zip . -x "*.git*" "node_modules/.cache/*"
   ```

2. **Deploy to AWS Lambda**:
   - Create new Lambda function
   - Upload the zip file
   - Set environment variables
   - Configure API Gateway trigger

### DynamoDB Setup

Create a table named `agent-conversations` with:
- **Partition Key**: `sessionId` (String)
- **TTL**: `ttl` (Number)
- **Attributes**: `messages` (List), `lastUpdated` (Number)

## Future Enhancements

- **GPT-5 Integration**: Upgrade to GPT-5 when available
- **Advanced Analytics**: Track learning effectiveness
- **Multi-modal Support**: Handle images and diagrams
- **Voice Integration**: Support voice interactions
- **Adaptive Learning**: Improve based on student outcomes

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**: Check API key and rate limits
2. **DynamoDB Errors**: Verify table exists and permissions
3. **Streaming Issues**: Check response format and headers
4. **Context Errors**: Ensure all required data is provided

### Debug Mode

Enable detailed logging by setting:
```bash
export DEBUG=agent:*
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test locally before deploying

## License

ISC - See main OATutor repository for details.
