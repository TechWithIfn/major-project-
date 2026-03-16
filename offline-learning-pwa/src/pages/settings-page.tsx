import { useOutletContext } from 'react-router-dom';
import { clearAppCacheData, getBookmarks } from '../lib/storage';

type LayoutContext = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export function SettingsPage() {
  const { darkMode, setDarkMode } = useOutletContext<LayoutContext>();
  const bookmarkCount = getBookmarks().length;

  const handleClearCache = async () => {
    clearAppCacheData();

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    window.location.reload();
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
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Saved bookmarks: {bookmarkCount}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Service worker cache: enabled</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold">Maintenance</h3>
        <button
          type="button"
          onClick={handleClearCache}
          className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Clear Cache Data
        </button>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold">App Version</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Learning Hub PWA v1.0.0</p>
      </article>
    </section>
  );
}