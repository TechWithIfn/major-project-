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
    <StudentShell title="Adaptive Quiz Hub" description="Generate NCERT-style assessments in a focused research workspace.">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Card className="overflow-hidden border-border/60 bg-card p-6">
          <div>
            <Label htmlFor="quiz-topic" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Chapter or Concept</Label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                id="quiz-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Chemical Bonding, Indian Constitution"
                className="h-10 rounded-lg border-border/60 bg-background text-sm"
              />
              <Button
                onClick={generateQuiz}
                disabled={isLoading || !topic.trim()}
                className="h-10 gap-2 rounded-lg px-6"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Generate Quiz
              </Button>
            </div>
            {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
          </div>
        </Card>

        <Card className="overflow-hidden border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Practice Assessment</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 rounded-full"
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
              className="min-h-[500px] resize-none border-0 bg-transparent p-0 text-sm leading-7 focus-visible:ring-0"
              placeholder="Your AI-generated quiz will appear here. Answer the questions then check the key at the bottom..."
            />
          </div>
        </Card>

        <p className="text-center text-[11px] font-medium text-muted-foreground/70">
          Tip: You can edit the text directly to add your own notes before saving.
        </p>
      </div>
    </StudentShell>
  )
}
