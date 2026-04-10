import { type RefObject } from 'react';
import { Bookmark, BookmarkCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { ProgressBar } from './progress-bar';

type StudyMaterialReaderProps = {
  chapterTitle: string;
  subjectName?: string | null;
  chapterProgress: number;
  quizTitle?: string | null;
  isBookmarked: boolean;
  isBookmarkUpdating?: boolean;
  onToggleBookmark: () => void;
  resumePosition: number;
  onResumeReading: () => void;
  isCompleted: boolean;
  onMarkCompleted: () => void;
  articleRef: RefObject<HTMLElement>;
  textbookTitle?: string | null;
  textbookSummary?: string | null;
  textbookBlocks: string[];
  notesTitle?: string | null;
  notesSummary?: string | null;
  noteHighlights: string[];
  noteBlocks: string[];
};

export function StudyMaterialReader({
  chapterTitle,
  subjectName,
  chapterProgress,
  quizTitle,
  isBookmarked,
  isBookmarkUpdating = false,
  onToggleBookmark,
  resumePosition,
  onResumeReading,
  isCompleted,
  onMarkCompleted,
  articleRef,
  textbookTitle,
  textbookSummary,
  textbookBlocks,
  notesTitle,
  notesSummary,
  noteHighlights,
  noteBlocks,
}: StudyMaterialReaderProps) {
  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Study Reader</p>
            <h2 className="text-2xl font-bold">{chapterTitle}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subjectName ?? 'Offline subject'} content is available locally in IndexedDB.</p>
          </div>
          <button
            type="button"
            onClick={onToggleBookmark}
            disabled={isBookmarkUpdating}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            {isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
          </button>
        </div>

        <div className="mt-4">
          <ProgressBar value={chapterProgress} />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reading progress: {chapterProgress}%</p>
          {quizTitle ? <p className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-400">Quiz bundle ready offline: {quizTitle}</p> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {resumePosition > 80 ? (
            <button
              type="button"
              onClick={onResumeReading}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
            >
              <RotateCcw size={16} />
              Resume Reading
            </button>
          ) : null}

          <button
            type="button"
            onClick={onMarkCompleted}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold',
              isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-600 text-white hover:bg-emerald-700',
            ].join(' ')}
          >
            <CheckCircle2 size={16} />
            {isCompleted ? 'Chapter Completed' : 'Mark Completed'}
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
        <article ref={articleRef} className="max-h-[65vh] space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 leading-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900">Important: Textbook content is cached locally, so students can revise the full chapter without internet.</p>
          <h3 className="text-lg font-semibold">{textbookTitle ?? 'Offline Textbook'}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{textbookSummary ?? 'No textbook summary is available for this chapter.'}</p>

          {textbookBlocks.map((paragraph, index) => (
            <p key={`textbook-${index}`} className={index % 2 === 1 ? 'rounded-lg bg-teal-50 px-3 py-2 dark:bg-slate-800' : ''}>
              {paragraph}
            </p>
          ))}
        </article>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="text-lg font-semibold">{notesTitle ?? 'Offline Notes'}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{notesSummary ?? 'No note summary is available for this chapter.'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quick Revision Notes</p>
            <ul className="mt-3 space-y-2">
              {noteHighlights.map((highlight) => (
                <li key={highlight} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            {noteBlocks.map((block, index) => (
              <p key={`note-${index}`} className="text-sm text-slate-600 dark:text-slate-300">
                {block}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
