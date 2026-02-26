'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Volume2, BookOpen, Lightbulb, ListChecks, BookmarkPlus, Brain, Sparkles } from 'lucide-react'
import { useSpeak } from '@/hooks/use-speak'
import type { Message } from '@/lib/curriculum'
import { Badge } from '@/components/ui/badge'

interface AssistantAnswerBubbleProps {
  message: Message
  onQuickAction?: (action: string) => void
  onBookmark?: () => void
}

export function AssistantAnswerBubble({ message, onQuickAction, onBookmark }: AssistantAnswerBubbleProps) {
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [keyPointsOpen, setKeyPointsOpen] = useState(false)
  const { speak, stop } = useSpeak()

  const title = message.title
  const explanation = message.content
  const examples = message.examples ?? []
  const keyPoints = message.keyPoints ?? []
  const sources = message.sources ?? []

  const handleListen = () => {
    stop()
    const toRead = [title, explanation].filter(Boolean).join('\n\n')
    if (toRead) speak(toRead)
  }

  return (
    <div className="flex justify-start w-full max-w-4xl animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg grad-primary shadow-soft">
            <Brain className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">ShikshaSahayak AI</span>
        </div>

        <Card className="w-full p-4 sm:p-6 glass shadow-soft border-border/30 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="h-24 w-24 text-primary" />
          </div>

          {/* 1. Title: Chapter – Class – Subject */}
          {title && (
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <h3 className="text-sm font-bold tracking-tight text-primary">
                {title}
              </h3>
            </div>
          )}

          {/* 2. Explanation (main content) */}
          <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-[15px] sm:text-[16px] font-medium [&>p]:mb-4">
            {explanation}
          </div>

          {/* 3. Examples (collapsible) */}
          {examples.length > 0 && (
            <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen} className="mt-6 rounded-xl bg-primary/5 p-3 sm:p-4 border border-primary/10">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between gap-2 text-primary hover:bg-primary/5 p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span className="text-sm font-bold">Practical Examples</span>
                  </div>
                  {examplesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-4 space-y-3 text-sm text-foreground/80">
                  {examples.map((ex, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 4. Key Points (collapsible) */}
          {keyPoints.length > 0 && (
            <Collapsible open={keyPointsOpen} onOpenChange={setKeyPointsOpen} className="mt-3 rounded-xl bg-accent/5 p-3 sm:p-4 border border-accent/10">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between gap-2 text-accent hover:bg-accent/5 p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    <span className="text-sm font-bold">Key Takeaways</span>
                  </div>
                  {keyPointsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                  {keyPoints.slice(0, 6).map((kp, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 5. NCERT Source (subtle) */}
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center text-xs font-semibold text-muted-foreground">
                <BookOpen className="h-3 w-3 mr-1.5 text-primary" />
                Verified Source: {sources.join(', ')}
              </div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-tighter opacity-70">NCERT Curriculum</Badge>
            </div>
          )}

          {/* Actions Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 h-9 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-all font-semibold"
                onClick={handleListen}
              >
                <Volume2 className="h-4 w-4" />
                <span>Play Audio</span>
              </Button>

              {onBookmark && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 h-9 border-border/50 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all font-semibold"
                  onClick={onBookmark}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  <span>Bookmark</span>
                </Button>
              )}
            </div>

            {onQuickAction && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {['Explain more', 'MCQs', 'Exam tips'].map(action => (
                  <Button
                    key={action}
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-[11px] h-8 font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 whitespace-nowrap"
                    onClick={() => onQuickAction(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
