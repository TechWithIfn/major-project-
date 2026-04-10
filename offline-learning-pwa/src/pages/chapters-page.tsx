import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { ProgressBar } from '../components/ui/progress-bar';
import { useOfflineSubjectChapters, useProgressTracker } from '../hooks/use-offline-study';
import { useEffect, useState } from 'react';

export function ChaptersPage() {
  const { subjectId } = useParams();
  const { data, isLoading, error } = useOfflineSubjectChapters(subjectId);
  const { updatingChapterId, error: trackingError, setChapterCompleted } = useProgressTracker();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { subject, chapters, progressByChapter } = data;

  const completedCount = chapters.filter((chapter) => {
    const progress = progressByChapter[chapter.id];
    return progress?.completed ?? chapter.completed;
  }).length;
  const subjectCompletion = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toastMessage]);

  if (isLoading) {
    return <p className="rounded-xl bg-slate-100 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading offline chapters...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
  }

  if (!subject) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">Subject not found.</p>;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold">{subject.name} Chapters</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Tap any chapter to open the study reader. Textbooks and notes are loaded from local IndexedDB storage.</p>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>Subject progress</span>
          <span className="font-semibold">{completedCount}/{chapters.length} completed</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={subjectCompletion} />
        </div>
      </div>
      {trackingError ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{trackingError}</p> : null}

      {chapters.length === 0 ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No local chapters are available for this subject yet.</p> : null}

      <div className="mt-5 space-y-3">
        {chapters.map((chapter) => {
          const progress = progressByChapter[chapter.id];
          const isCompleted = progress?.completed ?? chapter.completed;
          const canResume = (progress?.lastPosition ?? 0) > 80 && !isCompleted;
          const displayProgress = isCompleted ? 100 : chapter.progress;

          return (
            <article
              key={chapter.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900"
            >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{chapter.title}</h3>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 size={14} />
                    Completed
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{chapter.estimatedReadMinutes} mins</span>
            </div>

            <div className="mt-3">
              <ProgressBar value={displayProgress} />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Progress: {displayProgress}%</p>
              {canResume ? <p className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-400">Saved reading position available.</p> : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/subjects/${subject.id}/chapters/${chapter.id}/read`}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                {canResume ? 'Continue Chapter' : 'Open Chapter'}
              </Link>

              <button
                type="button"
                disabled={updatingChapterId === chapter.id}
                onClick={() => {
                  const nextCompleted = !isCompleted;
                  void setChapterCompleted(chapter.id, nextCompleted).then((success) => {
                    setToastMessage(
                      success
                        ? nextCompleted
                          ? 'Chapter marked complete.'
                          : 'Chapter marked incomplete.'
                        : 'Unable to update chapter progress.'
                    );
                  });
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                {updatingChapterId === chapter.id ? 'Saving...' : isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
              </button>

              {canResume ? (
                <Link
                  to={`/subjects/${subject.id}/chapters/${chapter.id}/read`}
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  <RotateCcw size={16} />
                  Resume Reading
                </Link>
              ) : null}
            </div>
          </article>
          );
        })}
      </div>
      {toastMessage ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {toastMessage}
        </div>
      ) : null}
    </section>
  );
}