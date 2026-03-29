import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

export default function App() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
          Loading learning dashboard...
        </div>
      }
    />
  );
}