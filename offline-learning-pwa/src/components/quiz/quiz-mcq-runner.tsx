import type { OfflineQuiz } from '../../types';

type QuizMcqRunnerProps = {
  quiz: OfflineQuiz;
  index: number;
  selectedAnswers: Record<string, string>;
  score: number;
  answeredCount: number;
  savedAnswerCount: number;
  latestScoreLabel: string | null;
  error: string | null;
  finished: boolean;
  isSubmitting: boolean;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClearAttempt: () => void;
  onFinish: () => void;
  onRetake: () => void;
};

export function QuizMcqRunner({
  quiz,
  index,
  selectedAnswers,
  score,
  answeredCount,
  savedAnswerCount,
  latestScoreLabel,
  error,
  finished,
  isSubmitting,
  onSelectAnswer,
  onPrevious,
  onNext,
  onClearAttempt,
  onFinish,
  onRetake,
}: QuizMcqRunnerProps) {
  const current = quiz.questions[index];
  const canGoBack = index > 0;
  const canGoNext = index < quiz.questions.length - 1;

  if (!current) {
    return <p className="rounded-xl bg-amber-50 p-4 text-amber-900">Quiz question data is unavailable.</p>;
  }

  if (finished) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold">{quiz.title} Results</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Your score: <strong>{score}</strong> / {quiz.questions.length}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Correct answers: {score} · Wrong answers: {Math.max(0, quiz.questions.length - score)}</p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Review incorrect answers and retry to improve your score without needing an internet connection.</p>

        <div className="mt-5 space-y-3">
          {quiz.questions.map((question, reviewIndex) => {
            const selectedOptionId = selectedAnswers[question.id];
            const selectedOption = question.options.find((option) => option.id === selectedOptionId) ?? null;
            const correctOption = question.options.find((option) => option.id === question.correctOptionId) ?? null;
            const isCorrect = selectedOptionId === question.correctOptionId;

            return (
              <article
                key={question.id}
                className={[
                  'rounded-xl border p-4',
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-900/20'
                    : 'border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-900/20',
                ].join(' ')}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Q{reviewIndex + 1}. {question.question}
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  Your answer: <span className="font-medium">{selectedOption?.text ?? 'Not answered'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  Correct answer: <span className="font-medium">{correctOption?.text ?? 'Unavailable'}</span>
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Explanation: {question.explanation}</p>
              </article>
            );
          })}
        </div>

        <button type="button" onClick={onRetake} className="mt-5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
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
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Answered {answeredCount}/{quiz.questions.length}
        </p>
        {savedAnswerCount > 0 ? (
          <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
            Resuming saved quiz attempt offline. {savedAnswerCount} answer{savedAnswerCount === 1 ? '' : 's'} restored from IndexedDB.
          </div>
        ) : null}
        {latestScoreLabel ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Latest result: {latestScoreLabel}
          </div>
        ) : null}
        {error ? <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">{current.question}</h3>

        <div className="mt-4 space-y-2">
          {current.options.map((option) => {
            const selected = selectedAnswers[current.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectAnswer(current.id, option.id)}
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
          <button type="button" onClick={onClearAttempt} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium">
            Clear Saved Attempt
          </button>

          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoBack}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {canGoNext ? (
            <button type="button" onClick={onNext} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish}
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Calculating...' : 'Submit & Calculate Score'}
            </button>
          )}
        </div>
      </article>
    </section>
  );
}
