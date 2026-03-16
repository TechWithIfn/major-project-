import { Link } from 'react-router-dom';
import { StatCard } from '../components/ui/stat-card';
import { recentActivities } from '../data/app-data';
import { useOfflineSubjects, useProgressDashboard } from '../hooks/use-offline-study';
import { getBookmarks } from '../lib/storage';

export function HomePage() {
  const bookmarkCount = getBookmarks().length;
  const { data: subjects } = useOfflineSubjects();
  const { data: dashboardData } = useProgressDashboard();

  const recentQuizAttempt = dashboardData.recentQuizResults[0];

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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Subjects" value={String(subjects.length)} hint="Available offline" />
        <StatCard title="Completion" value={`${dashboardData.completionRate}%`} hint={`${dashboardData.completedChapters}/${dashboardData.totalChapters} chapters`} />
        <StatCard title="Bookmarks" value={String(bookmarkCount)} hint="Saved highlights" />
        <StatCard
          title="Latest Quiz"
          value={recentQuizAttempt ? `${recentQuizAttempt.percentage}%` : 'No attempt'}
          hint={recentQuizAttempt ? `${recentQuizAttempt.score}/${recentQuizAttempt.totalQuestions} score` : 'Take your first quiz'}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
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

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {recentActivities.map((activity) => (
              <li key={activity} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                {activity}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}