import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const root = process.cwd()

const pdfDirectory = path.join(root, 'data', 'ncert_pdfs')
const curriculumDataPath = path.join(root, 'data', 'curriculum_data.json')

const embeddingDirectories = [
  path.join(root, 'models', 'embeddings'),
  path.join(root, 'backend', 'models', 'embeddings'),
]

const faissDirectories = [
  path.join(root, 'vectorstore', 'faiss_index'),
  path.join(root, 'backend', 'vectorstore', 'faiss_index'),
]

type PipelineStep = {
  id: string
  label: string
  complete: boolean
}

async function safeReadDir(dirPath: string) {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
}

async function directoryHasFiles(dirPath: string) {
  const entries = await safeReadDir(dirPath)
  return entries.some((entry) => entry.isFile() || entry.isDirectory())
}

export async function GET() {
  const pdfEntries = await safeReadDir(pdfDirectory)
  const pdfFiles = pdfEntries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))

  let totalPdfSize = 0
  for (const pdf of pdfFiles) {
    try {
      const stat = await fs.stat(path.join(pdfDirectory, pdf.name))
      totalPdfSize += stat.size
    } catch {
      continue
    }
  }

  const curriculumDataExists = await fs
    .access(curriculumDataPath)
    .then(() => true)
    .catch(() => false)

  const embeddingReady = (
    await Promise.all(embeddingDirectories.map((dirPath) => directoryHasFiles(dirPath)))
  ).some(Boolean)

  const vectorReady = (
    await Promise.all(
      faissDirectories.map(async (dirPath) => {
        const files = await safeReadDir(dirPath)
        return files.some((file) => file.name.endsWith('.faiss') || file.name.endsWith('.pkl'))
      })
    )
  ).some(Boolean)

  const steps: PipelineStep[] = [
    { id: 'pdf-uploaded', label: 'NCERT PDFs Uploaded', complete: pdfFiles.length > 0 },
    { id: 'dataset-ready', label: 'Curriculum Dataset Ready', complete: curriculumDataExists },
    { id: 'embedding-model', label: 'Embedding Model Cached', complete: embeddingReady },
    { id: 'vector-index', label: 'FAISS Vector Index Built', complete: vectorReady },
  ]

  const completedSteps = steps.filter((step) => step.complete).length
  const progressPercent = Math.round((completedSteps / steps.length) * 100)

  return NextResponse.json({
    analytics: {
      pdfCount: pdfFiles.length,
      totalPdfSizeMb: Number((totalPdfSize / (1024 * 1024)).toFixed(2)),
      progressPercent,
      indexReady: vectorReady,
      completedSteps,
      totalSteps: steps.length,
    },
    pipeline: steps,
  })
}
