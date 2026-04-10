import { CheckCircle2, Circle, Clock3 } from 'lucide-react';
import { ProgressBar } from '../components/ui/progress-bar';
import { useProgressDashboard, useProgressTracker } from '../hooks/use-offline-study';

export function ProgressDashboardPage() {
  const { data, isLoading, error } = useProgressDashboard();
  const { updatingChapterId, error: trackingError, setChapterCompleted } = useProgressTracker();

  if (isLoading) {
    return <p className="rounded-xl bg-slate-100 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading chapter progress dashboard...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
  }

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-2xl font-bold">Progress Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Chapter-level completion and recent quiz performance are stored locally in Dexie.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Subjects</p>
          <p className="mt-1 text-2xl font-bold">{data.totalSubjects}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Chapters Completed</p>
          <p className="mt-1 text-2xl font-bold">
            {data.completedChapters} / {data.totalChapters}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
          <p className="mt-1 text-2xl font-bold">{data.completionRate}%</p>
          <div className="mt-2">
            <ProgressBar value={data.completionRate} />
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Quiz Attempts</p>
          <p className="mt-1 text-2xl font-bold">{data.recentQuizResults.length}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Chapter Progress by Subject</h3>
          {trackingError ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{trackingError}</p> : null}
          <div className="mt-4 space-y-4">
            {data.subjectSummaries.map((summary) => (
              <section key={summary.subjectId} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold">{summary.subjectName}</h4>
                  <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                    {summary.completedChapters}/{summary.totalChapters} complete
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={summary.completionRate} />
                </div>
                <ul className="mt-3 space-y-2">
                  {summary.chapters.map((chapter) => (
                    <li key={chapter.chapterId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/70">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-2">
                          {chapter.completed ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-slate-400" />}
                          {chapter.title}
                        </span>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{chapter.lastPosition > 0 ? `Last position ${chapter.lastPosition}px` : 'Not started'}</p>
                      </div>
                      <button
                        type="button"
                        disabled={updatingChapterId === chapter.chapterId}
                        onClick={() => {
                          void setChapterCompleted(chapter.chapterId, !chapter.completed);
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:hover:bg-slate-700"
                      >
                        {updatingChapterId === chapter.chapterId ? 'Saving...' : chapter.completed ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Recent Quiz Results</h3>
          {data.recentQuizResults.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">No quiz attempts are stored yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.recentQuizResults.map((result) => (
                <li key={result.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{result.quizId}</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Score {result.score}/{result.totalQuestions} ({result.percentage}%)
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock3 size={13} />
                    {Math.max(1, Math.round(result.durationSeconds / 60))} min · {new Date(result.completedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </section>
  );
}