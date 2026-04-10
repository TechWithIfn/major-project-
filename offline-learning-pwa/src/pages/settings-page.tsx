import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useNetworkStatus } from '../hooks/use-network-status';
import { useOfflineAppOverview, useOfflineBookmarks } from '../hooks/use-offline-study';
import { clearOfflineContentData, primeOfflineStudyLibrary } from '../lib/db';
import { offlineStudySeed } from '../data/offline-study-seed';

type LayoutContext = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export function SettingsPage() {
  const { darkMode, setDarkMode } = useOutletContext<LayoutContext>();
  const { isOnline, changedAt } = useNetworkStatus();
  const { data: overview } = useOfflineAppOverview();
  const { data: bookmarks } = useOfflineBookmarks();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleClearCache = async () => {
    await clearOfflineContentData();

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    window.location.reload();
  };

  const handleResetAndSeed = async () => {
    setIsSeeding(true);
    setSeedMessage(null);

    try {
      await clearOfflineContentData();
      await primeOfflineStudyLibrary(offlineStudySeed);
      setSeedMessage('Offline demo library has been reset and seeded successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to seed offline demo library.';
      setSeedMessage(message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Settings</h2>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Dark Mode</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Toggle low-light reading mode for evening study sessions.</p>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={[
              'rounded-xl px-3 py-2 text-sm font-semibold',
              darkMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800',
            ].join(' ')}
          >
            {darkMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold">Offline Storage Info</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Offline status: {isOnline ? 'Online' : 'Offline'} (updated {new Date(changedAt).toLocaleTimeString()})
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Saved bookmarks: {bookmarks.length}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Subjects cached: {overview.subjects}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Chapters cached: {overview.chapters}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Content blocks cached: {overview.content}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Quiz bundles cached: {overview.quizzes}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Service worker cache: enabled</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold">Maintenance</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClearCache}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Clear Cache Data
          </button>
          <button
            type="button"
            onClick={handleResetAndSeed}
            disabled={isSeeding}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSeeding ? 'Seeding Offline Library...' : 'Reset and Seed Demo Library'}
          </button>
        </div>
        {seedMessage ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{seedMessage}</p> : null}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold">App Version</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Learning Hub PWA v1.0.0</p>
      </article>
    </section>
  );
}