import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { NotFoundPage } from '../pages/not-found-page';

const HomePage = lazy(() => import('../pages/home-page').then((m) => ({ default: m.HomePage })));
const SubjectsPage = lazy(() => import('../pages/subjects-page').then((m) => ({ default: m.SubjectsPage })));
const ChaptersPage = lazy(() => import('../pages/chapters-page').then((m) => ({ default: m.ChaptersPage })));
const ReaderPage = lazy(() => import('../pages/reader-page').then((m) => ({ default: m.ReaderPage })));
const QuizPage = lazy(() => import('../pages/quiz-page').then((m) => ({ default: m.QuizPage })));
const ProgressDashboardPage = lazy(() => import('../pages/progress-dashboard-page').then((m) => ({ default: m.ProgressDashboardPage })));
const SettingsPage = lazy(() => import('../pages/settings-page').then((m) => ({ default: m.SettingsPage })));
const AiTutorChatPage = lazy(() => import('../pages/menu-pages').then((m) => ({ default: m.AiTutorChatPage })));
const QuizGeneratorPage = lazy(() => import('../pages/menu-pages').then((m) => ({ default: m.QuizGeneratorPage })));
const SummaryModePage = lazy(() => import('../pages/menu-pages').then((m) => ({ default: m.SummaryModePage })));
const SavedBookmarksPage = lazy(() => import('../pages/menu-pages').then((m) => ({ default: m.SavedBookmarksPage })));
const StudentProfilePage = lazy(() => import('../pages/menu-pages').then((m) => ({ default: m.StudentProfilePage })));

function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Loading page...
        </section>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <LazyRoute><HomePage /></LazyRoute> },
      { path: 'subjects', element: <LazyRoute><SubjectsPage /></LazyRoute> },
      { path: 'subjects/:subjectId', element: <Navigate to="chapters" relative="path" replace /> },
      { path: 'subjects/:subjectId/chapters', element: <LazyRoute><ChaptersPage /></LazyRoute> },
      { path: 'subjects/:subjectId/chapters/:chapterId/read', element: <LazyRoute><ReaderPage /></LazyRoute> },
      { path: 'quiz', element: <LazyRoute><QuizPage /></LazyRoute> },
      { path: 'progress', element: <LazyRoute><ProgressDashboardPage /></LazyRoute> },
      { path: 'settings', element: <LazyRoute><SettingsPage /></LazyRoute> },
      { path: 'ai-tutor', element: <LazyRoute><AiTutorChatPage /></LazyRoute> },
      { path: 'quiz-generator', element: <LazyRoute><QuizGeneratorPage /></LazyRoute> },
      { path: 'summary-mode', element: <LazyRoute><SummaryModePage /></LazyRoute> },
      { path: 'bookmarks', element: <LazyRoute><SavedBookmarksPage /></LazyRoute> },
      { path: 'profile', element: <LazyRoute><StudentProfilePage /></LazyRoute> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);