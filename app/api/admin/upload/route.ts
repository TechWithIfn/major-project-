import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const uploadDirectory = path.join(process.cwd(), 'data', 'ncert_pdfs')

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File)

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  await fs.mkdir(uploadDirectory, { recursive: true })

  const uploaded: string[] = []
  const rejected: string[] = []

  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      rejected.push(file.name)
      continue
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const safeName = sanitizeFilename(file.name)
    const filePath = path.join(uploadDirectory, safeName)

    let outputPath = filePath

    try {
      await fs.access(filePath)
      const ext = path.extname(safeName)
      const base = path.basename(safeName, ext)
      outputPath = path.join(uploadDirectory, `${base}-${Date.now()}${ext}`)
    } catch {
      outputPath = filePath
    }

    await fs.writeFile(outputPath, bytes)
    uploaded.push(path.basename(outputPath))
  }

  return NextResponse.json({
    uploaded,
    rejected,
    message: `Uploaded ${uploaded.length} PDF file(s)`,
  })
}
