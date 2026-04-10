import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiChatPanel } from '../components/chat/ai-chat-panel';
import { StudentProfilePanel } from '../components/profile/student-profile-panel';
import { QuizGeneratorPanel } from '../components/quiz/quiz-generator-panel';
import { ChapterSummaryPanel } from '../components/summary/chapter-summary-panel';
import { useSavedBookmarks } from '../hooks/use-bookmarks';
import { useOfflineAppOverview, useOfflineSubjects, useProgressDashboard } from '../hooks/use-offline-study';
import { removeBookmark } from '../lib/db';

function PageShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AiTutorChatPage() {
  const { data: subjects } = useOfflineSubjects();

  return (
    <PageShell title="AI Tutor Chat" description="Ask chapter-wise questions with local subjects and chapter context.">
      <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Tutor context is prepared from {subjects.length} offline subjects stored in IndexedDB.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {subjects.slice(0, 6).map((subject) => (
          <span key={subject.id} className="rounded-full border border-slate-200 px-3 py-1 text-xs dark:border-slate-700">
            {subject.name}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <AiChatPanel />
      </div>
      <Link to="/subjects" className="mt-4 inline-block rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
        Open Subjects to Ask Better Questions
      </Link>
    </PageShell>
  );
}

export function QuizGeneratorPage() {
  const { data: overview } = useOfflineAppOverview();

  return (
    <PageShell title="Quiz Generator" description="Generate revision quizzes from real offline chapters and content.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Subjects available: {overview.subjects}</div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Chapters available: {overview.chapters}</div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Content blocks: {overview.content}</div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Quiz bundles: {overview.quizzes}</div>
      </div>
      <div className="mt-4">
        <QuizGeneratorPanel />
      </div>
    </PageShell>
  );
}

export function SummaryModePage() {
  return (
    <PageShell title="Summary Mode" description="Show short notes and key points loaded from stored chapter content.">
      <ChapterSummaryPanel />
    </PageShell>
  );
}

export function SavedBookmarksPage() {
  const { data: bookmarks, isLoading } = useSavedBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const subjectOptions = useMemo(() => {
    const uniqueSubjects = new Map<string, string>();
    for (const entry of bookmarks) {
      uniqueSubjects.set(entry.chapter.subjectId, entry.subject?.name ?? 'Offline subject');
    }

    return [...uniqueSubjects.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return bookmarks.filter((entry) => {
      const matchesSubject = subjectFilter === 'all' || entry.chapter.subjectId === subjectFilter;
      if (!matchesSubject) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const chapterTitle = entry.chapter.title.toLowerCase();
      const subjectName = (entry.subject?.name ?? 'offline subject').toLowerCase();
      return chapterTitle.includes(normalizedSearch) || subjectName.includes(normalizedSearch);
    });
  }, [bookmarks, searchQuery, subjectFilter]);

  return (
    <PageShell title="Saved Bookmarks" description="All bookmarks are loaded from IndexedDB and linked to chapters.">
      {isLoading ? <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Loading bookmarks...</p> : null}
      {!isLoading && bookmarks.length === 0 ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No bookmarks yet. Open any chapter and tap Add Bookmark.</p>
      ) : null}

      {!isLoading && bookmarks.length > 0 ? (
        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by chapter or subject"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-300 focus:ring dark:border-slate-700 dark:bg-slate-900"
          />
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-300 focus:ring dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="all">All subjects</option>
            {subjectOptions.map((subjectOption) => (
              <option key={subjectOption.id} value={subjectOption.id}>
                {subjectOption.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {!isLoading && bookmarks.length > 0 && filteredBookmarks.length === 0 ? (
        <p className="mb-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          No bookmarks match your search or filter.
        </p>
      ) : null}

      <div className="space-y-2">
        {filteredBookmarks.map((entry) => (
          <div key={entry.bookmark.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <Link
              to={`/subjects/${entry.chapter.subjectId}/chapters/${entry.chapter.id}/read`}
              className="block hover:text-teal-700 dark:hover:text-teal-300"
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">{entry.chapter.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{entry.subject?.name ?? 'Offline subject'} · Saved {new Date(entry.bookmark.createdAt).toLocaleString()}</p>
            </Link>
            <button
              type="button"
              onClick={() => {
                void removeBookmark(entry.chapter.id).then(() => {
                  setToastMessage('Bookmark removed.');
                });
              }}
              className="mt-2 rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              Remove bookmark
            </button>
          </div>
        ))}
      </div>
      {toastMessage ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {toastMessage}
        </div>
      ) : null}
    </PageShell>
  );
}

export function StudentProfilePage() {
  return (
    <PageShell title="Student Profile" description="Name, study stats, and progress summary stored locally.">
      <StudentProfilePanel />
    </PageShell>
  );
}
