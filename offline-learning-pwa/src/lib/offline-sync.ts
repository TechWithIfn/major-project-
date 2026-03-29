import { OFFLINE_STUDY_UPDATED_EVENT, saveStudyBundle, setMetaValue } from './db';
import { fetchStudyBundleFromApi } from './sync-api';

export const STUDY_SYNC_TAG = 'learning-hub-study-sync';

type SyncCapableServiceWorkerRegistration = ServiceWorkerRegistration & {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
};

function dispatchSyncEvent(detail: Record<string, unknown>): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(OFFLINE_STUDY_UPDATED_EVENT, { detail }));
}

export async function syncStudyLibraryInForeground(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return false;
  }

  try {
    await setMetaValue('lastSyncStatus', 'syncing');
    dispatchSyncEvent({ source: 'sync-started', syncedAt: new Date().toISOString() });

    const bundle = await fetchStudyBundleFromApi();
    const syncedAt = new Date().toISOString();

    await saveStudyBundle(bundle);
    await setMetaValue('lastSuccessfulSyncAt', syncedAt);
    await setMetaValue('lastSyncStatus', 'synced');
    dispatchSyncEvent({ source: 'sync-success', syncedAt });
    return true;
  } catch {
    const failedAt = new Date().toISOString();
    await setMetaValue('lastSyncFailedAt', failedAt);
    await setMetaValue('lastSyncStatus', 'failed');
    dispatchSyncEvent({ source: 'sync-failed', syncedAt: failedAt });
    return false;
  }
}

export async function scheduleStudyBackgroundSync(registration?: ServiceWorkerRegistration): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  const resolvedRegistration = (registration ?? (await navigator.serviceWorker.ready)) as SyncCapableServiceWorkerRegistration;

  if (resolvedRegistration.sync?.register) {
    try {
      await resolvedRegistration.sync.register(STUDY_SYNC_TAG);
      await setMetaValue('lastSyncRequestedAt', new Date().toISOString());
      await setMetaValue('lastSyncStatus', 'syncing');
      dispatchSyncEvent({ source: 'sync-requested', syncedAt: new Date().toISOString() });
      return true;
    } catch {
      return syncStudyLibraryInForeground();
    }
  }

  if (resolvedRegistration.active) {
    resolvedRegistration.active.postMessage({ type: 'sync-study-library' });
    return true;
  }

  return syncStudyLibraryInForeground();
}

export function initializeOfflineStudySync(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event: MessageEvent<{ type?: string; syncedAt?: string }>) => {
    if (event.data?.type !== 'study-library-synced') {
      return;
    }

    dispatchSyncEvent({ source: 'service-worker-sync', syncedAt: event.data.syncedAt ?? new Date().toISOString() });
  });

  window.addEventListener('online', () => {
    void scheduleStudyBackgroundSync();
  });

  window.addEventListener('load', () => {
    if (navigator.onLine) {
      void scheduleStudyBackgroundSync();
    }
  });
}