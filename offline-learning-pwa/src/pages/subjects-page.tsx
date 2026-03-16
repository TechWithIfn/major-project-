import { SubjectCard } from '../components/ui/subject-card';
import { useOfflineSubjects } from '../hooks/use-offline-study';

export function SubjectsPage() {
  const { data: subjects, isLoading, error } = useOfflineSubjects();

  return (
    <section>
      <h2 className="text-2xl font-bold">Subjects</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Choose a subject to open chapters and continue learning from the local IndexedDB library.</p>

      {error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      {isLoading ? <p className="mt-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">Loading offline subjects...</p> : null}

      {!isLoading && subjects.length === 0 ? (
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No offline subjects have been stored yet.</p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </section>
  );
}