import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import type {
  DashboardSnapshot,
  ChapterProgress,
  OfflineBookmarkedChapter,
  OfflineChapter,
  OfflineChapterBundle,
  OfflineQuiz,
  OfflineSubject,
  ProgressDashboardSnapshot,
  QuizResultRecord,
  SubjectProgressSummary,
} from '../types';
import {
  OFFLINE_STUDY_UPDATED_EVENT,
  getAllChapterProgress,
  getBookmarkedChapters,
  getBookmarkCount,
  getChapterProgressMap,
  getFeaturedQuiz,
  getLatestQuizResult,
  getOfflineChapterBundle,
  getMetaValue,
  markChapterCompleted,
  getQuizById,
  getRecentQuizResults,
  getSubjectById,
  getSubjects,
  getChaptersBySubject,
  studyDatabase,
} from '../lib/db';

type OfflineLoadState<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
};

export type OfflineSyncStatus = {
  status: 'idle' | 'syncing' | 'synced' | 'failed';
  isOnline: boolean;
  lastSuccessfulSyncAt: string | null;
  lastSyncRequestedAt: string | null;
  lastSyncFailedAt: string | null;
  lastContentRefreshAt: string | null;
};

type SubjectChapterState = {
  subject: OfflineSubject | null;
  chapters: OfflineChapter[];
  progressByChapter: Record<string, ChapterProgress>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Failed to load offline study data.';
}

function useOfflineLoader<T>(loader: () => Promise<T>, initialValue: T, dependencies: DependencyList): OfflineLoadState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleRefresh = () => {
      setRefreshToken((current) => current + 1);
    };

    window.addEventListener(OFFLINE_STUDY_UPDATED_EVENT, handleRefresh as EventListener);

    return () => {
      window.removeEventListener(OFFLINE_STUDY_UPDATED_EVENT, handleRefresh as EventListener);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);
    setData(initialValue);

    loader()
      .then((nextValue) => {
        if (isActive) {
          setData(nextValue);
        }
      })
      .catch((loadError) => {
        if (isActive) {
          setError(getErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [refreshToken, ...dependencies]);

  return { data, isLoading, error };
}

export function useOfflineSubjects(): OfflineLoadState<OfflineSubject[]> {
  return useOfflineLoader(() => getSubjects(), [], []);
}

export function useOfflineSubjectChapters(subjectId?: string): OfflineLoadState<SubjectChapterState> {
  return useOfflineLoader(
    async () => {
      if (!subjectId) {
        return { subject: null, chapters: [], progressByChapter: {} };
      }

      const [subject, chapters] = await Promise.all([getSubjectById(subjectId), getChaptersBySubject(subjectId)]);
      const progressByChapter = await getChapterProgressMap(chapters.map((chapter) => chapter.id));

      return {
        subject: subject ?? null,
        chapters,
        progressByChapter,
      };
    },
    { subject: null, chapters: [], progressByChapter: {} },
    [subjectId]
  );
}

export function useOfflineChapterBundle(chapterId?: string): OfflineLoadState<OfflineChapterBundle | null> {
  return useOfflineLoader(
    async () => {
      if (!chapterId) {
        return null;
      }

      return getOfflineChapterBundle(chapterId);
    },
    null,
    [chapterId]
  );
}

export function useOfflineQuiz(quizId?: string): OfflineLoadState<OfflineQuiz | null> {
  return useOfflineLoader(
    async () => {
      if (quizId) {
        return getQuizById(quizId);
      }

      return getFeaturedQuiz();
    },
    null,
    [quizId]
  );
}

export function useLatestQuizResult(quizId?: string): OfflineLoadState<QuizResultRecord | null> {
  return useOfflineLoader(
    async () => {
      if (!quizId) {
        return null;
      }

      return getLatestQuizResult(quizId);
    },
    null,
    [quizId]
  );
}

export function useProgressDashboard(): OfflineLoadState<ProgressDashboardSnapshot> {
  return useOfflineLoader(
    async () => {
      const [subjects, chapterProgressRows, recentQuizResults] = await Promise.all([
        getSubjects(),
        getAllChapterProgress(),
        getRecentQuizResults(10),
      ]);

      const progressByChapter = new Map(chapterProgressRows.map((progress) => [progress.chapterId, progress]));

      const subjectSummaries = (
        await Promise.all(
          subjects.map(async (subject) => {
            const chapters = await getChaptersBySubject(subject.id);

            const chapterRows = chapters.map((chapter) => {
              const progress = progressByChapter.get(chapter.id);
              return {
                chapterId: chapter.id,
                title: chapter.title,
                completed: progress?.completed ?? chapter.completed,
                lastPosition: progress?.lastPosition ?? 0,
              };
            });

            const completedChapters = chapterRows.filter((chapter) => chapter.completed).length;
            const totalChapters = chapterRows.length;
            const completionRate = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

            const summary: SubjectProgressSummary = {
              subjectId: subject.id,
              subjectName: subject.name,
              totalChapters,
              completedChapters,
              completionRate,
              chapters: chapterRows,
            };

            return summary;
          })
        )
      ).sort((left, right) => left.subjectName.localeCompare(right.subjectName));

      const totalChapters = subjectSummaries.reduce((total, summary) => total + summary.totalChapters, 0);
      const completedChapters = subjectSummaries.reduce((total, summary) => total + summary.completedChapters, 0);
      const completionRate = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

      return {
        totalSubjects: subjects.length,
        totalChapters,
        completedChapters,
        completionRate,
        recentQuizResults,
        subjectSummaries,
      };
    },
    {
      totalSubjects: 0,
      totalChapters: 0,
      completedChapters: 0,
      completionRate: 0,
      recentQuizResults: [],
      subjectSummaries: [],
    },
    []
  );
}

export function useOfflineBookmarks(): OfflineLoadState<OfflineBookmarkedChapter[]> {
  return useOfflineLoader(() => getBookmarkedChapters(), [], []);
}

type OfflineAppOverview = {
  subjects: number;
  chapters: number;
  content: number;
  quizzes: number;
  bookmarks: number;
};

export function useOfflineAppOverview(): OfflineLoadState<OfflineAppOverview> {
  return useOfflineLoader(
    async () => {
      const [subjects, chapters, content, quizzes, bookmarks] = await Promise.all([
        studyDatabase.subjects.count(),
        studyDatabase.chapters.count(),
        studyDatabase.content.count(),
        studyDatabase.quizzes.count(),
        getBookmarkCount(),
      ]);

      return { subjects, chapters, content, quizzes, bookmarks };
    },
    {
      subjects: 0,
      chapters: 0,
      content: 0,
      quizzes: 0,
      bookmarks: 0,
    },
    []
  );
}

export function useOfflineSyncStatus(): OfflineLoadState<OfflineSyncStatus> {
  return useOfflineLoader(
    async () => {
      const [
        lastSuccessfulSyncAt,
        lastSyncRequestedAt,
        lastSyncFailedAt,
        lastContentRefreshAt,
        lastSyncStatus,
      ] = await Promise.all([
        getMetaValue('lastSuccessfulSyncAt'),
        getMetaValue('lastSyncRequestedAt'),
        getMetaValue('lastSyncFailedAt'),
        getMetaValue('lastContentRefreshAt'),
        getMetaValue('lastSyncStatus'),
      ]);

      const normalizedStatus: OfflineSyncStatus['status'] =
        lastSyncStatus === 'synced'
          ? 'synced'
          : lastSyncStatus === 'failed'
            ? 'failed'
            : lastSyncStatus === 'syncing'
              ? 'syncing'
              : 'idle';

      return {
        status: normalizedStatus,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        lastSuccessfulSyncAt,
        lastSyncRequestedAt,
        lastSyncFailedAt,
        lastContentRefreshAt,
      };
    },
    {
      status: 'idle',
      isOnline: true,
      lastSuccessfulSyncAt: null,
      lastSyncRequestedAt: null,
      lastSyncFailedAt: null,
      lastContentRefreshAt: null,
    },
    []
  );
}

export function useDashboardSnapshot(): OfflineLoadState<DashboardSnapshot> {
  return useOfflineLoader(
    async () => {
      const [subjects, chapters, progressRows, bookmarks, quizResults] = await Promise.all([
        getSubjects(),
        studyDatabase.chapters.toArray(),
        getAllChapterProgress(),
        getBookmarkedChapters(),
        getRecentQuizResults(6),
      ]);

      const progressByChapter = new Map(progressRows.map((row) => [row.chapterId, row]));
      const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]));

      const completedChapters = chapters.reduce((count, chapter) => {
        const progress = progressByChapter.get(chapter.id);
        return count + (progress?.completed ?? chapter.completed ? 1 : 0);
      }, 0);

      const bookmarkActivities = bookmarks.map((entry) => ({
        id: `bookmark:${entry.bookmark.id}:${entry.bookmark.updatedAt}`,
        kind: 'bookmark' as const,
        timestamp: entry.bookmark.updatedAt,
        message: `Bookmarked "${entry.chapter.title}" in ${entry.subject?.name ?? 'offline subject'}`,
      }));

      const quizActivities = quizResults.map((result) => ({
        id: `quiz:${result.id}`,
        kind: 'quiz' as const,
        timestamp: result.completedAt,
        message: `Completed ${result.quizId} with ${result.percentage}% score`,
      }));

      const completionActivities = progressRows
        .filter((row) => row.completed)
        .map((row) => ({
          id: `complete:${row.id}:${row.updatedAt}`,
          kind: 'completion' as const,
          timestamp: row.updatedAt,
          message: `Completed chapter "${chapterMap.get(row.chapterId)?.title ?? row.chapterId}"`,
        }));

      const recentActivity = [...bookmarkActivities, ...quizActivities, ...completionActivities]
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
        .slice(0, 8);

      return {
        totalSubjects: subjects.length,
        completedChapters,
        bookmarkedItems: bookmarks.length,
        recentActivity,
      };
    },
    {
      totalSubjects: 0,
      completedChapters: 0,
      bookmarkedItems: 0,
      recentActivity: [],
    },
    []
  );
}

export function useProgressTracker() {
  const [updatingChapterId, setUpdatingChapterId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setChapterCompleted = async (chapterId: string, completed: boolean) => {
    setUpdatingChapterId(chapterId);
    setError(null);

    try {
      await markChapterCompleted(chapterId, completed);
      return true;
    } catch (updateError) {
      setError(getErrorMessage(updateError));
      return false;
    } finally {
      setUpdatingChapterId(null);
    }
  };

  return {
    updatingChapterId,
    error,
    setChapterCompleted,
  };
}