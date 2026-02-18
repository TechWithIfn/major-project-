'use client'

import type { Message } from '@/lib/curriculum'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Check, CheckCheck } from 'lucide-react'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'
  
  return (
    <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xl ${isAssistant ? 'flex-1' : ''}`}>
        <Card
          className={`p-4 ${
            isAssistant
              ? 'bg-card border-primary/20'
              : 'bg-primary text-primary-foreground border-0'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {isAssistant && message.keyPoints && message.keyPoints.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Key points
              </p>
              <ul className="text-sm text-foreground/90 space-y-1 list-disc list-inside">
                {message.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {isAssistant && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Sources (NCERT curriculum)
              </p>
              <div className="flex flex-wrap gap-1">
                {message.sources.map((source, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
        
        <div className="flex items-center gap-2 mt-1 px-2">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </p>
          {!isAssistant && message.seen && (
            <CheckCheck className="h-3 w-3 text-accent" />
          )}
        </div>
      </div>
    </div>
  )
}
