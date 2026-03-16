type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        This screen is scaffolded and ready for feature logic integration.
      </div>
    </section>
  );
}