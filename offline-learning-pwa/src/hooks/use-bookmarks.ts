import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getBookmarkedChapters, getBookmarkByChapter, toggleBookmark } from '../lib/db';

export function useChapterBookmark(chapterId?: string, initialValue = false) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookmark = useLiveQuery(async () => {
    if (!chapterId) {
      return null;
    }

    return getBookmarkByChapter(chapterId);
  }, [chapterId]);

  const isBookmarked = bookmark === undefined ? initialValue : bookmark !== null;

  const toggle = async (): Promise<boolean | null> => {
    if (!chapterId) {
      return null;
    }

    setIsUpdating(true);
    setError(null);

    try {
      return await toggleBookmark(chapterId);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Failed to update bookmark.');
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isBookmarked,
    isUpdating,
    error,
    toggle,
  };
}

export function useSavedBookmarks() {
  const data = useLiveQuery(async () => getBookmarkedChapters(), []);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null as string | null,
  };
}
