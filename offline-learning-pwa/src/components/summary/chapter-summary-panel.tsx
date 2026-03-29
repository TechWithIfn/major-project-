import { useEffect, useMemo, useState } from 'react';
import { getAllChapters, getNotesByChapter, getSubjects, getTextbookByChapter } from '../../lib/db';
import type { OfflineChapter, OfflineStudyMaterial, OfflineSubject } from '../../types';

export function ChapterSummaryPanel() {
  const [subjects, setSubjects] = useState<OfflineSubject[]>([]);
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [notes, setNotes] = useState<OfflineStudyMaterial | null>(null);
  const [textbook, setTextbook] = useState<OfflineStudyMaterial | null>(null);

  useEffect(() => {
    let isActive = true;

    void Promise.all([getSubjects(), getAllChapters()]).then(([subjectRows, chapterRows]) => {
      if (!isActive) {
        return;
      }

      setSubjects(subjectRows);
      setChapters(chapterRows);
      setSelectedChapterId(chapterRows[0]?.id ?? '');
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!selectedChapterId) {
      setNotes(null);
      setTextbook(null);
      return undefined;
    }

    void Promise.all([getNotesByChapter(selectedChapterId), getTextbookByChapter(selectedChapterId)]).then(([notesMaterial, textbookMaterial]) => {
      if (!isActive) {
        return;
      }

      setNotes(notesMaterial);
      setTextbook(textbookMaterial);
    });

    return () => {
      isActive = false;
    };
  }, [selectedChapterId]);

  const selectedChapter = useMemo(() => chapters.find((chapter) => chapter.id === selectedChapterId) ?? null, [chapters, selectedChapterId]);

  const selectedSubjectName = useMemo(() => {
    if (!selectedChapter) {
      return 'Offline subject';
    }

    return subjects.find((subject) => subject.id === selectedChapter.subjectId)?.name ?? 'Offline subject';
  }, [selectedChapter, subjects]);

  const keyPoints = notes?.highlights?.length ? notes.highlights : textbook?.highlights ?? [];
  const shortNotes = notes?.blocks?.slice(0, 3) ?? textbook?.blocks?.slice(0, 2) ?? [];

  return (
    <section className="space-y-4">
      <label className="space-y-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Choose chapter</span>
        <select
          value={selectedChapterId}
          onChange={(event) => setSelectedChapterId(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
      </label>

      {!selectedChapter ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No chapters available for summary.</p>
      ) : (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedChapter.title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{selectedSubjectName}</p>

          <section className="mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">Short Notes</h4>
            {shortNotes.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No notes available for this chapter yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {shortNotes.map((line, index) => (
                  <li key={`${selectedChapter.id}-note-${index}`} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">Key Points</h4>
            {keyPoints.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No key points available for this chapter yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {keyPoints.map((point) => (
                  <li key={`${selectedChapter.id}-${point}`} className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      )}
    </section>
  );
}
