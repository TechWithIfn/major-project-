'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Mic, MicOff } from 'lucide-react'
import { useVoiceInput } from '@/hooks/use-voice-input'

interface ChatInputAreaProps {
  onSend: (message: string) => Promise<void>
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInputArea({
  onSend,
  isLoading,
  disabled = false,
  placeholder = 'Ask any NCERT question (Class 6–12)…',
}: ChatInputAreaProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleVoiceResult = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text))
  }
  const { isListening, error: voiceError, startListening } = useVoiceInput(handleVoiceResult)

  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = input.trim()
    if (!msg || isLoading || disabled) return
    setInput('')
    await onSend(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="safe-bottom border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-3">
        {voiceError && (
          <p className="text-xs text-destructive mb-2" role="alert">
            {voiceError}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 h-11 w-11 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0"
            onClick={startListening}
            disabled={isLoading || disabled || isListening}
            aria-label="Voice input (speak your question)"
            title="Voice input"
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-destructive" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            className="min-h-[2.5rem] max-h-32 resize-none flex-1"
            rows={1}
            aria-label="Message"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            size="icon"
            className="shrink-0 h-11 w-11 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
