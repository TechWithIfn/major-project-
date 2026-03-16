const DARK_MODE_KEY = 'learning-hub-dark-mode';
const BOOKMARKS_KEY = 'learning-hub-bookmarks';

export function getDarkModeSetting(): boolean {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  return saved === 'true';
}

export function setDarkModeSetting(enabled: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, String(enabled));
}

export function getBookmarks(): string[] {
  const saved = localStorage.getItem(BOOKMARKS_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(chapterId: string): string[] {
  const current = getBookmarks();
  const exists = current.includes(chapterId);
  const next = exists ? current.filter((id) => id !== chapterId) : [...current, chapterId];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  return next;
}

export function clearAppCacheData(): void {
  localStorage.removeItem(BOOKMARKS_KEY);
  localStorage.removeItem(DARK_MODE_KEY);
}