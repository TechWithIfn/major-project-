import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto mt-20 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm uppercase tracking-wider text-slate-500">404</p>
      <h2 className="mt-2 text-2xl font-bold">Page not found</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">The route you opened does not exist in Learning Hub.</p>
      <Link to="/" className="mt-5 inline-block rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
        Go to Dashboard
      </Link>
    </section>
  );
}