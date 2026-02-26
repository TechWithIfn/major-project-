import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Mic, MicOff, Paperclip, Sparkles } from 'lucide-react'
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
    <div className="sticky bottom-0 z-20 w-full bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div
          className={cn(
            "relative flex flex-col transition-all duration-300 rounded-3xl border bg-card/80 backdrop-blur-2xl shadow-soft",
            isFocused ? "border-primary/50 shadow-glow ring-4 ring-primary/5 scale-[1.01]" : "border-border/50",
            (isLoading || disabled) && "opacity-80"
          )}
        >
          {voiceError && (
            <div className="absolute -top-8 left-4 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-[10px] font-bold text-destructive flex items-center gap-1 uppercase tracking-wider">
                <span className="h-1 w-1 rounded-full bg-destructive animate-pulse" />
                {voiceError}
              </p>
            </div>
          )}

          <div className="flex items-end gap-2 p-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 shrink-0 rounded-2xl transition-colors",
                isListening ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "hover:bg-muted"
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
              className="min-h-[2.5rem] max-h-48 w-full resize-none border-0 bg-transparent py-3 focus-visible:ring-0 text-[15px] font-medium placeholder:text-muted-foreground/60"
              rows={1}
            />

            <Button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading || disabled}
              size="icon"
              className={cn(
                "h-10 w-10 shrink-0 rounded-2xl transition-all shadow-soft",
                input.trim() ? "grad-primary text-white scale-100" : "bg-muted text-muted-foreground scale-95"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between px-4 pb-2 border-t border-border/10">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">NCERT AI Assistant</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-primary">Llama 3.1 Powered</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/60 font-medium">
          ShikshaSahayak can provide detailed explanations for all NCERT subjects from Class 6 to 12.
        </p>
      </div>
    </div>
  )
}
