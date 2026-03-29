import { useEffect, useMemo, useState } from 'react';
import { getChaptersBySubject, getFeaturedQuiz, getQuizForChapter, getSubjects, saveQuizResult } from '../../lib/db';
import type { OfflineChapter, OfflineQuiz, OfflineSubject } from '../../types';

export function QuizGeneratorPanel() {
  const [subjects, setSubjects] = useState<OfflineSubject[]>([]);
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [activeQuiz, setActiveQuiz] = useState<OfflineQuiz | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  useEffect(() => {
    let isActive = true;

    void getSubjects().then((rows) => {
      if (!isActive) {
        return;
      }

      setSubjects(rows);
      if (rows.length > 0) {
        setSelectedSubjectId(rows[0].id);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!selectedSubjectId) {
      setChapters([]);
      setSelectedChapterId('');
      return undefined;
    }

    void getChaptersBySubject(selectedSubjectId).then((rows) => {
      if (!isActive) {
        return;
      }

      setChapters(rows);
      setSelectedChapterId(rows[0]?.id ?? '');
    });

    return () => {
      isActive = false;
    };
  }, [selectedSubjectId]);

  const currentQuestion = activeQuiz?.questions[questionIndex];
  const canGoBack = questionIndex > 0;
  const canGoNext = questionIndex < (activeQuiz?.questions.length ?? 0) - 1;

  const score = useMemo(() => {
    if (!activeQuiz) {
      return 0;
    }

    return activeQuiz.questions.reduce((sum, question) => {
      return answers[question.id] === question.correctOptionId ? sum + 1 : sum;
    }, 0);
  }, [answers, activeQuiz]);

  const handleGenerateQuiz = async () => {
    setIsLoadingQuiz(true);
    setResult(null);
    setAnswers({});
    setQuestionIndex(0);

    const quiz = selectedChapterId ? await getQuizForChapter(selectedChapterId) : await getFeaturedQuiz();
    setActiveQuiz(quiz);
    setIsLoadingQuiz(false);
  };

  const handleFinish = async () => {
    if (!activeQuiz) {
      return;
    }

    await saveQuizResult({
      quizId: activeQuiz.id,
      score,
      totalQuestions: activeQuiz.questions.length,
      durationSeconds: Math.max(30, activeQuiz.questions.length * 25),
    });

    setResult({ score, total: activeQuiz.questions.length });
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Subject</span>
          <select
            value={selectedSubjectId}
            onChange={(event) => setSelectedSubjectId(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Chapter</span>
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

        <button
          type="button"
          onClick={() => {
            void handleGenerateQuiz();
          }}
          disabled={isLoadingQuiz || subjects.length === 0}
          className="self-end rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoadingQuiz ? 'Loading...' : 'Generate Quiz'}
        </button>
      </div>

      {!activeQuiz ? (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Select subject/chapter and click Generate Quiz to load MCQs from IndexedDB.
        </p>
      ) : null}

      {activeQuiz && currentQuestion ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">{activeQuiz.title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Question {questionIndex + 1} of {activeQuiz.questions.length}
          </p>

          <p className="mt-4 font-medium text-slate-900 dark:text-slate-100">{currentQuestion.question}</p>

          <div className="mt-3 space-y-2">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }))}
                  className={[
                    'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
                    selected
                      ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200'
                      : 'border-slate-200 bg-white hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900',
                  ].join(' ')}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => setQuestionIndex((prev) => prev - 1)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {canGoNext ? (
              <button
                type="button"
                onClick={() => setQuestionIndex((prev) => prev + 1)}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void handleFinish();
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Submit & Calculate Score
              </button>
            )}
          </div>

          {result ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              Score: {result.score}/{result.total} ({Math.round((result.score / Math.max(1, result.total)) * 100)}%)
            </p>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
