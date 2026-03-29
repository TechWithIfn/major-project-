import { CURRICULUM_DATA, type NCERTTopic } from '@/lib/curriculum'

const DB_NAME = 'shiksha-sahayak-offline'
const DB_VERSION = 1
const MATERIALS_STORE = 'study_materials'
const META_STORE = 'meta'
const SIGNATURE_KEY = 'curriculum-signature'

export type MaterialsLoadSource = 'indexeddb' | 'seeded' | 'memory-fallback'

export interface MaterialsLoadResult {
  materials: NCERTTopic[]
  source: MaterialsLoadSource
}

interface MetaRecord {
  key: string
  value: string
}

let openDbPromise: Promise<IDBDatabase> | null = null

function canUseIndexedDb() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

function getCurriculumSignature() {
  return JSON.stringify(CURRICULUM_DATA.map((topic) => topic.id))
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'))
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
  })
}

async function openDb() {
  if (!canUseIndexedDb()) {
    throw new Error('IndexedDB is not available in this environment')
  }

  if (!openDbPromise) {
    openDbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result

        if (!db.objectStoreNames.contains(MATERIALS_STORE)) {
          db.createObjectStore(MATERIALS_STORE, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'))
    })
  }

  return openDbPromise
}

async function readStoredSignature(db: IDBDatabase) {
  const tx = db.transaction(META_STORE, 'readonly')
  const store = tx.objectStore(META_STORE)
  const record = await requestToPromise<MetaRecord | undefined>(store.get(SIGNATURE_KEY))
  await transactionToPromise(tx)
  return record?.value ?? null
}

async function readAllMaterials(db: IDBDatabase) {
  const tx = db.transaction(MATERIALS_STORE, 'readonly')
  const store = tx.objectStore(MATERIALS_STORE)
  const materials = await requestToPromise<NCERTTopic[]>(store.getAll())
  await transactionToPromise(tx)
  return materials
}

async function writeSeedData(db: IDBDatabase) {
  const tx = db.transaction([MATERIALS_STORE, META_STORE], 'readwrite')
  const materialsStore = tx.objectStore(MATERIALS_STORE)
  const metaStore = tx.objectStore(META_STORE)

  materialsStore.clear()
  for (const topic of CURRICULUM_DATA) {
    materialsStore.put(topic)
  }

  metaStore.put({ key: SIGNATURE_KEY, value: getCurriculumSignature() } as MetaRecord)
  await transactionToPromise(tx)
}

function sortMaterials(topics: NCERTTopic[]) {
  return [...topics].sort((a, b) => {
    if (a.class !== b.class) return a.class - b.class
    const subjectCompare = a.subject.localeCompare(b.subject)
    if (subjectCompare !== 0) return subjectCompare
    return a.title.localeCompare(b.title)
  })
}

export async function loadStudyMaterials(): Promise<MaterialsLoadResult> {
  if (!canUseIndexedDb()) {
    return { materials: sortMaterials(CURRICULUM_DATA), source: 'memory-fallback' }
  }

  try {
    const db = await openDb()
    const signature = getCurriculumSignature()
    const [storedSignature, storedMaterials] = await Promise.all([
      readStoredSignature(db),
      readAllMaterials(db),
    ])

    if (storedMaterials.length > 0 && storedSignature === signature) {
      return { materials: sortMaterials(storedMaterials), source: 'indexeddb' }
    }

    await writeSeedData(db)
    const seeded = await readAllMaterials(db)
    return { materials: sortMaterials(seeded), source: 'seeded' }
  } catch {
    return { materials: sortMaterials(CURRICULUM_DATA), source: 'memory-fallback' }
  }
}
