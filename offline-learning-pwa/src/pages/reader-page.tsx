import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { ProgressBar } from '../components/ui/progress-bar';
import { useOfflineChapterBundle } from '../hooks/use-offline-study';
import { markChapterCompleted, saveChapterReadPosition } from '../lib/db';
import { getBookmarks, toggleBookmark } from '../lib/storage';

export function ReaderPage() {
  const { chapterId } = useParams();
  const { data: chapterBundle, isLoading, error } = useOfflineChapterBundle(chapterId);
  const [bookmarks, setBookmarks] = useState<string[]>(() => getBookmarks());
  const [isCompleted, setIsCompleted] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const articleRef = useRef<HTMLElement | null>(null);
  const restoredRef = useRef(false);
  const savedPositionRef = useRef(0);

  const isBookmarked = useMemo(() => bookmarks.includes(chapterId ?? ''), [bookmarks, chapterId]);

  if (isLoading) {
    return <p className="rounded-xl bg-slate-100 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading offline chapter content...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
  }

  if (!chapterId || !chapterBundle) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">Chapter not found.</p>;
  }

  const { chapter, notes, quiz, subject, textbook } = chapterBundle;

  useEffect(() => {
    const nextCompleted = chapterBundle.progress?.completed ?? chapter.completed;
    const nextPosition = chapterBundle.progress?.lastPosition ?? 0;

    setIsCompleted(nextCompleted);
    setResumePosition(nextPosition);
    savedPositionRef.current = nextPosition;
    restoredRef.current = false;
  }, [chapter.id, chapter.completed, chapterBundle.progress?.completed, chapterBundle.progress?.lastPosition]);

  useEffect(() => {
    const articleElement = articleRef.current;

    if (!articleElement || restoredRef.current || resumePosition <= 0) {
      return;
    }

    const restoreHandle = window.requestAnimationFrame(() => {
      articleElement.scrollTo({ top: resumePosition, behavior: 'auto' });
      restoredRef.current = true;
    });

    return () => {
      window.cancelAnimationFrame(restoreHandle);
    };
  }, [resumePosition, chapter.id]);

  useEffect(() => {
    const articleElement = articleRef.current;

    if (!articleElement) {
      return undefined;
    }

    let saveTimeout: number | null = null;

    const persistProgress = (scrollTop: number, reachedEnd: boolean) => {
      const normalizedTop = Math.max(0, Math.round(scrollTop));
      const shouldSavePosition = Math.abs(normalizedTop - savedPositionRef.current) >= 72;

      if (!shouldSavePosition && !reachedEnd) {
        return;
      }

      savedPositionRef.current = normalizedTop;
      setResumePosition(normalizedTop);
      void saveChapterReadPosition(chapter.id, normalizedTop);

      if (reachedEnd && !isCompleted) {
        setIsCompleted(true);
        void markChapterCompleted(chapter.id, true);
      }
    };

    const handleScroll = () => {
      const reachedEnd = articleElement.scrollTop + articleElement.clientHeight >= articleElement.scrollHeight - 24;

      if (saveTimeout) {
        window.clearTimeout(saveTimeout);
      }

      saveTimeout = window.setTimeout(() => {
        persistProgress(articleElement.scrollTop, reachedEnd);
      }, 180);
    };

    articleElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      articleElement.removeEventListener('scroll', handleScroll);

      if (saveTimeout) {
        window.clearTimeout(saveTimeout);
      }
    };
  }, [chapter.id, isCompleted]);

  const handleBookmark = () => {
    setBookmarks(toggleBookmark(chapterId));
  };

  const handleResumeReading = () => {
    if (!articleRef.current) {
      return;
    }

    articleRef.current.scrollTo({ top: resumePosition, behavior: 'smooth' });
  };

  const handleMarkCompleted = async () => {
    setIsCompleted(true);
    await markChapterCompleted(chapter.id, true);
  };

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Study Reader</p>
            <h2 className="text-2xl font-bold">{chapter.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subject?.name ?? 'Offline subject'} content is available locally in IndexedDB.</p>
          </div>
          <button
            type="button"
            onClick={handleBookmark}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            {isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
          </button>
        </div>

        <div className="mt-4">
          <ProgressBar value={chapter.progress} />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reading progress: {chapter.progress}%</p>
          {quiz ? <p className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-400">Quiz bundle ready offline: {quiz.title}</p> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {resumePosition > 80 ? (
            <button
              type="button"
              onClick={handleResumeReading}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
            >
              <RotateCcw size={16} />
              Resume Reading
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleMarkCompleted}
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
          <h3 className="text-lg font-semibold">{textbook?.title ?? 'Offline Textbook'}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{textbook?.summary ?? 'No textbook summary is available for this chapter.'}</p>

          {(textbook?.blocks ?? []).map((paragraph, index) => (
            <p key={`${chapter.id}-textbook-${index}`} className={index % 2 === 1 ? 'rounded-lg bg-teal-50 px-3 py-2 dark:bg-slate-800' : ''}>
              {paragraph}
            </p>
          ))}
        </article>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="text-lg font-semibold">{notes?.title ?? 'Offline Notes'}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{notes?.summary ?? 'No note summary is available for this chapter.'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quick Revision Notes</p>
            <ul className="mt-3 space-y-2">
              {(notes?.highlights ?? []).map((highlight) => (
                <li key={highlight} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            {(notes?.blocks ?? []).map((block, index) => (
              <p key={`${chapter.id}-note-${index}`} className="text-sm text-slate-600 dark:text-slate-300">
                {block}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}