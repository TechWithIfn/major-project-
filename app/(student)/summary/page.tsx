'use client'

import { useState } from 'react'
import { Loader2, Save, Sparkles } from 'lucide-react'

import { StudentShell } from '@/components/student/student-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addBookmark } from '@/lib/student/storage'

export default function SummaryPage() {
  const [prompt, setPrompt] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSummary = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Create a structured student-friendly summary with key concepts, bullet points, and a concluding simplified explanation for: ${prompt}`,
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to generate summary')
      }

      const data = (await response.json()) as { response: string }
      setSummary(data.response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate summary right now')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSummary = () => {
    if (!summary.trim()) return
    addBookmark({
      id: crypto.randomUUID(),
      title: `Summary: ${prompt.slice(0, 40) || 'Custom Topic'}`,
      content: summary,
      createdAt: new Date().toISOString(),
      type: 'summary',
    })
  }

  return (
    <StudentShell title="Conceptual Briefs" description="Generate structured NCERT summaries in a focused research workspace.">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Card className="overflow-hidden border-border/60 bg-card p-6">
          <div>
            <Label htmlFor="summary-prompt" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Chapter or Concept Breakdown</Label>
            <Textarea
              id="summary-prompt"
              className="mt-3 min-h-[120px] resize-none rounded-xl border-border/60 bg-background p-4 text-sm leading-6"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Explain the core principles of Magnetism and its real-world applications"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={generateSummary}
                disabled={isLoading || !prompt.trim()}
                className="h-10 gap-2 rounded-lg px-6"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Generate Summary
              </Button>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-lg px-6"
                onClick={saveSummary}
                disabled={!summary.trim()}
              >
                <Save className="h-4 w-4" />
                Save to Notes
              </Button>
            </div>
            {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
          </div>
        </Card>

        <Card className="overflow-hidden border-border/60 bg-card">
          <div className="flex items-center gap-2 border-b border-border/50 px-6 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Summary Output</h2>
          </div>
          <div className="p-6">
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={16}
              className="min-h-[400px] resize-none border-0 bg-transparent p-0 text-sm leading-7 focus-visible:ring-0"
              placeholder="Conceptual summary output will appear here..."
            />
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Concise', desc: 'Saves 80% reading time' },
            { title: 'Structured', desc: 'Easy to recall during exams' },
            { title: 'Adaptive', desc: 'Mapped to your curriculum' }
          ].map(feature => (
            <div key={feature.title} className="rounded-xl border border-border/60 bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground">{feature.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  )
}
