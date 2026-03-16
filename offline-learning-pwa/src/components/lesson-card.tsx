import { Lesson } from '../data/lessons';

type LessonCardProps = {
  lesson: Lesson;
  completed: boolean;
  active: boolean;
  onOpen: (lesson: Lesson) => void;
  onToggleComplete: (lessonId: string, nextState: boolean) => void;
};

export function LessonCard({ lesson, completed, active, onOpen, onToggleComplete }: LessonCardProps) {
  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        active ? 'border-ocean bg-teal-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-ink">{lesson.title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {lesson.duration}
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-600">{lesson.subject}</p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onOpen(lesson)}
          className="rounded-xl bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Open Lesson
        </button>
        <button
          type="button"
          onClick={() => onToggleComplete(lesson.id, !completed)}
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            completed
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          {completed ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
    </article>
  );
}