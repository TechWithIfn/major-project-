import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StudyMaterialReader } from '../components/ui/study-material-reader';
import { useChapterBookmark } from '../hooks/use-bookmarks';
import { useOfflineChapterBundle } from '../hooks/use-offline-study';
import { markChapterCompleted, saveChapterReadPosition } from '../lib/db';

export function ReaderPage() {
  const { subjectId, chapterId } = useParams();
  const { data: chapterBundle, isLoading, error } = useOfflineChapterBundle(chapterId);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const restoredRef = useRef(false);
  const savedPositionRef = useRef(0);
  const { isBookmarked, isUpdating: isBookmarkUpdating, error: bookmarkError, toggle: toggleChapterBookmark } = useChapterBookmark(
    chapterId,
    chapterBundle?.isBookmarked ?? false
  );

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
    return <p className="rounded-xl bg-slate-100 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading offline chapter content...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
  }

  if (!subjectId || !chapterId || !chapterBundle) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">Chapter not found.</p>;
  }

  if (chapterBundle.chapter.subjectId !== subjectId) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">Chapter does not belong to this subject.</p>;
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

  const handleBookmark = async () => {
    const nextBookmarked = await toggleChapterBookmark();
    if (nextBookmarked === null) {
      setToastMessage('Unable to update bookmark.');
      return;
    }

    setToastMessage(nextBookmarked ? 'Bookmark saved.' : 'Bookmark removed.');
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
    <>
      {bookmarkError ? <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{bookmarkError}</p> : null}
      <StudyMaterialReader
        chapterTitle={chapter.title}
        subjectName={subject?.name}
        chapterProgress={chapter.progress}
        quizTitle={quiz?.title}
        isBookmarked={isBookmarked}
        isBookmarkUpdating={isBookmarkUpdating}
        onToggleBookmark={() => {
          void handleBookmark();
        }}
        resumePosition={resumePosition}
        onResumeReading={handleResumeReading}
        isCompleted={isCompleted}
        onMarkCompleted={() => {
          void handleMarkCompleted();
        }}
        articleRef={articleRef}
        textbookTitle={textbook?.title}
        textbookSummary={textbook?.summary}
        textbookBlocks={textbook?.blocks ?? []}
        notesTitle={notes?.title}
        notesSummary={notes?.summary}
        noteHighlights={notes?.highlights ?? []}
        noteBlocks={notes?.blocks ?? []}
      />
      {toastMessage ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}