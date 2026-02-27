import Link from 'next/link'
import { ArrowLeft, BrainCircuit, Camera, Languages, LayoutDashboard, Mic, MessageSquare, UploadCloud } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const modules = [
  {
    title: 'Offline AI Tutor Chat',
    description: 'Two-sided conversation UI with source badge and offline confidence markers.',
    icon: MessageSquare,
  },
  {
    title: 'NCERT OCR Scanning',
    description: 'Camera overlay, paragraph highlight, floating shutter, and scan state feedback.',
    icon: Camera,
  },
  {
    title: 'Voice Assistant',
    description: 'Locale-aware voice interaction based on onboarding language preference.',
    icon: Mic,
  },
  {
    title: 'Multilingual Onboarding',
    description: 'Three-step onboarding with large language cards and accessibility-first controls.',
    icon: Languages,
  },
  {
    title: 'Student Dashboard',
    description: 'Gemini-inspired card hierarchy with AI search and offline badge status.',
    icon: LayoutDashboard,
  },
  {
    title: 'Knowledge Base Pipeline',
    description: 'Drag-drop upload, chunking visibility, embedding progression, vector DB readiness.',
    icon: UploadCloud,
  },
]

const tokenRows = [
  { label: 'Primary Indigo', value: '#6366F1' },
  { label: 'Deep Indigo', value: '#4F46E5' },
  { label: 'Surface Indigo', value: '#0A1030' },
  { label: 'Text Support', value: '#C7D2FE' },
]

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">ShikshaSahayak Design System</h1>
            <p className="mt-1 text-sm text-muted-foreground">Premium offline AI education UI for mobile and web</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
            </Link>
          </Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tokenRows.map((token) => (
            <Card key={token.label} className="rounded-2xl border-border/70 p-4">
              <p className="text-xs text-muted-foreground">{token.label}</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full border border-border/50"
                  style={{ backgroundColor: token.value }}
                />
                <p className="text-sm font-medium">{token.value}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-border/70 bg-card/80 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">System Principles</h2>
            <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">Research Grade</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['Offline-first confidence', 'Material-inspired hierarchy', 'Glassmorphism surfaces', 'Minimal academic typography'].map((rule) => (
              <div key={rule} className="rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-sm">
                {rule}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card key={module.title} className="rounded-2xl border-border/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{module.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
              </Card>
            )
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-border/70 bg-card/80 p-5 text-sm text-muted-foreground">
          Full implementation specification is documented in
          {' '}
          <span className="font-medium text-foreground">docs/UI_UX_SYSTEM_SHIKSHASAHAYAK.md</span>.
        </section>
      </div>
    </div>
  )
}
