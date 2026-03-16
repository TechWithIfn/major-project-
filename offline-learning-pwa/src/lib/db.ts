import Dexie, { type Table } from 'dexie';
import type {
  ChapterProgress,
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
  studyMaterials!: Table<OfflineStudyMaterial, string>;
  quizzes!: Table<OfflineQuiz, string>;
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
  await studyDatabase.studyMaterials.put(material);
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
  const mergedChapters = bundle.chapters.map((chapter) => ({
    ...chapter,
    completed: completionMap.get(chapter.id)?.completed ?? chapter.completed,
  }));

  await studyDatabase.transaction(
    'rw',
    studyDatabase.subjects,
    studyDatabase.chapters,
    studyDatabase.studyMaterials,
    studyDatabase.quizzes,
    studyDatabase.meta,
    async () => {
      await studyDatabase.subjects.bulkPut(bundle.subjects);
      await studyDatabase.chapters.bulkPut(mergedChapters);
      await studyDatabase.studyMaterials.bulkPut(bundle.materials);
      await studyDatabase.quizzes.bulkPut(bundle.quizzes);
      await studyDatabase.meta.put({
        key: 'seededAt',
        value: bundle.seededAt,
        updatedAt: bundle.seededAt,
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

export async function getChaptersBySubject(subjectId: string): Promise<OfflineChapter[]> {
  return studyDatabase.chapters.where('[subjectId+sortOrder]').between([subjectId, Dexie.minKey], [subjectId, Dexie.maxKey]).toArray();
}

export async function getMaterialsByChapter(chapterId: string): Promise<OfflineStudyMaterial[]> {
  const materials = await studyDatabase.studyMaterials.where('chapterId').equals(chapterId).toArray();
  return materials.sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getStudyMaterialByKind(
  chapterId: string,
  kind: StudyMaterialKind
): Promise<OfflineStudyMaterial | null> {
  const material = await studyDatabase.studyMaterials.where('[chapterId+kind]').equals([chapterId, kind]).first();
  return material ?? null;
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

  const [subject, progress, textbook, notes, quiz] = await Promise.all([
    getSubjectById(chapter.subjectId),
    getChapterProgress(chapterId),
    getTextbookByChapter(chapterId),
    getNotesByChapter(chapterId),
    getQuizForChapter(chapterId),
  ]);

  return {
    subject: subject ?? null,
    chapter,
    progress,
    textbook,
    notes,
    quiz,
  };
}
