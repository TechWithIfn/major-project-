import { StatCard } from '../ui/stat-card';
import { useDashboardMetrics } from '../../hooks/use-dashboard-metrics';

export function RealDataDashboard() {
  const { data, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading dashboard metrics from IndexedDB...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  return (
    <section className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Subjects" value={String(data.totalSubjects)} hint="Loaded from IndexedDB" />
        <StatCard title="Completed Chapters" value={String(data.completedChapters)} hint="Progress-tracked chapters" />
        <StatCard title="Bookmarks" value={String(data.bookmarksCount)} hint="Saved offline bookmarks" />
      </section>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        {data.recentActivity.length === 0 ? (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            No activity yet. Start reading chapters, bookmarking, or finishing quizzes.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {data.recentActivity.map((activity) => (
              <li key={activity.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="font-medium capitalize text-slate-800 dark:text-slate-200">{activity.kind}</p>
                <p className="mt-1">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(activity.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
