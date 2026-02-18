# ShikshaSahayak - Configuration Guide

This guide helps you configure ShikshaSahayak for advanced use cases.

## Default Configuration

By default, ShikshaSahayak operates in **offline mode** with:
- ✅ Offline RAG system
- ✅ Heuristic-based responses
- ✅ No external API calls
- ✅ Zero latency
- ✅ No API keys needed

This is perfect for learning and basic use.

## Optional: Configure LLM API

To use a real LLM provider (OpenAI, Anthropic, etc.), follow these steps:

### Step 1: Choose Your LLM Provider

#### Option A: OpenAI (GPT-4, GPT-3.5-turbo)

```bash
# Get API key from https://platform.openai.com/api-keys
# Set environment variable
export OPENAI_API_KEY="sk-..."
```

#### Option B: Anthropic (Claude)

```bash
# Get API key from https://console.anthropic.com/
# Set environment variable
export ANTHROPIC_API_KEY="sk-ant-..."
```

#### Option C: Groq (Fast Inference)

```bash
# Get API key from https://console.groq.com/
# Set environment variable
export GROQ_API_KEY="gsk-..."
```

### Step 2: Modify LLM Handler

Edit `lib/llm-handler.ts` and replace the `callLLMAPI` function:

#### For OpenAI:

```typescript
async function callLLMAPI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are ShikshaSahayak, an expert educational tutor for NCERT curriculum. Provide clear, student-friendly explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
```

#### For Anthropic (Claude):

```typescript
async function callLLMAPI(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus',
      max_tokens: 1024,
      system: 'You are ShikshaSahayak, an expert educational tutor for NCERT curriculum. Provide clear, student-friendly explanations.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}
```

#### For Groq:

```typescript
async function callLLMAPI(prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: 'You are ShikshaSahayak, an expert educational tutor for NCERT curriculum. Provide clear, student-friendly explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
```

### Step 3: Set Environment Variables

#### For Development:

Create `.env.local`:
```env
# For OpenAI
OPENAI_API_KEY=sk-...

# For Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# For Groq
GROQ_API_KEY=gsk-...
```

#### For Production (Vercel):

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add your API key:
   - Variable: `OPENAI_API_KEY` (or your provider)
   - Value: Your API key
   - Environment: Select Production
4. Redeploy your application

### Step 4: Test Configuration

1. Start your development server: `pnpm dev`
2. Open the chat interface
3. Ask a question
4. If LLM is configured, you should get API responses
5. If API fails, it falls back to heuristic mode

## Adding Custom Curriculum

### Add Topics to Curriculum

Edit `lib/curriculum.ts`:

```typescript
{
  id: 'unique-topic-id',
  title: 'Your Topic Title',
  class: 10,
  subject: 'Your Subject',
  content: `Your detailed educational content here...
  
  Include:
  - Definitions
  - Explanations
  - Examples
  - Key concepts`,
  keyPoints: [
    'Key point 1',
    'Key point 2',
    'Key point 3',
    'Key point 4'
  ]
}
```

### Example: Adding a Physics Topic

```typescript
{
  id: 'ncert-class11-physics-momentum',
  title: 'Conservation of Momentum',
  class: 11,
  subject: 'Physics',
  content: `Momentum is a fundamental concept in physics representing the quantity of motion.
  
  Definition:
  Momentum (p) = mass (m) × velocity (v)
  p = mv
  
  The law of conservation of momentum states that the total momentum of an isolated system remains constant.
  
  Mathematical Expression:
  Initial Momentum = Final Momentum
  m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂
  
  Applications:
  - Collisions between objects
  - Rocket propulsion
  - Gun recoil
  - Explosions`,
  keyPoints: [
    'Momentum is the product of mass and velocity',
    'Momentum has both magnitude and direction (it\'s a vector)',
    'Conservation of momentum applies to isolated systems',
    'Momentum is conserved in both elastic and inelastic collisions',
    'Total momentum before = Total momentum after'
  ]
}
```

## Performance Tuning

### RAG System Optimization

Edit `lib/rag-engine.ts`:

```typescript
// Adjust number of retrieved documents
retrieveRelevantDocuments(query: string, limit: number = 5) { // Increased from 3
  // ... rest of code
}

// Adjust relevance score weights
private calculateRelevance(query: string, topic: NCERTTopic): number {
  let score = 0
  
  // Increase weights for better matching
  if (topic.title.toLowerCase() === queryLower) {
    score += 150 // Increased from 100
  } else if (topic.title.toLowerCase().includes(queryLower)) {
    score += 75 // Increased from 50
  }
  
  // ... rest of code
}
```

### Customize Response Behavior

Edit `lib/llm-handler.ts`:

```typescript
// Add more predefined responses for common topics
const responses: Record<string, string> = {
  'your topic': `Your custom response...`,
  // Add more as needed
}

// Adjust fallback response generation
function generateMockResponse(userQuery: string, context: string): string {
  // Customize the logic here
}
```

## Content Management

### Best Practices for Adding Content

1. **Use Clear Language**: Write for students, not experts
2. **Include Examples**: Real-world applications help understanding
3. **Break It Down**: Divide complex topics into smaller concepts
4. **Use Formatting**: Use bullet points, numbered lists, bold for emphasis
5. **Cross-Reference**: Link to related topics
6. **Verify Information**: Ensure content matches NCERT curriculum

### Content Structure Template

```typescript
{
  id: 'ncert-class-grade-subject-topic',
  title: 'Topic Name',
  class: 10,
  subject: 'Subject Name',
  content: `
  DEFINITION:
  [Clear, simple definition]
  
  FORMULA/CONCEPT:
  [Mathematical or conceptual representation]
  
  EXPLANATION:
  [Detailed explanation]
  
  EXAMPLES:
  [Real-world or problem examples]
  
  APPLICATIONS:
  [How it's used]
  
  IMPORTANT NOTES:
  [Key things to remember]
  `,
  keyPoints: [
    'Point 1',
    'Point 2',
    'Point 3',
    'Point 4',
    'Point 5'
  ]
}
```

## Troubleshooting

### API Connection Issues

**Problem**: Getting "API not configured" error

**Solution**:
1. Check environment variable is set: `echo $OPENAI_API_KEY`
2. Verify API key is correct
3. Check API key has permission/quota
4. Ensure fallback mode works (it should)

### Poor Response Quality

**Problem**: Responses are not relevant or helpful

**Solution**:
1. Improve your question phrasing
2. Add more curriculum content
3. Adjust RAG relevance weights
4. Customize mock responses
5. Try different LLM model

### Performance Issues

**Problem**: Slow responses or timeouts

**Solution**:
1. Reduce number of retrieved documents
2. Use faster LLM model
3. Increase timeout duration
4. Use local/fallback mode
5. Check API rate limits

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use environment variables** for secrets
3. **Regenerate keys** if exposed
4. **Monitor API usage** for unusual activity
5. **Use rate limiting** in production
6. **Validate all inputs** on server
7. **Sanitize outputs** before display
8. **Keep dependencies updated**

## Deployment Configuration

### On Vercel

1. Connect your GitHub repository
2. Go to project settings
3. Add environment variables for your API keys
4. Redeploy the project

### On Other Platforms

1. Set environment variables via platform UI or CLI
2. Deploy the application
3. Test API connectivity
4. Monitor logs for errors

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

EXPOSE 3000

CMD ["npm", "start"]
```

## Testing Configuration

Test your configuration with curl:

```bash
# Test chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are quadratic equations?"}'

# Expected response:
# {
#   "response": "...",
#   "sources": [...],
#   "timestamp": "..."
# }
```

## Advanced Customization

### Custom RAG Strategy

Replace the relevance calculation in `lib/rag-engine.ts`:

```typescript
private calculateRelevance(query: string, topic: NCERTTopic): number {
  // Implement your custom relevance algorithm
  // Use ML, semantic similarity, etc.
}
```

### Custom Response Generation

Modify prompt in `lib/rag-engine.ts`:

```typescript
generatePrompt(userQuery: string, documents: NCERTTopic[]): string {
  // Customize the system prompt for different use cases
}
```

### Multi-Language Support

Add language detection and translation:

```typescript
// Detect language of input
// Translate context to appropriate language
// Generate response in user's language
```

## Monitoring & Analytics

### Log API Usage

```typescript
// Add to llm-handler.ts
console.log('[LLM]', {
  query: userQuery,
  model: 'gpt-4',
  tokensUsed: response.usage.total_tokens,
  timestamp: new Date().toISOString()
})
```

### Track Performance

```typescript
// Measure response time
const startTime = Date.now()
const response = await generateLLMResponse(userQuery, context)
const duration = Date.now() - startTime
console.log(`Response time: ${duration}ms`)
```

## Getting Help

- Check the [README.md](./README.md) for general information
- See [QUICKSTART.md](./QUICKSTART.md) for usage examples
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture details
- Check [VALIDATION_CHECKLIST.md](./VALIDATION_CHECKLIST.md) for completeness

---

**Happy configuring!** 🚀
