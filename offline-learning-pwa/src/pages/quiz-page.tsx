import { useEffect, useMemo, useState } from 'react';
import { useOfflineQuiz } from '../hooks/use-offline-study';
import { clearQuizAnswers, getLatestQuizResult, getQuizAnswerMap, saveQuizAnswer, saveQuizResult } from '../lib/db';
import type { QuizResultRecord } from '../types';

export function QuizPage() {
  const { data: quiz, isLoading, error } = useOfflineQuiz();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [savedAnswerCount, setSavedAnswerCount] = useState(0);
  const [latestResult, setLatestResult] = useState<QuizResultRecord | null>(null);
  const [attemptStartedAt, setAttemptStartedAt] = useState<number>(Date.now());

  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setFinished(false);
    setSavedAnswerCount(0);
    setLatestResult(null);
    setAttemptStartedAt(Date.now());
  }, [quiz?.id]);

  useEffect(() => {
    let isActive = true;

    if (!quiz) {
      return undefined;
    }

    getQuizAnswerMap(quiz.id)
      .then((savedAnswers) => {
        if (!isActive) {
          return;
        }

        const restoredCount = Object.keys(savedAnswers).length;

        setAnswers(savedAnswers);
        setSavedAnswerCount(restoredCount);

        if (restoredCount === 0) {
          return;
        }

        const firstUnansweredIndex = quiz.questions.findIndex((question) => !savedAnswers[question.id]);
        setIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : Math.max(quiz.questions.length - 1, 0));
      })
      .catch(() => {
        if (isActive) {
          setSavedAnswerCount(0);
        }
      });

    getLatestQuizResult(quiz.id)
      .then((result) => {
        if (isActive) {
          setLatestResult(result);
        }
      })
      .catch(() => {
        if (isActive) {
          setLatestResult(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [quiz]);

  const current = quiz?.questions[index];

  const score = useMemo(() => {
    return (quiz?.questions ?? []).reduce((sum, question) => {
      return answers[question.id] === question.correctOptionId ? sum + 1 : sum;
    }, 0);
  }, [answers, quiz]);

  const canGoBack = index > 0;
  const canGoNext = index < (quiz?.questions.length ?? 0) - 1;

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const isNewAnswer = !Object.prototype.hasOwnProperty.call(prev, questionId);
      if (isNewAnswer) {
        setSavedAnswerCount((count) => count + 1);
      }

      return { ...prev, [questionId]: optionId };
    });

    if (quiz) {
      void saveQuizAnswer(quiz.id, questionId, optionId);
    }
  };

  const handleRetakeQuiz = async () => {
    if (quiz) {
      await clearQuizAnswers(quiz.id);
    }

    setIndex(0);
    setAnswers({});
    setSavedAnswerCount(0);
    setFinished(false);
    setAttemptStartedAt(Date.now());
  };

  const handleFinishQuiz = async () => {
    if (!quiz) {
      return;
    }

    const durationSeconds = Math.max(1, Math.round((Date.now() - attemptStartedAt) / 1000));
    const result = await saveQuizResult({
      quizId: quiz.id,
      score,
      totalQuestions: quiz.questions.length,
      durationSeconds,
    });

    await clearQuizAnswers(quiz.id);
    setLatestResult(result);
    setSavedAnswerCount(0);
    setFinished(true);
  };

  if (isLoading) {
    return <p className="rounded-xl bg-slate-100 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading offline quiz data...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
  }

  if (!quiz || quiz.questions.length === 0 || !current) {
    return <p className="rounded-xl bg-amber-50 p-4 text-amber-900">No offline quiz data is available yet.</p>;
  }

  if (finished) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold">{quiz.title} Results</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Your score: <strong>{score}</strong> / {quiz.questions.length}
        </p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Review incorrect answers and retry to improve your score without needing an internet connection.</p>

        <button
          type="button"
          onClick={() => {
            void handleRetakeQuiz();
          }}
          className="mt-5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Retake Quiz
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">{quiz.title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{quiz.description}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Question {index + 1} of {quiz.questions.length} · estimated {quiz.durationMinutes} minutes
        </p>
        {savedAnswerCount > 0 ? (
          <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
            Resuming saved quiz attempt offline. {savedAnswerCount} answer{savedAnswerCount === 1 ? '' : 's'} restored from IndexedDB.
          </div>
        ) : null}
        {latestResult ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Latest result: {latestResult.score}/{latestResult.totalQuestions} ({latestResult.percentage}%)
          </div>
        ) : null}
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">{current.question}</h3>

        <div className="mt-4 space-y-2">
          {current.options.map((option) => {
            const selected = answers[current.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(current.id, option.id)}
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

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void handleRetakeQuiz();
            }}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Clear Saved Attempt
          </button>

          <button
            type="button"
            onClick={() => canGoBack && setIndex((prev) => prev - 1)}
            disabled={!canGoBack}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {canGoNext ? (
            <button
              type="button"
              onClick={() => setIndex((prev) => prev + 1)}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                void handleFinishQuiz();
              }}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Finish Quiz
            </button>
          )}
        </div>
      </article>
    </section>
  );
}