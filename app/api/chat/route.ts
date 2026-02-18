import { NextRequest, NextResponse } from 'next/server'
import { ragEngine } from '@/lib/rag-engine'
import { generateLLMResponse } from '@/lib/llm-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message provided' },
        { status: 400 }
      )
    }

    // Process with RAG engine
    const ragResult = ragEngine.processQuery(message)

    // Generate LLM response
    const llmResponse = await generateLLMResponse(message, ragResult.context)

    return NextResponse.json({
      response: llmResponse.content,
      sources: ragResult.sources.map(source => ({
        id: source.id,
        title: source.title,
        class: source.class,
        subject: source.subject,
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
