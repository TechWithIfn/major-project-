# Learning Hub PWA QA Smoke Checklist

Use this checklist for fast release verification of navigation, blank-screen safety, offline behavior, and update flow.

## 1) Pre-check Setup

1. Install dependencies:
   - `npm install`
2. Build the app:
   - `npm run build`
3. Start preview server:
   - `npm run preview`
4. Open the preview URL in Chrome.
5. Open DevTools:
   - Application tab (Service Workers, Storage)
   - Network tab
   - Console tab

## 2) Navigation Smoke (All Main Routes)

Expected for each route:
- Route loads without blank screen.
- No uncaught runtime error in console.
- No broken layout shell.

Check these routes in order:
1. `/dashboard`
2. `/subjects`
3. `/subjects/mathematics/chapters` (or any real subject id from your seeded data)
4. `/subjects/mathematics/chapters/fractions/read` (or any real chapter id)
5. `/quiz`
6. `/progress`
7. `/bookmarks`
8. `/ai-tutor`
9. `/quiz-generator`
10. `/summary-mode`
11. `/profile`
12. `/settings`

Deep-link checks:
1. Open `/subjects/mathematics` directly and verify redirect to `/subjects/mathematics/chapters`.
2. Open Reader route directly and verify chapter content appears.
3. Open an invalid route and verify fallback navigation behavior.

## 3) Core Feature Smoke

### Subjects -> Chapters -> Reader

1. From Subjects, open a subject card.
2. From Chapters, open a chapter.
3. In Reader:
   - verify textbook and notes content renders
   - toggle bookmark button and verify state changes
   - scroll and verify reading position resumes after refresh
   - mark chapter complete and verify status updates

### Quiz

1. Open Quiz route.
2. Answer MCQs across multiple questions.
3. Submit and verify:
   - score is calculated
   - result view appears
   - per-question review shows selected answer, correct answer, explanation

### Progress Dashboard

1. Open Progress route.
2. Verify summary stats:
   - subjects count
   - completed chapters
   - completion rate
3. Toggle chapter completion state and verify UI updates.
4. Confirm progress bars update visually.

### Bookmarks

1. Add bookmark in Reader.
2. Open Bookmarks page and verify item appears.
3. Test search by chapter and subject text.
4. Test subject filter dropdown.
5. Remove bookmark and verify item disappears.

## 4) Offline Simulation Smoke

### First-load cache warmup

1. While online, visit all major routes once.
2. Verify service worker is active in DevTools Application tab.

### Offline mode test

1. In Network tab, switch to Offline.
2. Hard refresh app.
3. Verify app shell still loads (no blank screen).
4. Repeat route checks for:
   - `/dashboard`
   - `/subjects`
   - `/subjects/.../chapters`
   - `/subjects/.../chapters/.../read`
   - `/quiz`
   - `/progress`
5. Verify IndexedDB-backed data still appears.

### Offline update behavior

1. Stay offline and trigger sync/update action on Dashboard.
2. Verify no crash and user-safe message.

## 5) Update System Smoke

1. Ensure `/api/offline-study-manifest.json` is reachable.
2. Open Dashboard and verify update status text appears.
3. If update is available:
   - verify badge shows Update available
   - click Update content
   - verify success message and status transition
4. If no update:
   - verify Content is already up to date message

## 6) Console and Error Gate

Pass criteria:
1. No uncaught exceptions during route transitions.
2. No repeated red errors from service worker or router.
3. No blank-page render state.

## 7) Performance Quick Checks

1. Dashboard route should become interactive quickly after load.
2. Route transitions should not visibly stall.
3. Large recent activity list should still render smoothly.

## 8) Release Sign-off

Mark each as PASS/FAIL:

- Navigation routes
- Deep links
- Reader interactions
- Quiz scoring and review
- Progress tracking
- Bookmark workflow
- Offline shell and data
- Update check and apply
- Console clean (no blocker errors)

If any FAIL occurs:
1. Capture route URL
2. Capture console error
3. Capture reproduction steps
4. Attach screenshot/video
