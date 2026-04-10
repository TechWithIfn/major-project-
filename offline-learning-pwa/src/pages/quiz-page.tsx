import { useMemo } from 'react';
import { QuizMcqRunner } from '../components/quiz/quiz-mcq-runner';
import { useOfflineQuiz } from '../hooks/use-offline-study';
import { useQuizAttempt } from '../hooks/use-quiz-attempt';

export function QuizPage() {
  const { data: quiz, isLoading, error } = useOfflineQuiz();
  const {
    state,
    score,
    answeredCount,
    selectAnswer,
    goPrevious,
    goNext,
    clearAttempt,
    finishAttempt,
    retakeQuiz,
  } = useQuizAttempt(quiz);

  const latestScoreLabel = useMemo(() => {
    if (!state.latestResult) {
      return null;
    }

    return `${state.latestResult.score}/${state.latestResult.totalQuestions} (${state.latestResult.percentage}%)`;
  }, [state.latestResult]);

  if (isLoading) {
    return <p className="rounded-xl bg-slate-100 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-300">Loading offline quiz data...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
  }

  if (!quiz || quiz.questions.length === 0) {
    return <p className="rounded-xl bg-amber-50 p-4 text-amber-900">No offline quiz data is available yet.</p>;
  }

  return (
    <QuizMcqRunner
      quiz={quiz}
      index={state.index}
      selectedAnswers={state.answers}
      score={score}
      answeredCount={answeredCount}
      savedAnswerCount={state.savedAnswerCount}
      latestScoreLabel={latestScoreLabel}
      error={state.error}
      finished={state.finished}
      isSubmitting={state.isSubmitting}
      onSelectAnswer={(questionId, optionId) => {
        void selectAnswer(questionId, optionId);
      }}
      onPrevious={goPrevious}
      onNext={goNext}
      onClearAttempt={() => {
        void clearAttempt();
      }}
      onFinish={() => {
        void finishAttempt();
      }}
      onRetake={() => {
        void retakeQuiz();
      }}
    />
  );
}