'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Volume2, BookOpen, Lightbulb, ListChecks } from 'lucide-react'
import { useSpeak } from '@/hooks/use-speak'
import type { Message } from '@/lib/curriculum'

interface AssistantAnswerBubbleProps {
  message: Message
  onQuickAction?: (action: string) => void
}

export function AssistantAnswerBubble({ message, onQuickAction }: AssistantAnswerBubbleProps) {
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
    <div className="flex justify-start w-full max-w-3xl">
      <Card className="w-full p-3 sm:p-4 bg-muted/40 border-border/80 shadow-none break-words overflow-hidden">
        {/* 1. Title: Chapter – Class – Subject */}
        {title && (
          <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border/60 break-words">
            {title}
          </h3>
        )}

        {/* 2. Explanation (main content) */}
        <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-[15px] [&>p]:mb-3">
          {explanation}
        </div>

        {/* 3. Examples (collapsible) */}
        {examples.length > 0 && (
          <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                {examplesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Lightbulb className="h-4 w-4" />
                Examples
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 pl-5 space-y-2 text-sm text-foreground/90 list-disc">
                {examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* 4. Key Points (collapsible) */}
        {keyPoints.length > 0 && (
          <Collapsible open={keyPointsOpen} onOpenChange={setKeyPointsOpen} className="mt-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                {keyPointsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <ListChecks className="h-4 w-4" />
                Key Points
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 pl-5 space-y-1 text-sm text-foreground/90 list-disc">
                {keyPoints.slice(0, 6).map((kp, i) => (
                  <li key={i}>{kp}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* 5. NCERT Source (subtle) */}
        {sources.length > 0 && (
          <p className="mt-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
            <BookOpen className="inline h-3 w-3 mr-1" />
            NCERT: {sources.join(', ')}
          </p>
        )}

        {/* Listen Answer + Quick actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs min-h-[36px] sm:min-h-0"
            onClick={handleListen}
            aria-label="Listen to answer"
          >
            <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="sm:inline hidden">Listen Answer</span>
            <span className="sm:hidden">Listen</span>
          </Button>
          {onQuickAction && (
            <>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs min-h-[36px] sm:min-h-0" onClick={() => onQuickAction('Explain more')}>
                Explain more
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs hidden sm:inline-flex" onClick={() => onQuickAction('Give examples')}>
                Give examples
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs hidden sm:inline-flex" onClick={() => onQuickAction('MCQs')}>
                MCQs
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs hidden md:inline-flex" onClick={() => onQuickAction('Exam questions')}>
                Exam questions
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs hidden md:inline-flex" onClick={() => onQuickAction('Short notes')}>
                Short notes
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
