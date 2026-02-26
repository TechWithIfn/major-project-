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
    <StudentShell title="Conceptual Briefs" description="Transform complex NCERT chapters into simple, structured study notes instantly.">
      <Card className="glass-card p-6 overflow-hidden relative">
        <div className="relative z-10">
          <Label htmlFor="summary-prompt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chapter or Concept Breakdown</Label>
          <Textarea
            id="summary-prompt"
            className="mt-3 min-h-[120px] rounded-2xl bg-background/50 border-border/50 text-[15px] p-4 focus:ring-primary/20 resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Explain the core principles of Magnetism and its real-world applications"
          />
          <div className="mt-4 flex gap-3">
            <Button
              onClick={generateSummary}
              disabled={isLoading || !prompt.trim()}
              className="h-11 rounded-xl px-8 grad-primary shadow-soft border-0 gap-2 font-bold"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Generate Summary
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl px-6 border-primary/20 bg-transparent text-primary hover:bg-primary/5 gap-2 font-bold"
              onClick={saveSummary}
              disabled={!summary.trim()}
            >
              <Save className="h-4 w-4" />
              Save to Notes
            </Button>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-destructive animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      </Card>

      <Card className="mt-8 glass-card border-border/30 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Smart Explanation</h2>
        </div>
        <div className="p-6">
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={16}
            className="min-h-[400px] border-0 bg-transparent p-0 text-[16px] font-medium leading-relaxed resize-none focus-visible:ring-0 selection:bg-primary/10"
            placeholder="Conceptual summary output will appear here..."
          />
        </div>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Concise', desc: 'Saves 80% reading time' },
          { title: 'Structured', desc: 'Easy to recall during exams' },
          { title: 'Adaptive', desc: 'Mapped to your curriculum' }
        ].map(feature => (
          <div key={feature.title} className="rounded-2xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-tighter">{feature.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </StudentShell>
  )
}
