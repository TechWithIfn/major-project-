# Offline Learning PWA (React + Vite)

This project is an installable offline-first learning app for students, now structured as a complete learning dashboard called Learning Hub.

## Features

- React + Vite + TypeScript setup
- Tailwind CSS responsive, mobile-first layouts
- React Router navigation with working routes
- Sidebar dashboard navigation (desktop + mobile collapsible)
- Lucide icon-based menu and subject cards
- PWA manifest for mobile installation
- Service worker with offline caching
- IndexedDB and localStorage usage for offline study state
- Dark mode toggle and cache-clearing settings

## Folder Structure

```text
offline-learning-pwa/
  public/
    icons/
      icon-192.png
      icon-512.png
    manifest.json
    offline.html
    sw.js
  src/
    app/
      router.tsx
    components/
      navigation/
        sidebar.tsx
      ui/
        progress-bar.tsx
        stat-card.tsx
        subject-card.tsx
      lesson-card.tsx
    data/
      app-data.ts
      lessons.ts
    layouts/
      dashboard-layout.tsx
    lib/
      db.ts
      icons.tsx
      storage.ts
      sw-register.ts
    pages/
      chapters-page.tsx
      home-page.tsx
      not-found-page.tsx
      placeholder-page.tsx
      quiz-page.tsx
      reader-page.tsx
      settings-page.tsx
      subjects-page.tsx
    App.tsx
    index.css
    main.tsx
    types.ts
    vite-env.d.ts
  .gitignore
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
```

## Implemented Pages and Routes

- `/` Dashboard (welcome, quick stats, quick actions, recent activity)
- `/subjects` Subjects grid
- `/subjects/:subjectId/chapters` Chapters list with progress indicators
- `/subjects/:subjectId/chapters/:chapterId/read` Study material reader with bookmarks and reading progress
- `/quiz` Quiz with MCQ answers, navigation, and score result
- `/settings` Dark mode, storage info, clear cache, app version
- `/ai-tutor` Placeholder dashboard page
- `/quiz-generator` Placeholder dashboard page
- `/summary-mode` Placeholder dashboard page
- `/bookmarks` Placeholder dashboard page
- `/profile` Placeholder dashboard page

## Setup Instructions

1. Open a terminal in `offline-learning-pwa`.
2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

5. Preview production build:

```bash
npm run preview
```

## UI Notes

- Sidebar has active route highlighting and icons for each menu item.
- On mobile, sidebar becomes a collapsible slide-over menu.
- The layout is responsive for mobile, tablet, and desktop.
- All routes render valid UI to avoid blank screens.

## PWA Install (Mobile)

- Open the deployed app in a mobile browser (HTTPS required in production).
- Use `Install App` button if shown, or browser menu option `Add to Home Screen`.
- The app runs in standalone mode once installed.

## Offline Behavior

- The service worker caches app shell files and visited pages.
- Lessons are seeded in IndexedDB for offline learning support.
- UI preferences/bookmarks are stored locally for quick access.
- Students can continue studying without internet after first load.

## QA Smoke Checklist

For release validation and regression checks, run the documented smoke plan:

- [docs/QA_SMOKE_CHECKLIST.md](docs/QA_SMOKE_CHECKLIST.md)