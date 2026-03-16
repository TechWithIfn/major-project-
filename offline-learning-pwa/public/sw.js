const CACHE_NAME = 'offline-learning-cache-v3';
const HTML_CACHE_NAME = 'offline-learning-html-v1';
const ASSET_CACHE_NAME = 'offline-learning-assets-v1';
const IMAGE_CACHE_NAME = 'offline-learning-images-v1';
const STUDY_CACHE_NAME = 'offline-learning-study-v1';
const SYNC_CACHE_NAME = 'offline-learning-sync-cache-v1';
const APP_SHELL_FILES = ['/', '/index.html', '/manifest.json', '/offline.html', '/icons/icon-192.png', '/icons/icon-512.png'];
const STUDY_SYNC_TAG = 'learning-hub-study-sync';
const STUDY_SYNC_URLS = ['/api/offline-study.json', '/api/offline-study', 'http://localhost:3000/api/offline-study'];
const DB_NAME = 'learning-hub-offline-db';
const DB_VERSION = 3;

const ONE_DAY_SECONDS = 60 * 60 * 24;

function isSuccessfulResponse(response) {
  return Boolean(response) && response.ok;
}

function withCacheControl(response, maxAgeSeconds) {
  if (!response) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `public, max-age=${maxAgeSeconds}`);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function resolveFallbackResponse(fallbackResponse) {
  if (!fallbackResponse) {
    return null;
  }

  const resolved = await fallbackResponse;
  return resolved instanceof Response ? resolved : null;
}

async function cacheFirst(request, cacheName, options = {}) {
  const { fallbackResponse, revalidate = false, maxAgeSeconds = ONE_DAY_SECONDS } = options;
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    if (revalidate) {
      fetch(request)
        .then((networkResponse) => {
          if (isSuccessfulResponse(networkResponse)) {
            return cache.put(request, withCacheControl(networkResponse.clone(), maxAgeSeconds));
          }

          return undefined;
        })
        .catch(() => undefined);
    }

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (isSuccessfulResponse(networkResponse)) {
      await cache.put(request, withCacheControl(networkResponse.clone(), maxAgeSeconds));
    }
    return networkResponse;
  } catch {
    return (await resolveFallbackResponse(fallbackResponse)) ?? new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName, options = {}) {
  const { fallbackResponse, maxAgeSeconds = ONE_DAY_SECONDS } = options;
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (isSuccessfulResponse(networkResponse)) {
      await cache.put(request, withCacheControl(networkResponse.clone(), maxAgeSeconds));
    }
    return networkResponse;
  } catch {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return (await resolveFallbackResponse(fallbackResponse)) ?? new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request, cacheName, options = {}) {
  const { fallbackResponse, maxAgeSeconds = ONE_DAY_SECONDS } = options;
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (isSuccessfulResponse(networkResponse)) {
        await cache.put(request, withCacheControl(networkResponse.clone(), maxAgeSeconds));
      }
      return networkResponse;
    })
    .catch(() => null);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return (await resolveFallbackResponse(fallbackResponse)) ?? new Response('Offline', { status: 503, statusText: 'Offline' });
}

function ensureStore(database, transaction, storeName, keyPath, indexes) {
  const store = database.objectStoreNames.contains(storeName)
    ? transaction.objectStore(storeName)
    : database.createObjectStore(storeName, { keyPath });

  indexes.forEach((indexDefinition) => {
    if (!store.indexNames.contains(indexDefinition.name)) {
      store.createIndex(indexDefinition.name, indexDefinition.keyPath, indexDefinition.options);
    }
  });
}

function openStudyDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      const transaction = request.transaction;

      ensureStore(database, transaction, 'subjects', 'id', [
        { name: 'name', keyPath: 'name', options: { unique: false } },
        { name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } },
      ]);
      ensureStore(database, transaction, 'chapters', 'id', [
        { name: 'subjectId', keyPath: 'subjectId', options: { unique: false } },
        { name: 'subjectId_sortOrder', keyPath: ['subjectId', 'sortOrder'], options: { unique: false } },
        { name: 'completed', keyPath: 'completed', options: { unique: false } },
        { name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } },
      ]);
      ensureStore(database, transaction, 'studyMaterials', 'id', [
        { name: 'subjectId', keyPath: 'subjectId', options: { unique: false } },
        { name: 'chapterId', keyPath: 'chapterId', options: { unique: false } },
        { name: 'kind', keyPath: 'kind', options: { unique: false } },
        { name: 'chapterId_kind', keyPath: ['chapterId', 'kind'], options: { unique: false } },
        { name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } },
      ]);
      ensureStore(database, transaction, 'quizzes', 'id', [
        { name: 'subjectId', keyPath: 'subjectId', options: { unique: false } },
        { name: 'chapterId', keyPath: 'chapterId', options: { unique: false } },
        { name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } },
      ]);
      ensureStore(database, transaction, 'progress', 'id', [
        { name: 'chapterId', keyPath: 'chapterId', options: { unique: false } },
        { name: 'completed', keyPath: 'completed', options: { unique: false } },
        { name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } },
      ]);
      ensureStore(database, transaction, 'quizAnswers', 'id', [
        { name: 'quizId', keyPath: 'quizId', options: { unique: false } },
        { name: 'questionId', keyPath: 'questionId', options: { unique: false } },
        { name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } },
      ]);
      ensureStore(database, transaction, 'quizResults', 'id', [
        { name: 'quizId', keyPath: 'quizId', options: { unique: false } },
        { name: 'completedAt', keyPath: 'completedAt', options: { unique: false } },
        { name: 'percentage', keyPath: 'percentage', options: { unique: false } },
      ]);
      ensureStore(database, transaction, 'meta', 'key', [{ name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } }]);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open study database.'));
  });
}

function readAllRecords(database, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error(`Failed to read ${storeName}.`));
  });
}

function sanitizeBundle(bundle) {
  const safeBundle = bundle && typeof bundle === 'object' ? bundle : {};

  return {
    seededAt: typeof safeBundle.seededAt === 'string' ? safeBundle.seededAt : new Date().toISOString(),
    subjects: Array.isArray(safeBundle.subjects) ? safeBundle.subjects : [],
    chapters: Array.isArray(safeBundle.chapters)
      ? safeBundle.chapters.map((chapter) => ({
          ...chapter,
          completed: Boolean(chapter.completed),
        }))
      : [],
    materials: Array.isArray(safeBundle.materials) ? safeBundle.materials : [],
    quizzes: Array.isArray(safeBundle.quizzes) ? safeBundle.quizzes : [],
  };
}

async function fetchStudyBundleSnapshot() {
  let lastError;

  for (const endpointUrl of STUDY_SYNC_URLS) {
    try {
      const response = await fetch(endpointUrl, { cache: 'no-store' });

      if (!response.ok) {
        lastError = new Error(`Sync endpoint ${endpointUrl} returned ${response.status}.`);
        continue;
      }

      const cache = await caches.open(SYNC_CACHE_NAME);
      await cache.put(endpointUrl, response.clone());
      return sanitizeBundle(await response.json());
    } catch (error) {
      lastError = error;
    }
  }

  for (const endpointUrl of STUDY_SYNC_URLS) {
    const cachedResponse = await caches.match(endpointUrl);

    if (cachedResponse) {
      return sanitizeBundle(await cachedResponse.json());
    }
  }

  throw lastError || new Error('No study sync endpoint is reachable and no cached snapshot exists.');
}

async function applyStudyBundleToIndexedDb(bundle) {
  const database = await openStudyDatabase();
  const progressRows = await readAllRecords(database, 'progress');
  const progressByChapter = new Map(progressRows.map((progress) => [progress.chapterId, progress]));

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(['subjects', 'chapters', 'studyMaterials', 'quizzes', 'meta'], 'readwrite');
    const syncedAt = new Date().toISOString();

    bundle.subjects.forEach((subject) => {
      transaction.objectStore('subjects').put(subject);
    });

    bundle.chapters.forEach((chapter) => {
      transaction.objectStore('chapters').put({
        ...chapter,
        completed: progressByChapter.get(chapter.id)?.completed ?? Boolean(chapter.completed),
      });
    });

    bundle.materials.forEach((material) => {
      transaction.objectStore('studyMaterials').put(material);
    });

    bundle.quizzes.forEach((quiz) => {
      transaction.objectStore('quizzes').put(quiz);
    });

    transaction.objectStore('meta').put({
      key: 'lastSuccessfulSyncAt',
      value: syncedAt,
      updatedAt: syncedAt,
    });

    transaction.oncomplete = () => {
      database.close();
      resolve(syncedAt);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Failed to apply synced study bundle.'));
    };
  });
}

async function notifyClients(message) {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  clientList.forEach((client) => {
    client.postMessage(message);
  });
}

async function syncStudyLibraryInBackground() {
  const bundle = await fetchStudyBundleSnapshot();
  const syncedAt = new Date().toISOString();

  await applyStudyBundleToIndexedDb(bundle);
  await notifyClients({ type: 'study-library-synced', syncedAt });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_NAME &&
              key !== SYNC_CACHE_NAME &&
              key !== HTML_CACHE_NAME &&
              key !== ASSET_CACHE_NAME &&
              key !== IMAGE_CACHE_NAME &&
              key !== STUDY_CACHE_NAME
          )
          .map((oldKey) => {
            return caches.delete(oldKey);
          })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('sync', (event) => {
  if (event.tag === STUDY_SYNC_TAG) {
    event.waitUntil(syncStudyLibraryInBackground().catch(() => undefined));
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'sync-study-library') {
    event.waitUntil(syncStudyLibraryInBackground().catch(() => undefined));
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (STUDY_SYNC_URLS.includes(requestUrl.pathname) || STUDY_SYNC_URLS.includes(requestUrl.href)) {
    event.respondWith(
      networkFirst(event.request, STUDY_CACHE_NAME, {
        fallbackResponse: new Response(JSON.stringify({ error: 'offline', message: 'study-materials-not-available' }), {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'application/json' },
        }),
        maxAgeSeconds: ONE_DAY_SECONDS,
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      networkFirst(event.request, HTML_CACHE_NAME, {
        fallbackResponse: caches.match('/offline.html'),
        maxAgeSeconds: 60 * 60,
      })
    );
    return;
  }

  if (event.request.destination === 'style' || event.request.destination === 'script') {
    event.respondWith(
      staleWhileRevalidate(event.request, ASSET_CACHE_NAME, {
        maxAgeSeconds: ONE_DAY_SECONDS,
      })
    );
    return;
  }

  if (event.request.destination === 'image') {
    event.respondWith(
      cacheFirst(event.request, IMAGE_CACHE_NAME, {
        revalidate: true,
        maxAgeSeconds: ONE_DAY_SECONDS * 7,
      })
    );
    return;
  }

  if (isSameOrigin) {
    event.respondWith(
      cacheFirst(event.request, CACHE_NAME, {
        revalidate: true,
        maxAgeSeconds: ONE_DAY_SECONDS,
      })
    );
  }
});