import { Link } from 'react-router-dom';
import { getIcon } from '../../lib/icons';
import type { OfflineSubject } from '../../types';

type SubjectCardProps = {
  subject: OfflineSubject;
};

export function SubjectCard({ subject }: SubjectCardProps) {
  const Icon = getIcon(subject.icon);

  return (
    <Link
      to={`/subjects/${subject.id}/chapters`}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{subject.name}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subject.description}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
            {subject.chapterCount} chapters
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {subject.totalMaterials} materials · {subject.estimatedOfflineSizeKb} KB offline
          </p>
        </div>
        <span className="rounded-xl bg-teal-100 p-3 text-teal-700 dark:bg-slate-800 dark:text-teal-400">
          <Icon size={20} />
        </span>
      </div>
    </Link>
  );
}