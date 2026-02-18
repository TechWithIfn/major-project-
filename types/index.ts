/**
 * Global type definitions for ShikshaSahayak
 */

export interface NCERTTopic {
  id: string
  title: string
  class: number
  subject: string
  content: string
  keyPoints: string[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  /** Key points from retrieved NCERT curriculum (assistant messages) */
  keyPoints?: string[]
  /** Whether the message has been seen (e.g. read receipt) */
  seen?: boolean
}

export interface ChatSession {
  id: string
  title: string
  class: number
  subject: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface RAGResult {
  answer: string
  sources: NCERTTopic[]
  confidence: number
  context: string
  prompt: string
}

export interface LLMResponse {
  content: string
  model: string
  mode: 'api' | 'fallback'
  tokensUsed?: number
}

export interface ChatAPIRequest {
  message: string
  context?: string
}

export interface ChatAPIResponse {
  response: string
  sources: Array<{
    id: string
    title: string
    class: number
    subject: string
  }>
  context: string
  timestamp: string
}
