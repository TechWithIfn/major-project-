import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Mic, MicOff } from 'lucide-react'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { cn } from '@/lib/utils'

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
  placeholder = 'Ask any NCERT question...',
}: ChatInputAreaProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleVoiceResult = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text))
  }
  const { isListening, error: voiceError, startListening } = useVoiceInput(handleVoiceResult)

  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const msg = input.trim()
    if (!msg || isLoading || disabled) return
    setInput('')
    await onSend(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-border/50 bg-background/95 px-3 pb-4 pt-3 sm:px-4">
      <div className="mx-auto max-w-4xl">
        <div
          className={cn(
            "relative flex flex-col rounded-2xl border bg-card transition-all duration-200",
            isFocused ? "border-primary/40 ring-2 ring-primary/10" : "border-border/60",
            (isLoading || disabled) && "opacity-80"
          )}
        >
          {voiceError && (
            <div className="absolute -top-7 left-2 animate-in fade-in slide-in-from-bottom-2">
              <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-destructive">
                <span className="h-1 w-1 animate-pulse rounded-full bg-destructive" />
                {voiceError}
              </p>
            </div>
          )}

          <div className="flex items-end gap-2 p-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 rounded-xl transition-colors",
                isListening ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "hover:bg-muted/60"
              )}
              onClick={startListening}
              disabled={isLoading || disabled}
            >
              {isListening ? (
                <MicOff className="h-5 w-5 animate-pulse" />
              ) : (
                <Mic className={cn("h-5 w-5", isFocused ? "text-primary" : "text-muted-foreground")} />
              )}
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              className="min-h-[2.5rem] max-h-48 w-full resize-none border-0 bg-transparent py-2 text-sm leading-6 placeholder:text-muted-foreground/70 focus-visible:ring-0"
              rows={1}
            />

            <Button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading || disabled}
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 rounded-xl transition-all",
                input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-border/30 px-3 pb-2 pt-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Research Mode · NCERT</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Enter ↵ send · Shift+Enter newline</span>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] font-medium text-muted-foreground/70">
          Source-grounded tutor for NCERT Classes 6–12.
        </p>
      </div>
    </div>
  )
}
