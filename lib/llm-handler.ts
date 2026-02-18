/**
 * LLM Handler with fallback strategy
 * Attempts to use OpenAI API, falls back to mock responses for demo
 */

export interface LLMResponse {
  content: string
  model: string
  mode: 'api' | 'fallback'
  tokensUsed?: number
}

/**
 * Fallback response generator: 100% context-driven.
 * Answers only from the retrieved NCERT context so all subjects work correctly
 * without hardcoded keywords. Aligns with RAG pipeline: "retrieve then generate".
 */
function generateMockResponse(userQuery: string, context: string): string {
  const noContentMessage =
    'No relevant educational content found in curriculum database.'

  if (!context || context.trim() === '' || context.includes(noContentMessage)) {
    return (
      "I don't have that topic in my current NCERT curriculum. " +
      "Please try a question from your textbook chapters (e.g. Quadratic Equations, Photosynthesis, French Revolution, Climate, Poetry, or Transport in Plants). " +
      "You can also rephrase your question or ask about one of the subjects we cover: Mathematics, Biology, English, History, Geography, Physics, Chemistry."
    )
  }

  // Parse context: each document is "Document N: Title --- content --- Key Points: ... ---"
  const docBlocks = context.split(/\n---/).filter((b) => b.trim().length > 0)
  const queryLower = userQuery.toLowerCase()
  const queryWords = queryLower
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter((w) => !/^(what|how|why|the|and|for|are|is|does|can|role|explain|define|tell|me|about)$/.test(w))

  const relevantParts: string[] = []

  const pickLines = (block: string, maxLines: number): string => {
    return block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 15 && !/^Document \d+:/.test(l) && !/^Key Points:?\s*$/i.test(l))
      .slice(0, maxLines)
      .join('\n')
  }

  for (const block of docBlocks) {
    const blockLower = block.toLowerCase()
    const hasQueryWord = queryWords.length === 0 || queryWords.some((w) => blockLower.includes(w))
    const hasPhrase = queryWords.length > 0 && queryLower.length > 5 && blockLower.includes(queryLower)
    if (hasQueryWord || hasPhrase) {
      const text = pickLines(block, 14)
      if (text.length > 30) relevantParts.push(text)
    }
  }

  if (relevantParts.length === 0 && docBlocks.length > 0) {
    for (const block of docBlocks.slice(0, 2)) {
      const text = pickLines(block, 10)
      if (text.length > 20) relevantParts.push(text)
    }
  }

  const usedContext =
    relevantParts.length > 0
      ? relevantParts.join('\n\n')
      : context.replace(/\n---/g, '\n').replace(/^Document \d+:.*$/gm, '').slice(0, 2000)

  return (
    'According to the NCERT curriculum:\n\n' +
    usedContext.trim() +
    '\n\nI hope that helps! You can ask a follow-up for more detail.'
  )
}

/**
 * Build the full prompt for the LLM (same structure as RAG engine) so API responses are context-aware.
 */
function buildPromptForAPI(userQuery: string, context: string): string {
  return `You are ShikshaSahayak, an expert educational tutor helping Indian students understand NCERT curriculum.

Educational Context:
${context}

Student Question: ${userQuery}

Guidelines for your response:
1. Answer based ONLY on the provided educational material. Never mix two subjects or two chapters in one answer.
2. Use simple, clear language appropriate for the student's class. Short paragraphs. NCERT-aligned. No bullet overload in the main explanation.
3. Break complex concepts into smaller parts. Use examples only when they are clearly labeled (e.g. "Example:").
4. If the question is not covered in provided content, acknowledge it politely and suggest selecting the correct class/subject.
5. Be encouraging and supportive. Do not hallucinate facts. Content must strictly follow NCERT syllabus.`
}

/**
 * Call the LLM API. Uses OpenAI when OPENAI_API_KEY is set; otherwise throws for fallback.
 */
async function callLLMAPI(userQuery: string, context: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey && apiKey.trim() !== '') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are ShikshaSahayak, an expert NCERT tutor. Answer based only on the educational context provided.' },
          { role: 'user', content: buildPromptForAPI(userQuery, context) },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI API error: ${response.status} ${err}`)
    }
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string') throw new Error('Invalid OpenAI response')
    return content
  }
  await new Promise(resolve => setTimeout(resolve, 300))
  throw new Error('API not configured (fallback mode)')
}

/**
 * Generate LLM response with fallback strategy
 */
export async function generateLLMResponse(
  userQuery: string, 
  context: string
): Promise<LLMResponse> {
  // Try API first when OPENAI_API_KEY is set
  try {
    const content = await callLLMAPI(userQuery, context)
    return {
      content,
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      mode: 'api',
      tokensUsed: Math.ceil(content.split(/\s+/).length * 1.3)
    }
  } catch {
    // Fallback to mock response
    const content = generateMockResponse(userQuery, context)
    return {
      content,
      model: 'fallback-heuristic',
      mode: 'fallback',
      tokensUsed: Math.ceil(content.split(/\s+/).length * 1.3)
    }
  }
}
