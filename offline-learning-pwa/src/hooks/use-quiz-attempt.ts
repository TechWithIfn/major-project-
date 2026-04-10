import { useEffect, useMemo, useState } from 'react';
import { clearQuizAnswers, getLatestQuizResult, getQuizAnswerMap, saveQuizAnswer, saveQuizResult } from '../lib/db';
import type { OfflineQuiz, QuizResultRecord } from '../types';

type UseQuizAttemptState = {
  index: number;
  answers: Record<string, string>;
  finished: boolean;
  savedAnswerCount: number;
  latestResult: QuizResultRecord | null;
  isSubmitting: boolean;
  error: string | null;
};

export function useQuizAttempt(quiz: OfflineQuiz | null) {
  const [state, setState] = useState<UseQuizAttemptState>({
    index: 0,
    answers: {},
    finished: false,
    savedAnswerCount: 0,
    latestResult: null,
    isSubmitting: false,
    error: null,
  });
  const [attemptStartedAt, setAttemptStartedAt] = useState<number>(Date.now());

  useEffect(() => {
    setState({
      index: 0,
      answers: {},
      finished: false,
      savedAnswerCount: 0,
      latestResult: null,
      isSubmitting: false,
      error: null,
    });
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
        const firstUnansweredIndex = quiz.questions.findIndex((question) => !savedAnswers[question.id]);

        setState((previous) => ({
          ...previous,
          answers: savedAnswers,
          savedAnswerCount: restoredCount,
          index: firstUnansweredIndex >= 0 ? firstUnansweredIndex : Math.max(quiz.questions.length - 1, 0),
        }));
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setState((previous) => ({
          ...previous,
          savedAnswerCount: 0,
          error: error instanceof Error ? error.message : 'Failed to restore saved quiz attempt.',
        }));
      });

    getLatestQuizResult(quiz.id)
      .then((result) => {
        if (!isActive) {
          return;
        }

        setState((previous) => ({
          ...previous,
          latestResult: result,
        }));
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setState((previous) => ({
          ...previous,
          latestResult: null,
        }));
      });

    return () => {
      isActive = false;
    };
  }, [quiz]);

  const score = useMemo(() => {
    if (!quiz) {
      return 0;
    }

    return quiz.questions.reduce((sum, question) => {
      return state.answers[question.id] === question.correctOptionId ? sum + 1 : sum;
    }, 0);
  }, [quiz, state.answers]);

  const currentQuestion = quiz?.questions[state.index] ?? null;
  const totalQuestions = quiz?.questions.length ?? 0;
  const answeredCount = Object.keys(state.answers).length;
  const canGoBack = state.index > 0;
  const canGoNext = state.index < totalQuestions - 1;

  const selectAnswer = async (questionId: string, optionId: string) => {
    if (!quiz) {
      return;
    }

    setState((previous) => {
      const isNewAnswer = !Object.prototype.hasOwnProperty.call(previous.answers, questionId);
      return {
        ...previous,
        answers: { ...previous.answers, [questionId]: optionId },
        savedAnswerCount: isNewAnswer ? previous.savedAnswerCount + 1 : previous.savedAnswerCount,
      };
    });

    try {
      await saveQuizAnswer(quiz.id, questionId, optionId);
    } catch (error) {
      setState((previous) => ({
        ...previous,
        error: error instanceof Error ? error.message : 'Failed to save selected answer.',
      }));
    }
  };

  const goPrevious = () => {
    setState((previous) => ({ ...previous, index: Math.max(0, previous.index - 1) }));
  };

  const goNext = () => {
    setState((previous) => ({ ...previous, index: Math.min(totalQuestions - 1, previous.index + 1) }));
  };

  const clearAttempt = async () => {
    if (!quiz) {
      return;
    }

    await clearQuizAnswers(quiz.id);
    setState((previous) => ({
      ...previous,
      index: 0,
      answers: {},
      savedAnswerCount: 0,
      finished: false,
      error: null,
    }));
    setAttemptStartedAt(Date.now());
  };

  const finishAttempt = async () => {
    if (!quiz) {
      return null;
    }

    setState((previous) => ({ ...previous, isSubmitting: true, error: null }));

    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - attemptStartedAt) / 1000));
      const result = await saveQuizResult({
        quizId: quiz.id,
        score,
        totalQuestions: quiz.questions.length,
        durationSeconds,
      });

      await clearQuizAnswers(quiz.id);

      setState((previous) => ({
        ...previous,
        latestResult: result,
        savedAnswerCount: 0,
        finished: true,
        isSubmitting: false,
      }));

      return result;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to calculate quiz score.',
      }));
      return null;
    }
  };

  const retakeQuiz = async () => {
    await clearAttempt();
    setState((previous) => ({ ...previous, finished: false }));
  };

  return {
    state,
    currentQuestion,
    score,
    totalQuestions,
    answeredCount,
    canGoBack,
    canGoNext,
    selectAnswer,
    goPrevious,
    goNext,
    clearAttempt,
    finishAttempt,
    retakeQuiz,
  };
}
