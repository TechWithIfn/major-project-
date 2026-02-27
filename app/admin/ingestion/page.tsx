'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BrainCircuit, Database, FileText, Loader2, UploadCloud } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Analytics {
  pdfCount: number
  totalPdfSizeMb: number
  progressPercent: number
  indexReady: boolean
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

const defaultStats: StatsResponse = {
  analytics: {
    pdfCount: 0,
    totalPdfSizeMb: 0,
    progressPercent: 0,
    indexReady: false,
  },
  pipeline: [],
}

function formatSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

export default function IngestionPage() {
  const [stats, setStats] = useState<StatsResponse>(defaultStats)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')

  const stepMap = useMemo(() => {
    return new Map(stats.pipeline.map((step) => [step.id, step.complete]))
  }, [stats.pipeline])

  const chunkingPercent = useMemo(() => {
    if (stepMap.get('dataset-ready')) return 100
    if (stepMap.get('pdf-uploaded')) return 45
    return 0
  }, [stepMap])

  const embeddingPercent = useMemo(() => {
    if (stepMap.get('embedding-model')) return 100
    if (stepMap.get('dataset-ready')) return 55
    if (stepMap.get('pdf-uploaded')) return 20
    return 0
  }, [stepMap])

  const loadStats = async () => {
    setIsLoadingStats(true)
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load ingestion status')
      const data = (await response.json()) as StatsResponse
      setStats(data)
    } catch {
      setStatusMessage('Unable to load latest pipeline metrics.')
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    void loadStats()
  }, [])

  const appendFiles = (incoming: File[]) => {
    const pdfOnly = incoming.filter((file) => file.name.toLowerCase().endsWith('.pdf'))
    setSelectedFiles((prev) => {
      const merged = [...prev]
      for (const file of pdfOnly) {
        const exists = merged.some((item) => item.name === file.name && item.size === file.size)
        if (!exists) merged.push(file)
      }
      return merged
    })

    if (pdfOnly.length !== incoming.length) {
      setStatusMessage('Only PDF files are allowed for ingestion.')
    }
  }

  const uploadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      setStatusMessage('Drag and drop NCERT PDFs to start ingestion.')
      return
    }

    setIsUploading(true)
    setStatusMessage('')

    try {
      const formData = new FormData()
      for (const file of selectedFiles) {
        formData.append('files', file)
      }

      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const result = (await response.json()) as { message?: string; error?: string; rejected?: string[] }

      if (!response.ok) {
        throw new Error(result.error ?? 'Upload failed')
      }

      const rejectedText = result.rejected?.length ? ` Rejected: ${result.rejected.join(', ')}.` : ''
      setStatusMessage(`${result.message ?? 'Upload completed.'}${rejectedText}`)
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
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI Knowledge Base Ingestion</h1>
            <p className="mt-1 text-sm text-muted-foreground">Upload NCERT PDFs, monitor chunking, embeddings, and vector DB readiness.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">Offline Pipeline</Badge>
            <Button asChild variant="outline">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
              </Link>
            </Button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl border-border/70 p-5">
            <p className="text-xs text-muted-foreground">Uploaded PDFs</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{stats.analytics.pdfCount}</p>
          </Card>
          <Card className="rounded-2xl border-border/70 p-5">
            <p className="text-xs text-muted-foreground">Chunking Status</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{chunkingPercent}%</p>
          </Card>
          <Card className="rounded-2xl border-border/70 p-5">
            <p className="text-xs text-muted-foreground">Vector Database</p>
            <div className="mt-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-semibold tracking-tight">{stats.analytics.indexReady ? 'Ready' : 'Pending'}</p>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card className="rounded-2xl border-border/70 p-5 lg:col-span-3">
            <h2 className="text-base font-semibold tracking-tight">Drag & Drop PDF Upload</h2>
            <p className="mt-1 text-sm text-muted-foreground">Supports bulk NCERT upload for your research knowledge base.</p>

            <label
              className={`mt-4 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
              }`}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                const dropped = Array.from(event.dataTransfer.files)
                appendFiles(dropped)
              }}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Drag and drop PDF files here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
              <input
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(event) => appendFiles(Array.from(event.target.files ?? []))}
              />
            </label>

            <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-3">
              {selectedFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files queued for ingestion.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedFiles.slice(0, 6).map((file) => (
                    <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
                    </li>
                  ))}
                  {selectedFiles.length > 6 && (
                    <li className="text-xs text-muted-foreground">+{selectedFiles.length - 6} more files</li>
                  )}
                </ul>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={() => void uploadSelectedFiles()} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" /> Start Ingestion Upload
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFiles([])}
                disabled={selectedFiles.length === 0 || isUploading}
              >
                Clear Queue
              </Button>
            </div>

            {statusMessage && (
              <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                {statusMessage}
              </div>
            )}
          </Card>

          <Card className="rounded-2xl border-border/70 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight">Pipeline Status</h2>
              <Button variant="ghost" size="sm" onClick={() => void loadStats()} disabled={isLoadingStats}>
                {isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Chunking</span>
                  <span>{chunkingPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${chunkingPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BrainCircuit className="h-3.5 w-3.5" /> Embeddings</span>
                  <span>{embeddingPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${embeddingPercent}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">Vector Database Indicator</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-medium">FAISS Index</p>
                  <Badge variant={stats.analytics.indexReady ? 'default' : 'secondary'}>
                    {stats.analytics.indexReady ? 'Ready' : 'Waiting'}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">Storage</p>
                <p className="mt-1 text-sm font-medium">{stats.analytics.totalPdfSizeMb} MB scanned corpus</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
