'use client'

export interface BookmarkItem {
  id: string
  title: string
  content: string
  source?: string
  createdAt: string
  type: 'chat' | 'quiz' | 'summary'
}

export interface StudentProfile {
  name: string
  classLevel: string
  preferredSubject: string
}

const BOOKMARKS_KEY = 'shiksha:bookmarks'
const PROFILE_KEY = 'shiksha:student-profile'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getBookmarks(): BookmarkItem[] {
  if (!canUseStorage()) return []
  const data = window.localStorage.getItem(BOOKMARKS_KEY)
  if (!data) return []
  try {
    const parsed = JSON.parse(data) as BookmarkItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveBookmarks(items: BookmarkItem[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(items))
}

export function addBookmark(item: BookmarkItem) {
  const existing = getBookmarks()
  const next = [item, ...existing.filter((bookmark) => bookmark.id !== item.id)].slice(0, 100)
  saveBookmarks(next)
  return next
}

export function removeBookmark(id: string) {
  const next = getBookmarks().filter((item) => item.id !== id)
  saveBookmarks(next)
  return next
}

export function getStudentProfile(): StudentProfile {
  if (!canUseStorage()) {
    return { name: '', classLevel: '10', preferredSubject: 'Mathematics' }
  }

  const data = window.localStorage.getItem(PROFILE_KEY)
  if (!data) {
    return { name: '', classLevel: '10', preferredSubject: 'Mathematics' }
  }

  try {
    const parsed = JSON.parse(data) as StudentProfile
    return {
      name: parsed.name ?? '',
      classLevel: parsed.classLevel ?? '10',
      preferredSubject: parsed.preferredSubject ?? 'Mathematics',
    }
  } catch {
    return { name: '', classLevel: '10', preferredSubject: 'Mathematics' }
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  if (!canUseStorage()) return
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
