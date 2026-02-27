'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Volume2, BookOpen, Lightbulb, ListChecks, BookmarkPlus, Brain } from 'lucide-react'
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
    <div className="flex w-full justify-start animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-muted/40">
            <Brain className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Assistant</span>
        </div>

        <Card className="w-full overflow-hidden rounded-2xl border-border/60 bg-card/80 p-4 sm:p-5">

          {/* 1. Title: Chapter – Class – Subject */}
          {title && (
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                {title}
              </h3>
            </div>
          )}

          {/* 2. Explanation (main content) */}
          <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/95 [&>p]:mb-4">
            {explanation}
          </div>

          {/* 3. Examples (collapsible) */}
          {examples.length > 0 && (
            <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen} className="mt-5 rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto w-full justify-between gap-2 p-0 text-foreground hover:bg-transparent">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Examples</span>
                  </div>
                  {examplesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                  {examples.map((ex, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-semibold text-muted-foreground">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 4. Key Points (collapsible) */}
          {keyPoints.length > 0 && (
            <Collapsible open={keyPointsOpen} onOpenChange={setKeyPointsOpen} className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto w-full justify-between gap-2 p-0 text-foreground hover:bg-transparent">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Key Takeaways</span>
                  </div>
                  {keyPointsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                  {keyPoints.slice(0, 6).map((kp, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-semibold text-muted-foreground">✓</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 5. NCERT Source badges */}
          {sources.length > 0 && (
            <div className="mt-5 border-t border-border/50 pt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">NCERT Citations</p>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                  <Badge key={`${source}-${index}`} variant="outline" className="max-w-full rounded-full border-border/70 bg-background text-[11px] font-normal text-muted-foreground">
                    <span className="mr-1 font-medium text-foreground">[{index + 1}]</span>
                    <span className="truncate">{source}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-full"
                onClick={handleListen}
              >
                <Volume2 className="h-4 w-4" />
                <span>Listen</span>
              </Button>

              {onBookmark && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full"
                  onClick={onBookmark}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  <span>Bookmark</span>
                </Button>
              )}
            </div>

            {onQuickAction && (
              <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                {['Explain more', 'MCQs', 'Exam tips'].map(action => (
                  <Button
                    key={action}
                    variant="ghost"
                    size="sm"
                    className="h-8 whitespace-nowrap rounded-full text-[11px] font-medium text-muted-foreground"
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
