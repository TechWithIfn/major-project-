import { useLiveQuery } from 'dexie-react-hooks';
import { getAllChapterProgress, getAllChapters, getBookmarkedChapters, getRecentQuizResults, getSubjects } from '../lib/db';
import type { DashboardActivityItem } from '../types';

type DashboardMetrics = {
  totalSubjects: number;
  completedChapters: number;
  bookmarksCount: number;
  recentActivity: DashboardActivityItem[];
};

type DashboardMetricsState = {
  data: DashboardMetrics;
  isLoading: boolean;
  error: string | null;
};

export function useDashboardMetrics(): DashboardMetricsState {
  const data = useLiveQuery(async () => {
    const [subjects, chapters, progressRows, bookmarks, recentQuizResults] = await Promise.all([
      getSubjects(),
      getAllChapters(),
      getAllChapterProgress(),
      getBookmarkedChapters(),
      getRecentQuizResults(8),
    ]);

    const progressByChapter = new Map(progressRows.map((row) => [row.chapterId, row]));
    const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
    const completedChapters = chapters.reduce((count, chapter) => {
      const progress = progressByChapter.get(chapter.id);
      return count + (progress?.completed ?? chapter.completed ? 1 : 0);
    }, 0);

    const bookmarkActivity: DashboardActivityItem[] = bookmarks.map((entry) => ({
      id: `bookmark:${entry.bookmark.id}:${entry.bookmark.updatedAt}`,
      kind: 'bookmark',
      timestamp: entry.bookmark.updatedAt,
      message: `Bookmarked ${entry.chapter.title} in ${entry.subject?.name ?? 'offline subject'}`,
    }));

    const completionActivity: DashboardActivityItem[] = progressRows
      .filter((progress) => progress.completed)
      .map((progress) => {
        const chapter = chapterById.get(progress.chapterId);
        return {
          id: `complete:${progress.chapterId}:${progress.updatedAt}`,
          kind: 'completion',
          timestamp: progress.updatedAt,
          message: `Completed chapter ${chapter?.title ?? progress.chapterId}`,
        };
      });

    const quizActivity: DashboardActivityItem[] = recentQuizResults.map((result) => ({
      id: `quiz:${result.id}`,
      kind: 'quiz',
      timestamp: result.completedAt,
      message: `Finished ${result.quizId} with ${result.percentage}%`,
    }));

    const recentActivity = [...bookmarkActivity, ...completionActivity, ...quizActivity]
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 10);

    return {
      totalSubjects: subjects.length,
      completedChapters,
      bookmarksCount: bookmarks.length,
      recentActivity,
    };
  }, []);

  return {
    data: data ?? {
      totalSubjects: 0,
      completedChapters: 0,
      bookmarksCount: 0,
      recentActivity: [],
    },
    isLoading: data === undefined,
    error: null,
  };
}
