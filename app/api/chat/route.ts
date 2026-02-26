import { NextRequest, NextResponse } from 'next/server'
import { ragEngine } from '@/lib/rag-engine'
import { generateLLMResponse } from '@/lib/llm-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, classFilter, subjectFilter, difficulty } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message provided' },
        { status: 400 }
      )
    }

    // Process with RAG engine
    const ragResult = ragEngine.processQuery(
      message,
      typeof classFilter === 'number' ? classFilter : undefined,
      typeof subjectFilter === 'string' && subjectFilter.trim() !== '' ? subjectFilter : undefined
    )

    // Generate LLM response
    const llmResponse = await generateLLMResponse(
      difficulty
        ? `${message}\n\nRespond in ${difficulty} level for NCERT student understanding.`
        : message,
      ragResult.context
    )

    return NextResponse.json({
      response: llmResponse.content,
      sources: ragResult.sources.map(source => ({
        id: source.id,
        title: source.title,
        class: source.class,
        subject: source.subject,
        keyPoints: source.keyPoints,
      })),
      context: ragResult.context,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API] Chat error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chat API is running',
    endpoints: {
      POST: '/api/chat - Send a message for processing',
    },
  })
}
