import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { ChaptersPage } from '../pages/chapters-page';
import { HomePage } from '../pages/home-page';
import { NotFoundPage } from '../pages/not-found-page';
import { PlaceholderPage } from '../pages/placeholder-page';
import { ProgressDashboardPage } from '../pages/progress-dashboard-page';
import { QuizPage } from '../pages/quiz-page';
import { ReaderPage } from '../pages/reader-page';
import { SettingsPage } from '../pages/settings-page';
import { SubjectsPage } from '../pages/subjects-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'subjects/:subjectId/chapters', element: <ChaptersPage /> },
      { path: 'subjects/:subjectId/chapters/:chapterId/read', element: <ReaderPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'progress', element: <ProgressDashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },

      {
        path: 'ai-tutor',
        element: <PlaceholderPage title="AI Tutor Chat" description="Ask questions and get quick explanations for difficult topics." />,
      },
      {
        path: 'quiz-generator',
        element: <PlaceholderPage title="Quiz Generator" description="Generate topic-wise quizzes from your selected subject and chapter." />,
      },
      {
        path: 'summary-mode',
        element: <PlaceholderPage title="Summary Mode" description="Open concise chapter summaries for fast revision before tests." />,
      },
      {
        path: 'bookmarks',
        element: <PlaceholderPage title="Saved Bookmarks" description="All your saved highlights and chapter jump points are listed here." />,
      },
      {
        path: 'profile',
        element: <PlaceholderPage title="Student Profile" description="Track your progress, achievements, and study streak in one place." />,
      },
    ],
  },
]);