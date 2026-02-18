'use client'

import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Message } from '@/lib/curriculum'
import { ChatTopBar } from '@/components/chat-top-bar'
import { ChatInputArea } from '@/components/chat-input-area'
import { AssistantAnswerBubble } from '@/components/assistant-answer-bubble'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ragEngine } from '@/lib/rag-engine'
import { generateLLMResponse } from '@/lib/llm-handler'
import { Loader2, MessageSquare, History, Trash2 } from 'lucide-react'

const GREETING_MESSAGE: Message = {
  id: '',
  role: 'assistant',
  content:
    "Hello! I'm ShikshaSahayak, your NCERT tutor for Classes 6–12. Select your class and subject above, then ask any question. I'll give you one clear answer per chapter with explanation, examples, and key points.",
  timestamp: new Date(),
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

interface ChatContainerProps {
  initialClass?: number
  initialSubject?: string
  onBack?: () => void
}

export function ChatContainer({ initialClass, initialSubject, onBack }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { ...GREETING_MESSAGE, id: uuidv4() },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState<number | null>(initialClass ?? null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject ?? null)
  const [difficulty, setDifficulty] = useState<'easy' | 'standard' | 'exam'>('standard')
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [recentOpen, setRecentOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (userInput: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const classFilter = selectedClass ?? undefined
      const subjectFilter = selectedSubject ?? undefined
      const ragResult = ragEngine.processQuery(userInput, classFilter, subjectFilter)
      const llmResponse = await generateLLMResponse(userInput, ragResult.context)

      const firstSource = ragResult.sources[0]
      const title =
        firstSource != null
          ? `${firstSource.title} – Class ${firstSource.class} – ${firstSource.subject}`
          : undefined

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: llmResponse.content,
        timestamp: new Date(),
        title,
        sources: ragResult.sources.map((s) => s.title),
        keyPoints: [...new Set(ragResult.sources.flatMap((s) => s.keyPoints))],
        examples: [],
      }
      const updatedMessages = [...messages, userMessage, assistantMessage]
      setMessages((prev) => [...prev, assistantMessage])
      saveChatSession(updatedMessages)
    } catch (err) {
      console.error(err)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    handleSendMessage(action)
  }

  function saveChatSession(messagesToSave: Message[]) {
    const firstUser = messagesToSave.find((m) => m.role === 'user')
    if (!firstUser) return
    const title =
      firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? '…' : '')
    const timestamp = new Date()
    if (currentSessionId) {
      setChatSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, title, messages: messagesToSave, timestamp }
            : s
        )
        const current = updated.find((s) => s.id === currentSessionId)
        if (!current) return prev
        const rest = updated.filter((s) => s.id !== currentSessionId)
        return [current, ...rest].slice(0, 10)
      })
    } else {
      const newSession: ChatSession = {
        id: uuidv4(),
        title,
        messages: messagesToSave,
        timestamp,
      }
      setCurrentSessionId(newSession.id)
      setChatSessions((prev) => [newSession, ...prev].slice(0, 10))
    }
  }

  function loadChatSession(session: ChatSession) {
    setMessages(session.messages)
    setCurrentSessionId(session.id)
    setRecentOpen(false)
  }

  function deleteChatSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
      setMessages([{ ...GREETING_MESSAGE, id: uuidv4() }])
    }
  }

  function handleClearChat() {
    setCurrentSessionId(null)
    setMessages([{ ...GREETING_MESSAGE, id: uuidv4() }])
    setRecentOpen(false)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatTopBar
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        onClassChange={setSelectedClass}
        onSubjectChange={setSelectedSubject}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onBack={onBack}
        extraActions={
          <Sheet open={recentOpen} onOpenChange={setRecentOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Recent chats"
                title="Recent chats"
              >
                <History className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(20rem,100vw)] flex flex-col p-0">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Chats
                </SheetTitle>
              </SheetHeader>
              <Button
                variant="default"
                size="sm"
                className="m-4 gap-2"
                onClick={handleClearChat}
              >
                <MessageSquare className="h-4 w-4" />
                New Chat
              </Button>
              <ScrollArea className="flex-1 px-4 pb-4">
                {chatSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No recent chats. Start a conversation to see it here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => loadChatSession(session)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            loadChatSession(session)
                          }
                        }}
                        className={`group relative flex flex-col gap-1 rounded-lg border p-3 pr-9 text-left transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring ${
                          currentSessionId === session.id ? 'border-primary bg-muted/50' : 'border-border'
                        }`}
                      >
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          onClick={(e) => deleteChatSession(session.id, e)}
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>
        }
      />

      <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden" tabIndex={-1} aria-label="Chat messages">
        <div className="mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <div key={msg.id} className="flex justify-end w-full max-w-3xl ml-auto">
                <Card className="max-w-[90%] sm:max-w-[85%] p-3 bg-primary text-primary-foreground border-0 break-words">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </Card>
              </div>
            ) : (
              <AssistantAnswerBubble
                key={msg.id}
                message={msg}
                onQuickAction={handleQuickAction}
              />
            )
          )}
          {isLoading && (
            <div className="flex justify-start w-full max-w-3xl">
              <Card className="p-4 bg-muted/40 border-border/80">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking…</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInputArea
        onSend={handleSendMessage}
        isLoading={isLoading}
        placeholder="Ask any NCERT question (Class 6–12)…"
      />
    </div>
  )
}
