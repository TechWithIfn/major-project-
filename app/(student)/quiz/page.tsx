'use client'

import { useState } from 'react'
import { Loader2, Save, Sparkles } from 'lucide-react'

import { StudentShell } from '@/components/student/student-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addBookmark } from '@/lib/student/storage'

export default function QuizPage() {
  const [topic, setTopic] = useState('')
  const [quiz, setQuiz] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQuiz = async () => {
    if (!topic.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate 5 challenging NCERT-style MCQs for ${topic}. Include clear options A-D and provide correct answers with brief explanations at the end.`,
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to generate quiz')
      }

      const data = (await response.json()) as { response: string }
      setQuiz(data.response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate quiz right now')
    } finally {
      setIsLoading(false)
    }
  }

  const saveQuiz = () => {
    if (!quiz.trim()) return
    addBookmark({
      id: crypto.randomUUID(),
      title: `Quiz: ${topic || 'Custom Topic'}`,
      content: quiz,
      createdAt: new Date().toISOString(),
      type: 'quiz',
    })
  }

  return (
    <StudentShell title="Adaptive Quiz Hub" description="Challenge yourself with AI-generated MCQs mapped to the NCERT curriculum.">
      <Card className="glass-card p-6 overflow-hidden relative">
        <div className="relative z-10">
          <Label htmlFor="quiz-topic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chapter or Concept</Label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Input
              id="quiz-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Chemical Bonding, Indian Constitution"
              className="h-12 rounded-xl bg-background/50 border-border/50 text-[15px] focus:ring-primary/20"
            />
            <Button
              onClick={generateQuiz}
              disabled={isLoading || !topic.trim()}
              className="h-12 rounded-xl px-8 grad-primary shadow-soft border-0 gap-2 font-bold"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Generate Quiz
            </Button>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-destructive animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      </Card>

      <Card className="mt-8 glass-card border-border/30 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Practice Assessment</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 px-4 border-primary/20 bg-transparent text-primary hover:bg-primary/5 gap-2 font-bold"
            onClick={saveQuiz}
            disabled={!quiz.trim()}
          >
            <Save className="h-3.5 w-3.5" />
            Save Result
          </Button>
        </div>
        <div className="p-6">
          <Textarea
            value={quiz}
            onChange={(e) => setQuiz(e.target.value)}
            rows={20}
            className="min-h-[500px] border-0 bg-transparent p-0 text-[16px] font-medium leading-relaxed resize-none focus-visible:ring-0 selection:bg-primary/10"
            placeholder="Your AI-generated quiz will appear here. Answer the questions then check the key at the bottom..."
          />
        </div>
      </Card>

      <p className="mt-6 text-center text-[11px] text-muted-foreground/60 font-medium italic">
        Tip: You can edit the text directly to add your own notes before saving.
      </p>
    </StudentShell>
  )
}
