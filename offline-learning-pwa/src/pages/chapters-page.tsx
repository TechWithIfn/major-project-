import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { ProgressBar } from '../components/ui/progress-bar';
import { useOfflineSubjectChapters } from '../hooks/use-offline-study';

export function ChaptersPage() {
  const { subjectId } = useParams();
  const { data, isLoading, error } = useOfflineSubjectChapters(subjectId);
  const { subject, chapters, progressByChapter } = data;

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

      {chapters.length === 0 ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No local chapters are available for this subject yet.</p> : null}

      <div className="mt-5 space-y-3">
        {chapters.map((chapter) => {
          const progress = progressByChapter[chapter.id];
          const isCompleted = progress?.completed ?? chapter.completed;
          const canResume = (progress?.lastPosition ?? 0) > 80 && !isCompleted;

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
              <ProgressBar value={chapter.progress} />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Progress: {chapter.progress}%</p>
              {canResume ? <p className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-400">Saved reading position available.</p> : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/subjects/${subject.id}/chapters/${chapter.id}/read`}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                {canResume ? 'Continue Chapter' : 'Open Chapter'}
              </Link>

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
    </section>
  );
}