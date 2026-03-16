import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/use-network-status';

export function NetworkStatusBanner() {
  const { isOnline, changedAt } = useNetworkStatus();
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowRecovered(false);
      return;
    }

    setShowRecovered(true);
    const timer = window.setTimeout(() => {
      setShowRecovered(false);
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [changedAt, isOnline]);

  if (!isOnline) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <p className="inline-flex items-center gap-2 font-semibold">
          <WifiOff size={16} />
          You are offline.
        </p>
        <p className="mt-1 text-xs opacity-90">Cached lessons, notes, and quizzes remain available on this device.</p>
      </div>
    );
  }

  if (showRecovered) {
    return (
      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
        <p className="inline-flex items-center gap-2 font-semibold">
          <Wifi size={16} />
          Back online.
        </p>
        <p className="mt-1 text-xs opacity-90">Your content sync will continue silently in the background.</p>
      </div>
    );
  }

  return null;
}
