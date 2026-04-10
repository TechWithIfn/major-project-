import type {
  OfflineChapter,
  OfflineQuiz,
  OfflineQuizQuestion,
  OfflineStudyBundle,
  OfflineStudyMaterial,
  OfflineSubject,
  QuizOption,
  ContentUpdateCheckResult,
  ContentUpdateManifest,
} from '../types';

export const STUDY_SYNC_URL = (import.meta.env.VITE_OFFLINE_STUDY_SYNC_URL || '/api/offline-study.json').trim();
export const STUDY_MANIFEST_URL = (import.meta.env.VITE_OFFLINE_STUDY_MANIFEST_URL || '/api/offline-study-manifest.json').trim();

function getCandidateSyncUrls(): string[] {
  const fromEnv = (import.meta.env.VITE_OFFLINE_STUDY_SYNC_URL || '').trim();
  const fallbackFromEnv = (import.meta.env.VITE_OFFLINE_STUDY_SYNC_FALLBACK_URL || '').trim();

  return [fromEnv, fallbackFromEnv, '/api/offline-study.json', '/api/offline-study', 'http://localhost:3000/api/offline-study'].filter(
    (url, index, list): url is string => Boolean(url) && list.indexOf(url) === index
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function normalizeSubject(value: unknown): OfflineSubject | null {
  if (!isRecord(value) || typeof value.id !== 'string') {
    return null;
  }

  return {
    id: value.id,
    name: toStringValue(value.name, value.id),
    icon: toStringValue(value.icon, 'LayoutDashboard'),
    description: toStringValue(value.description),
    chapterCount: toNumberValue(value.chapterCount),
    totalMaterials: toNumberValue(value.totalMaterials),
    estimatedOfflineSizeKb: toNumberValue(value.estimatedOfflineSizeKb),
    updatedAt: toStringValue(value.updatedAt, new Date().toISOString()),
  };
}

function normalizeChapter(value: unknown): OfflineChapter | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.subjectId !== 'string') {
    return null;
  }

  return {
    id: value.id,
    subjectId: value.subjectId,
    title: toStringValue(value.title, value.id),
    progress: toNumberValue(value.progress),
    estimatedReadMinutes: toNumberValue(value.estimatedReadMinutes),
    sortOrder: toNumberValue(value.sortOrder),
    hasTextbook: Boolean(value.hasTextbook),
    hasNotes: Boolean(value.hasNotes),
    completed: Boolean(value.completed),
    updatedAt: toStringValue(value.updatedAt, new Date().toISOString()),
  };
}

function normalizeStudyMaterial(value: unknown): OfflineStudyMaterial | null {
  if (!isRecord(value) || typeof value.id !== 'string') {
    return null;
  }

  return {
    id: value.id,
    subjectId: toStringValue(value.subjectId),
    chapterId: toStringValue(value.chapterId),
    kind: value.kind === 'notes' ? 'notes' : 'textbook',
    title: toStringValue(value.title, value.id),
    summary: toStringValue(value.summary),
    blocks: toStringArray(value.blocks),
    highlights: toStringArray(value.highlights),
    sortOrder: toNumberValue(value.sortOrder),
    updatedAt: toStringValue(value.updatedAt, new Date().toISOString()),
  };
}

function normalizeQuizOption(value: unknown): QuizOption | null {
  if (!isRecord(value) || typeof value.id !== 'string') {
    return null;
  }

  return {
    id: value.id,
    text: toStringValue(value.text),
  };
}

function normalizeQuizQuestion(value: unknown): OfflineQuizQuestion | null {
  if (!isRecord(value) || typeof value.id !== 'string') {
    return null;
  }

  return {
    id: value.id,
    question: toStringValue(value.question),
    options: Array.isArray(value.options)
      ? value.options.map(normalizeQuizOption).filter((option): option is QuizOption => option !== null)
      : [],
    correctOptionId: toStringValue(value.correctOptionId),
    explanation: toStringValue(value.explanation),
  };
}

function normalizeQuiz(value: unknown): OfflineQuiz | null {
  if (!isRecord(value) || typeof value.id !== 'string') {
    return null;
  }

  return {
    id: value.id,
    subjectId: typeof value.subjectId === 'string' ? value.subjectId : null,
    chapterId: typeof value.chapterId === 'string' ? value.chapterId : null,
    title: toStringValue(value.title, value.id),
    description: toStringValue(value.description),
    durationMinutes: toNumberValue(value.durationMinutes),
    updatedAt: toStringValue(value.updatedAt, new Date().toISOString()),
    questions: Array.isArray(value.questions)
      ? value.questions.map(normalizeQuizQuestion).filter((question): question is OfflineQuizQuestion => question !== null)
      : [],
  };
}

function getCandidateManifestUrls(): string[] {
  const fromEnv = (import.meta.env.VITE_OFFLINE_STUDY_MANIFEST_URL || '').trim();
  const fallbackFromEnv = (import.meta.env.VITE_OFFLINE_STUDY_MANIFEST_FALLBACK_URL || '').trim();

  return [fromEnv, fallbackFromEnv, '/api/offline-study-manifest.json', '/api/offline-study/manifest']
    .filter((url, index, list): url is string => Boolean(url) && list.indexOf(url) === index);
}

export function normalizeStudyBundle(value: unknown): OfflineStudyBundle {
  const safeValue = isRecord(value) ? value : {};

  return {
    seededAt: toStringValue(safeValue.seededAt, new Date().toISOString()),
    version: toStringValue(safeValue.version, toStringValue(safeValue.seededAt, new Date().toISOString())),
    subjects: Array.isArray(safeValue.subjects)
      ? safeValue.subjects.map(normalizeSubject).filter((subject): subject is OfflineSubject => subject !== null)
      : [],
    chapters: Array.isArray(safeValue.chapters)
      ? safeValue.chapters.map(normalizeChapter).filter((chapter): chapter is OfflineChapter => chapter !== null)
      : [],
    materials: Array.isArray(safeValue.materials)
      ? safeValue.materials.map(normalizeStudyMaterial).filter((material): material is OfflineStudyMaterial => material !== null)
      : [],
    quizzes: Array.isArray(safeValue.quizzes)
      ? safeValue.quizzes.map(normalizeQuiz).filter((quiz): quiz is OfflineQuiz => quiz !== null)
      : [],
  };
}

function normalizeUpdateManifest(value: unknown): ContentUpdateManifest {
  const safeValue = isRecord(value) ? value : {};

  return {
    version: toStringValue(safeValue.version, new Date().toISOString()),
    bundleUrl: toStringValue(safeValue.bundleUrl, STUDY_SYNC_URL),
    updatedAt: toStringValue(safeValue.updatedAt, new Date().toISOString()),
    notes: toStringValue(safeValue.notes) || undefined,
  };
}

export async function fetchStudyBundleFromApi(signal?: AbortSignal): Promise<OfflineStudyBundle> {
  const candidateUrls = getCandidateSyncUrls();
  let lastError: unknown;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        lastError = new Error(`Study sync failed with status ${response.status} for ${url}.`);
        continue;
      }

      const payload = await response.json();
      return normalizeStudyBundle(payload);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Study sync failed for all configured endpoints. Last tried URL: ${STUDY_SYNC_URL}`);
}

export async function fetchStudyUpdateManifest(signal?: AbortSignal): Promise<ContentUpdateManifest> {
  const candidateUrls = getCandidateManifestUrls();
  let lastError: unknown;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        lastError = new Error(`Update manifest request failed with status ${response.status} for ${url}.`);
        continue;
      }

      const payload = await response.json();
      return normalizeUpdateManifest(payload);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Update manifest fetch failed for all configured endpoints. Last tried URL: ${STUDY_MANIFEST_URL}`);
}

export async function downloadStudyBundleByUrl(bundleUrl: string, signal?: AbortSignal): Promise<OfflineStudyBundle> {
  const response = await fetch(bundleUrl, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Study bundle download failed with status ${response.status} for ${bundleUrl}.`);
  }

  const payload = await response.json();
  return normalizeStudyBundle(payload);
}

export async function checkContentUpdate(currentVersion: string | null, signal?: AbortSignal): Promise<ContentUpdateCheckResult> {
  const manifest = await fetchStudyUpdateManifest(signal);

  return {
    hasUpdate: currentVersion !== manifest.version,
    currentVersion,
    latestVersion: manifest.version,
    manifest,
  };
}