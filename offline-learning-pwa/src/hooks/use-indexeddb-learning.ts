import {
  useOfflineBookmarks,
  useOfflineChapterBundle,
  useOfflineSubjectChapters,
  useOfflineSubjects,
  useProgressDashboard,
  useProgressTracker,
} from './use-offline-study';

// Compatibility wrapper: keep old hook names mapped to the canonical module.
export const useIndexedDbSubjects = useOfflineSubjects;
export const useIndexedDbSubjectChapters = useOfflineSubjectChapters;
export const useIndexedDbReaderContent = useOfflineChapterBundle;
export const useIndexedDbBookmarks = useOfflineBookmarks;
export const useIndexedDbProgressDashboard = useProgressDashboard;
export const useIndexedDbProgressTracker = useProgressTracker;
