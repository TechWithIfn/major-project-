import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/navigation/sidebar';
import { NetworkStatusBanner } from '../components/ui/network-status-banner';
import { getDarkModeSetting, setDarkModeSetting } from '../lib/storage';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const enabled = getDarkModeSetting();
    setDarkMode(enabled);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    setDarkModeSetting(darkMode);
  }, [darkMode]);

  const context = useMemo(
    () => ({
      darkMode,
      setDarkMode,
    }),
    [darkMode]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className="min-h-screen px-4 pb-8 pt-16 md:ml-72 md:px-8 md:pt-8">
        <div className="mx-auto w-full max-w-6xl">
          <NetworkStatusBanner />
          <Outlet context={context} />
        </div>
      </main>
    </div>
  );
}