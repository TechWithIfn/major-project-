import { useEffect, useMemo, useState } from 'react';
import { useOfflineAppOverview, useOfflineBookmarks, useProgressDashboard } from '../../hooks/use-offline-study';

const PROFILE_NAME_KEY = 'learning-hub-student-name';

export function StudentProfilePanel() {
  const [nameInput, setNameInput] = useState('');
  const [savedName, setSavedName] = useState('');
  const { data: overview } = useOfflineAppOverview();
  const { data: progress } = useProgressDashboard();
  const { data: bookmarks } = useOfflineBookmarks();

  useEffect(() => {
    const existing = window.localStorage.getItem(PROFILE_NAME_KEY) ?? '';
    setSavedName(existing);
    setNameInput(existing);
  }, []);

  const strongestSubject = useMemo(() => {
    if (progress.subjectSummaries.length === 0) {
      return null;
    }

    return [...progress.subjectSummaries].sort((left, right) => right.completionRate - left.completionRate)[0];
  }, [progress.subjectSummaries]);

  const handleSaveName = () => {
    const next = nameInput.trim();
    window.localStorage.setItem(PROFILE_NAME_KEY, next);
    setSavedName(next);
  };

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Student Name</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Enter your name"
            className="min-w-[14rem] flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="button"
            onClick={handleSaveName}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Save
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {savedName ? `Stored locally as: ${savedName}` : 'Name not set yet.'}
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Study Stats</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">Subjects: {overview.subjects}</div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">Chapters: {overview.chapters}</div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">Bookmarks: {bookmarks.length}</div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">Quiz attempts: {progress.recentQuizResults.length}</div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Progress Summary</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Overall completion: {progress.completionRate}% ({progress.completedChapters}/{progress.totalChapters} chapters)</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Strongest subject: {strongestSubject ? `${strongestSubject.subjectName} (${strongestSubject.completionRate}%)` : 'No progress yet'}
        </p>
      </article>
    </section>
  );
}
