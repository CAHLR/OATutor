# AI Agent Setup Guide

## Backend (AWS Lambda)

### 1. Install Dependencies
```bash
cd aws/aiAgentGeneration
npm install
```

### 2. Deploy to AWS Lambda

#### Option A: Manual Deployment via AWS Console
1. Package the code:
   ```bash
   zip -r function.zip . -x "*.git*" "test-*" "*.md"
   ```

2. Go to AWS Lambda Console → Create Function
   - Name: `oatutor-ai-agent`
   - Runtime: Node.js 20.x
   - Handler: `index.handler`

3. Upload `function.zip`

4. Configure Function URL:
   - Auth type: NONE
   - **Invoke mode: RESPONSE_STREAM** ⚠️ (Required!)
   - CORS: Enable with `*` origin

5. Set Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CONVERSATION_TABLE_NAME`: `agent-conversations`

6. Configure Memory & Timeout:
   - Memory: 512 MB minimum
   - Timeout: 60 seconds

7. Copy your Function URL (looks like `https://xxx.lambda-url.us-west-1.on.aws/`)

#### Option B: AWS CLI Deployment
```bash
# Create deployment package
npm install --production
zip -r function.zip .

# Create function (first time)
aws lambda create-function \
  --function-name oatutor-ai-agent \
  --runtime nodejs20.x \
  --role YOUR_LAMBDA_EXECUTION_ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --memory-size 512 \
  --timeout 60

# Update function (subsequent deploys)
aws lambda update-function-code \
  --function-name oatutor-ai-agent \
  --zip-file fileb://function.zip
```

### 3. Create DynamoDB Table (Optional but Recommended)
```bash
aws dynamodb create-table \
  --table-name agent-conversations \
  --attribute-definitions AttributeName=sessionId,AttributeType=S \
  --key-schema AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

Enable TTL:
```bash
aws dynamodb update-time-to-live \
  --table-name agent-conversations \
  --time-to-live-specification Enabled=true,AttributeName=ttl
```

---

## Frontend (React)

### 1. Configure Environment Variable

Create a `.env` file in the **project root** (not in this directory):

```bash
# /Users/gilbertharijanto/Developer/OATutor/.env

REACT_APP_AI_AGENT_URL=https://YOUR-FUNCTION-URL-HERE.lambda-url.us-west-1.on.aws/
```

**Example:**
```
REACT_APP_AI_AGENT_URL=https://abcd1234xyz.lambda-url.us-west-1.on.aws/
```

### 2. Restart Development Server
```bash
# Kill current server (Ctrl+C)
# Restart
npm start
```

The `.env` file is only read when the dev server starts, so you must restart after creating/modifying it.

---

## Testing

### Local Backend Testing (Without Lambda)
```bash
cd aws/aiAgentGeneration
export OPENAI_API_KEY="your-key-here"
node test-clean.mjs
```

### Frontend Testing
1. Open OATutor in browser
2. Navigate to any problem
3. Get a question wrong (important for testing active step detection)
4. Click the chat icon (bottom-right floating button)
5. Type a message like "help" or "why is my answer wrong?"
6. Check browser console for debug logs starting with `🤖`

### Debug Checklist
- [ ] Lambda Function URL configured in `.env`
- [ ] Lambda has `RESPONSE_STREAM` invoke mode enabled
- [ ] OpenAI API key set in Lambda environment variables
- [ ] Browser console shows `🤖 AgentHelper initialized`
- [ ] Browser console shows Function URL (not "⚠️ NOT SET")
- [ ] Chat icon appears in bottom-right corner
- [ ] Clicking icon opens chat window
- [ ] Sending message shows "Thinking..." indicator

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React)                          │
│                                                                   │
│  Problem.js ──→ AgentIntegration ──→ AgentChatbox ──→ AgentHelper│
│     ↓                                      ↓                      │
│  Context:                              Sends:                     │
│  - problem data                        - userMessage              │
│  - lesson info                         - problemContext           │
│  - stepStates                          - studentState             │
│  - BKT params                                                     │
│  - seed                                                           │
└───────────────────────────────────────┬─────────────────────────┘
                                        │
                                        │ HTTPS POST (streaming)
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Lambda (Node.js 20.x)                     │
│                                                                   │
│  index.mjs ──→ agent-logic.mjs ──→ OpenAI GPT-4                 │
│     ↓               ↓                    ↓                        │
│  Parses         Builds             Generates                     │
│  request        prompt             response                      │
│     ↓               ↓                    ↓                        │
│  DynamoDB ←────────────────────────── Streams                    │
│  (conversation                        back to                    │
│   history)                            browser                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Error: "AI Agent endpoint not configured"
**Solution**: Create `.env` file in project root with `REACT_APP_AI_AGENT_URL` and restart dev server.

### Error: "HTTP 403: Forbidden"
**Solution**: Check Lambda Function URL settings. Auth type should be "NONE" for public access.

### Error: Response not streaming
**Solution**: Lambda Function URL must have invoke mode set to **RESPONSE_STREAM**, not BUFFERED.

### Error: "Module not found" in Lambda
**Solution**: Run `npm install --production` before zipping and deploying.

### Chat opens but no response
**Solutions**:
1. Check Lambda CloudWatch logs for errors
2. Verify `OPENAI_API_KEY` environment variable is set in Lambda
3. Check browser console for network errors
4. Verify Lambda has correct CORS headers

### Wrong step context sent to agent
**Solutions**:
1. Check browser console for `🔍 [getActiveStepData]` logs
2. Verify `stepStates` is correctly tracking correct/incorrect answers
3. Ensure `getActiveStepData()` logic is finding the right step

---

## Files Overview

### Backend (aws/aiAgentGeneration/)
- `index.mjs` - Lambda handler, streaming setup, DynamoDB integration
- `agent-logic.mjs` - Prompt building, OpenAI API calls
- `test-clean.mjs` - Local testing script
- `test-event.json` - Sample request for testing
- `package.json` - Dependencies (openai, aws-sdk, dotenv)

### Frontend (src/components/problem-layout/)
- `AgentHelper.js` - API communication manager
- `AgentChatbox.js` - Chat UI component
- `AgentIntegration.js` - Wrapper to extract Problem.js context
- `Problem.js` - Modified to include AgentIntegration

---

## Environment Variables Summary

### Lambda (AWS Console → Configuration → Environment variables)
| Variable | Value | Required |
|----------|-------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |
| `CONVERSATION_TABLE_NAME` | `agent-conversations` | Optional |
| `NODE_ENV` | `production` | Optional |

### Frontend (.env in project root)
| Variable | Value | Required |
|----------|-------|----------|
| `REACT_APP_AI_AGENT_URL` | Lambda Function URL | ✅ Yes |

---

## Next Steps

1. ✅ Deploy backend to AWS Lambda
2. ✅ Get Function URL from Lambda console
3. ✅ Create `.env` file with Function URL
4. ✅ Restart React dev server
5. ✅ Test in browser
6. 🎉 Start tutoring students!

