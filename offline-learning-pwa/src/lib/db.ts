import Dexie, { type Table } from 'dexie';
import type {
  ChapterProgress,
  OfflineBookmark,
  OfflineBookmarkedChapter,
  OfflineChatMessage,
  OfflineChapter,
  OfflineChapterBundle,
  OfflineQuiz,
  OfflineStudyBundle,
  OfflineStudyMaterial,
  OfflineSubject,
  QuizAnswerRecord,
  QuizResultRecord,
  StudyMaterialKind,
} from '../types';

type OfflineMetadata = {
  key: string;
  value: string;
  updatedAt: string;
};

export const OFFLINE_STUDY_UPDATED_EVENT = 'offline-study-data-updated';
const LEGACY_BOOKMARKS_KEY = 'learning-hub-bookmarks';

function emitOfflineStudyUpdated(detail?: Record<string, unknown>): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(OFFLINE_STUDY_UPDATED_EVENT, { detail }));
}

function getTimestamp(): string {
  return new Date().toISOString();
}

class LearningHubDexieDatabase extends Dexie {
  subjects!: Table<OfflineSubject, string>;
  chapters!: Table<OfflineChapter, string>;
  content!: Table<OfflineStudyMaterial, string>;
  studyMaterials!: Table<OfflineStudyMaterial, string>;
  quizzes!: Table<OfflineQuiz, string>;
  bookmarks!: Table<OfflineBookmark, string>;
  chatMessages!: Table<OfflineChatMessage, string>;
  progress!: Table<ChapterProgress, string>;
  quizAnswers!: Table<QuizAnswerRecord, string>;
  quizResults!: Table<QuizResultRecord, string>;
  meta!: Table<OfflineMetadata, string>;

  constructor() {
    super('learning-hub-offline-db');

    this.version(1).stores({
      subjects: 'id, name, updatedAt',
      chapters: 'id, subjectId, [subjectId+sortOrder], updatedAt',
      studyMaterials: 'id, subjectId, chapterId, kind, [chapterId+kind], updatedAt',
      quizzes: 'id, subjectId, chapterId, updatedAt',
      meta: 'key, updatedAt',
    });

    this.version(2)
      .stores({
        subjects: 'id, name, updatedAt',
        chapters: 'id, subjectId, [subjectId+sortOrder], completed, updatedAt',
        studyMaterials: 'id, subjectId, chapterId, kind, [chapterId+kind], updatedAt',
        quizzes: 'id, subjectId, chapterId, updatedAt',
        progress: 'id, chapterId, completed, updatedAt',
        quizAnswers: 'id, quizId, questionId, updatedAt',
        meta: 'key, updatedAt',
      })
      .upgrade(async (transaction) => {
        await transaction.table<OfflineChapter, string>('chapters').toCollection().modify((chapter) => {
          if (typeof chapter.completed !== 'boolean') {
            chapter.completed = false;
          }
        });
      });

    this.version(3)
      .stores({
        subjects: 'id, name, updatedAt',
        chapters: 'id, subjectId, [subjectId+sortOrder], completed, updatedAt',
        studyMaterials: 'id, subjectId, chapterId, kind, [chapterId+kind], updatedAt',
        quizzes: 'id, subjectId, chapterId, updatedAt',
        progress: 'id, chapterId, completed, updatedAt',
        quizAnswers: 'id, quizId, questionId, updatedAt',
        quizResults: 'id, quizId, completedAt, percentage',
        meta: 'key, updatedAt',
      })
      .upgrade(async () => {
        // quizResults is additive; no data migration is required.
      });

    this.version(4)
      .stores({
        subjects: 'id, name, updatedAt',
        chapters: 'id, subjectId, [subjectId+sortOrder], completed, updatedAt',
        content: 'id, subjectId, chapterId, kind, [chapterId+kind], updatedAt',
        studyMaterials: 'id, subjectId, chapterId, kind, [chapterId+kind], updatedAt',
        quizzes: 'id, subjectId, chapterId, updatedAt',
        bookmarks: 'id, chapterId, subjectId, createdAt, updatedAt',
        progress: 'id, chapterId, completed, updatedAt',
        quizAnswers: 'id, quizId, questionId, updatedAt',
        quizResults: 'id, quizId, completedAt, percentage',
        meta: 'key, updatedAt',
      })
      .upgrade(async (transaction) => {
        const contentCount = await transaction.table<OfflineStudyMaterial, string>('content').count();
        if (contentCount > 0) {
          return;
        }

        const legacyMaterials = await transaction.table<OfflineStudyMaterial, string>('studyMaterials').toArray();
        if (legacyMaterials.length > 0) {
          await transaction.table<OfflineStudyMaterial, string>('content').bulkPut(legacyMaterials);
        }
      });

    this.version(5)
      .stores({
        subjects: 'id, name, updatedAt',
        chapters: 'id, subjectId, [subjectId+sortOrder], completed, updatedAt',
        content: 'id, subjectId, chapterId, kind, [chapterId+kind], updatedAt',
        studyMaterials: 'id, subjectId, chapterId, kind, [chapterId+kind], updatedAt',
        quizzes: 'id, subjectId, chapterId, updatedAt',
        bookmarks: 'id, chapterId, subjectId, createdAt, updatedAt',
        chatMessages: 'id, role, createdAt',
        progress: 'id, chapterId, completed, updatedAt',
        quizAnswers: 'id, quizId, questionId, updatedAt',
        quizResults: 'id, quizId, completedAt, percentage',
        meta: 'key, updatedAt',
      })
      .upgrade(async () => {
        // chatMessages is additive; no migration required.
      });
  }
}

export const studyDatabase = new LearningHubDexieDatabase();

export async function saveSubject(subject: OfflineSubject): Promise<void> {
  await studyDatabase.subjects.put(subject);
}

export async function saveChapter(chapter: OfflineChapter): Promise<void> {
  await studyDatabase.chapters.put(chapter);
}

export async function saveStudyMaterial(material: OfflineStudyMaterial): Promise<void> {
  await studyDatabase.transaction('rw', studyDatabase.content, studyDatabase.studyMaterials, async () => {
    await studyDatabase.content.put(material);
    await studyDatabase.studyMaterials.put(material);
  });
}

export async function saveQuiz(quiz: OfflineQuiz): Promise<void> {
  await studyDatabase.quizzes.put(quiz);
}

async function getCompletionMap(): Promise<Map<string, ChapterProgress>> {
  const progressRows = await studyDatabase.progress.toArray();
  return new Map(progressRows.map((progress) => [progress.chapterId, progress]));
}

export async function saveStudyBundle(bundle: OfflineStudyBundle): Promise<void> {
  const completionMap = await getCompletionMap();
  const contentVersion = bundle.version ?? bundle.seededAt;
  const mergedChapters = bundle.chapters.map((chapter) => ({
    ...chapter,
    completed: completionMap.get(chapter.id)?.completed ?? chapter.completed,
  }));

  await studyDatabase.transaction(
    'rw',
    studyDatabase.subjects,
    studyDatabase.chapters,
    studyDatabase.content,
    studyDatabase.studyMaterials,
    studyDatabase.quizzes,
    studyDatabase.meta,
    async () => {
      await studyDatabase.subjects.bulkPut(bundle.subjects);
      await studyDatabase.chapters.bulkPut(mergedChapters);
      await studyDatabase.content.bulkPut(bundle.materials);
      await studyDatabase.studyMaterials.bulkPut(bundle.materials);
      await studyDatabase.quizzes.bulkPut(bundle.quizzes);
      await studyDatabase.meta.put({
        key: 'seededAt',
        value: bundle.seededAt,
        updatedAt: bundle.seededAt,
      });
      await studyDatabase.meta.put({
        key: 'contentVersion',
        value: contentVersion,
        updatedAt: getTimestamp(),
      });
      await studyDatabase.meta.put({
        key: 'lastContentRefreshAt',
        value: getTimestamp(),
        updatedAt: getTimestamp(),
      });
    }
  );

  emitOfflineStudyUpdated({ source: 'content-save', syncedAt: getTimestamp() });
}

export async function seedStudyLibraryIfEmpty(bundle: OfflineStudyBundle): Promise<void> {
  const subjectCount = await studyDatabase.subjects.count();

  if (subjectCount > 0) {
    return;
  }

  await saveStudyBundle(bundle);
}

export async function primeOfflineStudyLibrary(bundle: OfflineStudyBundle): Promise<void> {
  await studyDatabase.open();
  await seedStudyLibraryIfEmpty(bundle);
  await migrateLegacyBookmarks();
}

async function migrateLegacyBookmarks(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_BOOKMARKS_KEY);
  if (!legacyRaw) {
    return;
  }

  let chapterIds: string[] = [];
  try {
    const parsed = JSON.parse(legacyRaw) as unknown;
    chapterIds = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    chapterIds = [];
  }

  if (chapterIds.length === 0) {
    window.localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
    return;
  }

  const existingCount = await studyDatabase.bookmarks.count();
  if (existingCount > 0) {
    window.localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
    return;
  }

  for (const chapterId of chapterIds) {
    // eslint-disable-next-line no-await-in-loop
    await toggleBookmark(chapterId);
  }

  window.localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
}

export async function getSubjects(): Promise<OfflineSubject[]> {
  return studyDatabase.subjects.orderBy('name').toArray();
}

export async function getSubjectById(subjectId: string): Promise<OfflineSubject | undefined> {
  return studyDatabase.subjects.get(subjectId);
}

export async function getChapterById(chapterId: string): Promise<OfflineChapter | undefined> {
  return studyDatabase.chapters.get(chapterId);
}

export async function getAllChapters(): Promise<OfflineChapter[]> {
  return studyDatabase.chapters.orderBy('title').toArray();
}

function buildSnippet(text: string, maxLength = 220): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength)}...`;
}

export async function getLocalTutorResponse(query: string): Promise<string> {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return 'Please ask a specific chapter question so I can help from your offline study library.';
  }

  const keywords = normalized.split(/\s+/).filter((token) => token.length > 2);
  const [materials, chapters, subjects] = await Promise.all([
    studyDatabase.content.toArray(),
    studyDatabase.chapters.toArray(),
    studyDatabase.subjects.toArray(),
  ]);

  if (materials.length === 0) {
    return 'Offline study materials are not available yet. Please sync once when online, then retry.';
  }

  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));

  const ranked = materials
    .map((material) => {
      const chapter = chapterById.get(material.chapterId);
      const text = `${material.title} ${material.summary} ${material.blocks.join(' ')} ${material.highlights.join(' ')}`.toLowerCase();
      const keywordScore = keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
      const directScore = text.includes(normalized) ? 3 : 0;

      return {
        material,
        chapter,
        subject: subjectById.get(material.subjectId) ?? null,
        score: keywordScore + directScore,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (ranked.length === 0) {
    return 'I could not find a direct match in local chapters. Try mentioning class, subject, or chapter name for better results.';
  }

  const lines = ranked.map((entry, index) => {
    const chapterTitle = entry.chapter?.title ?? entry.material.chapterId;
    const subjectName = entry.subject?.name ?? 'Offline Subject';
    const primaryText = entry.material.highlights[0] ?? entry.material.blocks[0] ?? entry.material.summary;
    return `${index + 1}. ${chapterTitle} (${subjectName}): ${buildSnippet(primaryText)}`;
  });

  return `Based on your offline materials, here is what I found:\n\n${lines.join('\n\n')}\n\nIf you want, ask me for a step-by-step explanation of any one chapter above.`;
}

export async function getChaptersBySubject(subjectId: string): Promise<OfflineChapter[]> {
  return studyDatabase.chapters.where('[subjectId+sortOrder]').between([subjectId, Dexie.minKey], [subjectId, Dexie.maxKey]).toArray();
}

export async function getMaterialsByChapter(chapterId: string): Promise<OfflineStudyMaterial[]> {
  const materials = await studyDatabase.content.where('chapterId').equals(chapterId).toArray();
  if (materials.length > 0) {
    return materials.sort((left, right) => left.sortOrder - right.sortOrder);
  }

  const legacyMaterials = await studyDatabase.studyMaterials.where('chapterId').equals(chapterId).toArray();
  return legacyMaterials.sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getStudyMaterialByKind(
  chapterId: string,
  kind: StudyMaterialKind
): Promise<OfflineStudyMaterial | null> {
  const material = await studyDatabase.content.where('[chapterId+kind]').equals([chapterId, kind]).first();
  if (material) {
    return material;
  }

  return (await studyDatabase.studyMaterials.where('[chapterId+kind]').equals([chapterId, kind]).first()) ?? null;
}

export async function getBookmarkByChapter(chapterId: string): Promise<OfflineBookmark | null> {
  return (await studyDatabase.bookmarks.get(chapterId)) ?? null;
}

export async function getBookmarks(): Promise<OfflineBookmark[]> {
  return studyDatabase.bookmarks.orderBy('updatedAt').reverse().toArray();
}

export async function getBookmarkedChapters(): Promise<OfflineBookmarkedChapter[]> {
  const bookmarks = await getBookmarks();
  if (bookmarks.length === 0) {
    return [];
  }

  const chapterIds = bookmarks.map((bookmark) => bookmark.chapterId);
  const chapters = await studyDatabase.chapters.bulkGet(chapterIds);
  const chapterMap = new Map(chapters.filter((chapter): chapter is OfflineChapter => chapter != null).map((chapter) => [chapter.id, chapter]));

  const subjectIds = [...new Set(bookmarks.map((bookmark) => bookmark.subjectId))];
  const subjects = await studyDatabase.subjects.bulkGet(subjectIds);
  const subjectMap = new Map(subjects.filter((subject): subject is OfflineSubject => subject != null).map((subject) => [subject.id, subject]));

  return bookmarks
    .map((bookmark) => {
      const chapter = chapterMap.get(bookmark.chapterId);
      if (!chapter) {
        return null;
      }

      return {
        bookmark,
        chapter,
        subject: subjectMap.get(bookmark.subjectId) ?? null,
      } satisfies OfflineBookmarkedChapter;
    })
    .filter((row): row is OfflineBookmarkedChapter => row !== null);
}

export async function toggleBookmark(chapterId: string): Promise<boolean> {
  const chapter = await studyDatabase.chapters.get(chapterId);
  if (!chapter) {
    return false;
  }

  const existing = await studyDatabase.bookmarks.get(chapterId);
  if (existing) {
    await studyDatabase.bookmarks.delete(chapterId);
    emitOfflineStudyUpdated({ source: 'bookmark-toggle', chapterId, bookmarked: false });
    return false;
  }

  const timestamp = getTimestamp();
  await studyDatabase.bookmarks.put({
    id: chapterId,
    chapterId,
    subjectId: chapter.subjectId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  emitOfflineStudyUpdated({ source: 'bookmark-toggle', chapterId, bookmarked: true });
  return true;
}

export async function getBookmarkCount(): Promise<number> {
  return studyDatabase.bookmarks.count();
}

export async function removeBookmark(chapterId: string): Promise<void> {
  await studyDatabase.bookmarks.delete(chapterId);
  emitOfflineStudyUpdated({ source: 'bookmark-remove', chapterId });
}

export async function clearBookmarks(chapterId?: string): Promise<void> {
  if (chapterId) {
    await studyDatabase.bookmarks.delete(chapterId);
    emitOfflineStudyUpdated({ source: 'bookmark-clear', chapterId });
    return;
  }

  await studyDatabase.bookmarks.clear();
  emitOfflineStudyUpdated({ source: 'bookmark-clear' });
}

// Compatibility alias for callers still using clearMarks.
export async function clearMarks(chapterId?: string): Promise<void> {
  await clearBookmarks(chapterId);
}

export async function clearOfflineContentData(): Promise<void> {
  await studyDatabase.transaction(
    'rw',
    studyDatabase.subjects,
    studyDatabase.chapters,
    studyDatabase.content,
    studyDatabase.studyMaterials,
    studyDatabase.quizzes,
    studyDatabase.bookmarks,
    studyDatabase.chatMessages,
    studyDatabase.progress,
    studyDatabase.quizAnswers,
    studyDatabase.quizResults,
    studyDatabase.meta,
    async () => {
      await Promise.all([
        studyDatabase.subjects.clear(),
        studyDatabase.chapters.clear(),
        studyDatabase.content.clear(),
        studyDatabase.studyMaterials.clear(),
        studyDatabase.quizzes.clear(),
        studyDatabase.bookmarks.clear(),
        studyDatabase.chatMessages.clear(),
        studyDatabase.progress.clear(),
        studyDatabase.quizAnswers.clear(),
        studyDatabase.quizResults.clear(),
        studyDatabase.meta.clear(),
      ]);
    }
  );

  emitOfflineStudyUpdated({ source: 'offline-clear-all' });
}

export async function addChatMessage(role: 'user' | 'assistant', content: string): Promise<OfflineChatMessage> {
  const message: OfflineChatMessage = {
    id: `chat:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: getTimestamp(),
  };

  await studyDatabase.chatMessages.put(message);
  emitOfflineStudyUpdated({ source: 'chat-message', messageId: message.id });
  return message;
}

export async function getChatMessages(limit = 200): Promise<OfflineChatMessage[]> {
  const safeLimit = Math.max(1, limit);
  return studyDatabase.chatMessages.orderBy('createdAt').reverse().limit(safeLimit).toArray().then((rows) => rows.reverse());
}

export async function clearChatMessages(): Promise<void> {
  await studyDatabase.chatMessages.clear();
  emitOfflineStudyUpdated({ source: 'chat-clear' });
}

export async function getTextbookByChapter(chapterId: string): Promise<OfflineStudyMaterial | null> {
  return getStudyMaterialByKind(chapterId, 'textbook');
}

export async function getNotesByChapter(chapterId: string): Promise<OfflineStudyMaterial | null> {
  return getStudyMaterialByKind(chapterId, 'notes');
}

export async function getQuizById(quizId: string): Promise<OfflineQuiz | null> {
  const quiz = await studyDatabase.quizzes.get(quizId);
  return quiz ?? null;
}

export async function getAllQuizzes(): Promise<OfflineQuiz[]> {
  return studyDatabase.quizzes.orderBy('updatedAt').reverse().toArray();
}

export async function getFeaturedQuiz(): Promise<OfflineQuiz | null> {
  const quiz = await studyDatabase.quizzes.get('quick-revision');
  if (quiz) {
    return quiz;
  }

  return (await studyDatabase.quizzes.orderBy('updatedAt').reverse().first()) ?? null;
}

export async function getQuizForChapter(chapterId: string): Promise<OfflineQuiz | null> {
  const chapterQuiz = await studyDatabase.quizzes.where('chapterId').equals(chapterId).first();

  if (chapterQuiz) {
    return chapterQuiz;
  }

  return getFeaturedQuiz();
}

export async function getChapterProgress(chapterId: string): Promise<ChapterProgress | null> {
  const progress = await studyDatabase.progress.get(chapterId);
  return progress ?? null;
}

export async function getChapterProgressMap(chapterIds: string[]): Promise<Record<string, ChapterProgress>> {
  if (chapterIds.length === 0) {
    return {};
  }

  const progressRows = await studyDatabase.progress.bulkGet(chapterIds);

  return progressRows.reduce<Record<string, ChapterProgress>>((accumulator, progress) => {
    if (progress) {
      accumulator[progress.chapterId] = progress;
    }

    return accumulator;
  }, {});
}

export async function saveChapterProgress(
  chapterId: string,
  updates: Partial<Pick<ChapterProgress, 'completed' | 'lastPosition'>>
): Promise<ChapterProgress> {
  const currentProgress = await studyDatabase.progress.get(chapterId);
  const nextProgress: ChapterProgress = {
    id: chapterId,
    chapterId,
    completed: updates.completed ?? currentProgress?.completed ?? false,
    lastPosition: Math.max(0, Math.round(updates.lastPosition ?? currentProgress?.lastPosition ?? 0)),
    updatedAt: getTimestamp(),
  };

  await studyDatabase.transaction('rw', studyDatabase.progress, studyDatabase.chapters, async () => {
    await studyDatabase.progress.put(nextProgress);

    const chapter = await studyDatabase.chapters.get(chapterId);
    if (chapter) {
      await studyDatabase.chapters.put({
        ...chapter,
        completed: nextProgress.completed,
      });
    }
  });

  if ((currentProgress?.completed ?? false) !== nextProgress.completed) {
    emitOfflineStudyUpdated({ source: 'chapter-progress', chapterId, completed: nextProgress.completed });
  }

  return nextProgress;
}

export async function markChapterCompleted(chapterId: string, completed = true): Promise<ChapterProgress> {
  return saveChapterProgress(chapterId, { completed });
}

export async function saveChapterReadPosition(chapterId: string, lastPosition: number): Promise<ChapterProgress> {
  return saveChapterProgress(chapterId, { lastPosition });
}

export async function saveQuizAnswer(quizId: string, questionId: string, selectedAnswer: string): Promise<void> {
  await studyDatabase.quizAnswers.put({
    id: `${quizId}:${questionId}`,
    quizId,
    questionId,
    selectedAnswer,
    updatedAt: getTimestamp(),
  });
}

export async function getQuizAnswers(quizId: string): Promise<QuizAnswerRecord[]> {
  return studyDatabase.quizAnswers.where('quizId').equals(quizId).toArray();
}

export async function getQuizAnswerMap(quizId: string): Promise<Record<string, string>> {
  const answers = await getQuizAnswers(quizId);

  return answers.reduce<Record<string, string>>((accumulator, answer) => {
    accumulator[answer.questionId] = answer.selectedAnswer;
    return accumulator;
  }, {});
}

export async function clearQuizAnswers(quizId: string): Promise<void> {
  await studyDatabase.quizAnswers.where('quizId').equals(quizId).delete();
}

export async function saveQuizResult(input: {
  quizId: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
}): Promise<QuizResultRecord> {
  const completedAt = getTimestamp();
  const safeTotalQuestions = Math.max(0, Math.round(input.totalQuestions));
  const safeScore = Math.max(0, Math.min(Math.round(input.score), safeTotalQuestions));
  const percentage = safeTotalQuestions > 0 ? Math.round((safeScore / safeTotalQuestions) * 100) : 0;

  const resultRecord: QuizResultRecord = {
    id: `${input.quizId}:${completedAt}`,
    quizId: input.quizId,
    score: safeScore,
    totalQuestions: safeTotalQuestions,
    percentage,
    durationSeconds: Math.max(0, Math.round(input.durationSeconds)),
    completedAt,
  };

  await studyDatabase.quizResults.put(resultRecord);
  emitOfflineStudyUpdated({ source: 'quiz-result', quizId: input.quizId, percentage });

  return resultRecord;
}

export async function getLatestQuizResult(quizId: string): Promise<QuizResultRecord | null> {
  const results = await studyDatabase.quizResults.where('quizId').equals(quizId).toArray();

  if (results.length === 0) {
    return null;
  }

  results.sort((left, right) => right.completedAt.localeCompare(left.completedAt));
  return results[0];
}

export async function getRecentQuizResults(limit = 8): Promise<QuizResultRecord[]> {
  const safeLimit = Math.max(1, limit);
  return studyDatabase.quizResults.orderBy('completedAt').reverse().limit(safeLimit).toArray();
}

export async function getAllChapterProgress(): Promise<ChapterProgress[]> {
  return studyDatabase.progress.toArray();
}

export async function setMetaValue(key: string, value: string): Promise<void> {
  await studyDatabase.meta.put({ key, value, updatedAt: getTimestamp() });
}

export async function getMetaValue(key: string): Promise<string | null> {
  const value = await studyDatabase.meta.get(key);
  return value?.value ?? null;
}

export async function getOfflineChapterBundle(chapterId: string): Promise<OfflineChapterBundle | null> {
  const chapter = await getChapterById(chapterId);

  if (!chapter) {
    return null;
  }

  const [subject, progress, textbook, notes, quiz, bookmark] = await Promise.all([
    getSubjectById(chapter.subjectId),
    getChapterProgress(chapterId),
    getTextbookByChapter(chapterId),
    getNotesByChapter(chapterId),
    getQuizForChapter(chapterId),
    getBookmarkByChapter(chapterId),
  ]);

  return {
    subject: subject ?? null,
    chapter,
    progress,
    textbook,
    notes,
    quiz,
    isBookmarked: bookmark != null,
  };
}
