import { useMemo, useState } from 'react';
import { StatCard } from '../ui/stat-card';
import { useDashboardSnapshot } from '../../hooks/use-offline-study';

type DashboardOverviewProps = {
  latestQuizLabel: string;
  latestQuizHint: string;
};

export function DashboardOverview({ latestQuizLabel, latestQuizHint }: DashboardOverviewProps) {
  const [activityFilter, setActivityFilter] = useState<'all' | 'bookmark' | 'quiz' | 'completion'>('all');
  const { data, isLoading, error } = useDashboardSnapshot();

  const filteredActivity = useMemo(() => {
    if (activityFilter === 'all') {
      return data.recentActivity;
    }

    return data.recentActivity.filter((activity) => activity.kind === activityFilter);
  }, [activityFilter, data.recentActivity]);

  if (isLoading) {
    return <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading dashboard metrics from IndexedDB...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  return (
    <section className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Subjects" value={String(data.totalSubjects)} hint="Loaded from IndexedDB" />
        <StatCard title="Completed Chapters" value={String(data.completedChapters)} hint="Progress-based completion" />
        <StatCard title="Bookmarked Items" value={String(data.bookmarkedItems)} hint="Saved offline bookmarks" />
        <StatCard title="Latest Quiz" value={latestQuizLabel} hint={latestQuizHint} />
      </section>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'bookmark', label: 'Bookmarks' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'completion', label: 'Completions' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActivityFilter(option.value as 'all' | 'bookmark' | 'quiz' | 'completion')}
                className={[
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  activityFilter === option.value
                    ? 'border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            No activity for this filter yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {filteredActivity.map((activity) => (
              <li key={activity.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                <p>{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(activity.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
