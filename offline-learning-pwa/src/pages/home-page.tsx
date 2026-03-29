import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DashboardOverview } from '../components/dashboard/dashboard-overview';
import { useOfflineSyncStatus, useProgressDashboard } from '../hooks/use-offline-study';
import { scheduleStudyBackgroundSync } from '../lib/offline-sync';

function formatSyncTimestamp(value: string | null): string {
  if (!value) {
    return 'Not available yet';
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return 'Not available yet';
  }

  return timestamp.toLocaleString();
}

export function HomePage() {
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [manualSyncMessage, setManualSyncMessage] = useState<string | null>(null);
  const { data: dashboardData } = useProgressDashboard();
  const { data: syncStatus } = useOfflineSyncStatus();

  const recentQuizAttempt = dashboardData.recentQuizResults[0];
  const isSyncActionDisabled = isSyncingNow || syncStatus.status === 'syncing' || !syncStatus.isOnline;

  const handleSyncNow = async () => {
    if (isSyncActionDisabled) {
      return;
    }

    setIsSyncingNow(true);
    setManualSyncMessage(null);

    const started = await scheduleStudyBackgroundSync();

    setManualSyncMessage(started ? 'Sync request sent. Content will refresh shortly.' : 'Unable to start sync right now. Please try again.');
    setIsSyncingNow(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-600 p-6 text-white shadow md:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-100">Welcome back, student</p>
        <h2 className="mt-2 text-3xl font-bold">Your offline learning dashboard is ready</h2>
        <p className="mt-3 max-w-2xl text-sm text-teal-50">
          Continue learning even without internet. Your notes, bookmarks, and progress stay available on your device.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/subjects" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal-700">
            Continue Studying
          </Link>
          <Link to="/quiz" className="rounded-xl bg-teal-800/50 px-4 py-2 text-sm font-semibold text-white">
            Take Quick Quiz
          </Link>
          <Link to="/progress" className="rounded-xl bg-teal-800/50 px-4 py-2 text-sm font-semibold text-white">
            View Progress
          </Link>
          <Link to="/summary-mode" className="rounded-xl bg-teal-800/50 px-4 py-2 text-sm font-semibold text-white">
            Summary Mode
          </Link>
        </div>
      </section>

      <DashboardOverview
        latestQuizLabel={recentQuizAttempt ? `${recentQuizAttempt.percentage}%` : 'No attempt'}
        latestQuizHint={recentQuizAttempt ? `${recentQuizAttempt.score}/${recentQuizAttempt.totalQuestions} score` : 'Take your first quiz'}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Offline Sync Status</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Live sync health and timestamps from Dexie meta values.</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={[
                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                syncStatus.status === 'synced'
                  ? 'bg-emerald-100 text-emerald-800'
                  : syncStatus.status === 'failed'
                    ? 'bg-rose-100 text-rose-800'
                    : syncStatus.status === 'syncing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700',
              ].join(' ')}
            >
              {syncStatus.status}
            </span>
            <button
              type="button"
              onClick={() => {
                void handleSyncNow();
              }}
              disabled={isSyncActionDisabled}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSyncingNow ? <Loader2 size={14} className="animate-spin" /> : null}
              {isSyncingNow ? 'Syncing...' : 'Sync now'}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Network</p>
            <p className="mt-1 font-medium">{syncStatus.isOnline ? 'Online' : 'Offline'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Last Successful Sync</p>
            <p className="mt-1 font-medium">{formatSyncTimestamp(syncStatus.lastSuccessfulSyncAt)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Last Sync Requested</p>
            <p className="mt-1 font-medium">{formatSyncTimestamp(syncStatus.lastSyncRequestedAt)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Last Content Refresh</p>
            <p className="mt-1 font-medium">{formatSyncTimestamp(syncStatus.lastContentRefreshAt)}</p>
          </div>
        </div>

        {syncStatus.lastSyncFailedAt ? (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">Last failed sync: {formatSyncTimestamp(syncStatus.lastSyncFailedAt)}</p>
        ) : null}

        {manualSyncMessage ? (
          <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{manualSyncMessage}</p>
        ) : null}
      </section>

      <section className="grid gap-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link to="/ai-tutor" className="rounded-xl border border-slate-200 p-3 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Ask AI Tutor
            </Link>
            <Link to="/quiz-generator" className="rounded-xl border border-slate-200 p-3 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Generate Quiz
            </Link>
            <Link to="/bookmarks" className="rounded-xl border border-slate-200 p-3 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Open Bookmarks
            </Link>
            <Link to="/progress" className="rounded-xl border border-slate-200 p-3 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Open Progress Dashboard
            </Link>
            <Link to="/profile" className="rounded-xl border border-slate-200 p-3 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:bg-slate-800">
              View Profile
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}