'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Upload, Database, Activity, FolderKanban, BrainCircuit, FileText, CheckCircle2, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Analytics {
  pdfCount: number
  totalPdfSizeMb: number
  progressPercent: number
  indexReady: boolean
  completedSteps: number
  totalSteps: number
}

interface PipelineStep {
  id: string
  label: string
  complete: boolean
}

interface StatsResponse {
  analytics: Analytics
  pipeline: PipelineStep[]
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'pipeline', label: 'Embedding Pipeline', icon: BrainCircuit },
  { id: 'upload', label: 'Upload NCERT PDFs', icon: Upload },
  { id: 'analytics', label: 'Analytics', icon: FolderKanban },
]

const defaultStats: StatsResponse = {
  analytics: {
    pdfCount: 0,
    totalPdfSizeMb: 0,
    progressPercent: 0,
    indexReady: false,
    completedSteps: 0,
    totalSteps: 4,
  },
  pipeline: [
    { id: 'pdf-uploaded', label: 'NCERT PDFs Uploaded', complete: false },
    { id: 'dataset-ready', label: 'Curriculum Dataset Ready', complete: false },
    { id: 'embedding-model', label: 'Embedding Model Cached', complete: false },
    { id: 'vector-index', label: 'FAISS Vector Index Built', complete: false },
  ],
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [stats, setStats] = useState<StatsResponse>(defaultStats)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const pipelinePercent = useMemo(() => stats.analytics.progressPercent, [stats.analytics.progressPercent])

  const loadStats = async () => {
    setIsLoadingStats(true)
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Unable to fetch admin stats')
      }
      const data = (await response.json()) as StatsResponse
      setStats(data)
    } catch {
      setStatusMessage('Unable to load latest pipeline stats. Try refreshing.')
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    void loadStats()
  }, [])

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setStatusMessage('Select at least one NCERT PDF file.')
      return
    }

    setIsUploading(true)
    setStatusMessage('')

    try {
      const formData = new FormData()
      for (const file of selectedFiles) {
        formData.append('files', file)
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as { message?: string; error?: string; rejected?: string[] }

      if (!response.ok) {
        throw new Error(result.error ?? 'Upload failed')
      }

      const rejectedFiles = result.rejected?.length
        ? ` Rejected: ${result.rejected.join(', ')}.`
        : ''

      setStatusMessage(`${result.message ?? 'Upload completed.'}${rejectedFiles}`)
      setSelectedFiles([])
      await loadStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setStatusMessage(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-soft backdrop-blur-md lg:block">
          <div className="mb-6">
            <h1 className="text-lg font-semibold tracking-tight">Admin Console</h1>
            <p className="mt-1 text-sm text-muted-foreground">Research AI Operations</p>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">System Mode</p>
            <Badge className="mt-2 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">Offline Active</Badge>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-soft backdrop-blur-md sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">SaaS Admin Dashboard</h2>
                <p className="mt-1 text-sm text-muted-foreground">NCERT ingestion, embeddings, and pipeline analytics</p>
              </div>
              <Button variant="outline" onClick={() => void loadStats()} disabled={isLoadingStats}>
                {isLoadingStats ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing
                  </>
                ) : (
                  'Refresh Data'
                )}
              </Button>
              <Button asChild>
                <Link href="/admin/ingestion">Open Ingestion Screen</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin/design-system">Open Design System</Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl border-border/70 p-5">
              <p className="text-xs text-muted-foreground">NCERT PDFs</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold tracking-tight">{stats.analytics.pdfCount}</p>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="rounded-2xl border-border/70 p-5">
              <p className="text-xs text-muted-foreground">Storage Used</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold tracking-tight">{stats.analytics.totalPdfSizeMb} MB</p>
                <Database className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="rounded-2xl border-border/70 p-5">
              <p className="text-xs text-muted-foreground">Embedding Progress</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold tracking-tight">{pipelinePercent}%</p>
                <BrainCircuit className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="rounded-2xl border-border/70 p-5">
              <p className="text-xs text-muted-foreground">Vector Index</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-lg font-semibold tracking-tight">
                  {stats.analytics.indexReady ? 'Ready' : 'Pending'}
                </p>
                <Badge variant={stats.analytics.indexReady ? 'default' : 'secondary'}>
                  {stats.analytics.indexReady ? 'Online' : 'Waiting'}
                </Badge>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-5">
            <Card className="rounded-2xl border-border/70 p-5 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight">Embedding Pipeline Progress</h3>
                <p className="text-xs text-muted-foreground">
                  {stats.analytics.completedSteps}/{stats.analytics.totalSteps} complete
                </p>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pipelinePercent}%` }}
                />
              </div>

              <div className="mt-5 space-y-3">
                {stats.pipeline.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2"
                  >
                    <p className="text-sm">{step.label}</p>
                    {step.complete ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">Done</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-2xl border-border/70 p-5 lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-base font-semibold tracking-tight">Upload NCERT PDFs</h3>
                <p className="mt-1 text-sm text-muted-foreground">Bulk upload textbooks for the embedding pipeline.</p>
              </div>

              <Input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? [])
                  setSelectedFiles(files)
                }}
              />

              <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/20 p-3">
                {selectedFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No PDF selected</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedFiles.slice(0, 4).map((file) => (
                      <li key={file.name} className="truncate text-sm">
                        {file.name}
                      </li>
                    ))}
                    {selectedFiles.length > 4 && (
                      <li className="text-xs text-muted-foreground">+{selectedFiles.length - 4} more files</li>
                    )}
                  </ul>
                )}
              </div>

              <Button className="mt-4 w-full" onClick={() => void handleUpload()} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload PDFs
                  </>
                )}
              </Button>

              {statusMessage && (
                <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                  {statusMessage}
                </div>
              )}
            </Card>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
            <h3 className="text-base font-semibold tracking-tight">Research Ops Notes</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                Run backend ingestion after upload to regenerate dataset and vector index.
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                Keep embedding cache and FAISS index synchronized for accurate NCERT retrieval.
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/80 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Material-inspired minimal interface for production admin workflows
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
