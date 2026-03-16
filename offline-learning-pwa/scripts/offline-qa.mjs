import { chromium } from '@playwright/test';

const baseURL = process.env.PWA_BASE_URL || 'http://127.0.0.1:4173';
const apiURL = process.env.SYNC_API_URL || 'http://127.0.0.1:3000/api/offline-study';

const results = [];

function record(name, passed, detail) {
  results.push({ name, passed, detail });
}

async function check(name, fn) {
  try {
    const detail = await fn();
    record(name, true, detail || 'OK');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    record(name, false, message);
  }
}

function printResults() {
  const passed = results.filter((item) => item.passed).length;
  const failed = results.length - passed;

  console.log('OFFLINE_QA_RESULTS_START');
  for (const item of results) {
    console.log(`${item.passed ? 'PASS' : 'FAIL'} | ${item.name} | ${item.detail}`);
  }
  console.log(`SUMMARY | total=${results.length} passed=${passed} failed=${failed}`);
  console.log('OFFLINE_QA_RESULTS_END');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await check('Online first load renders dashboard shell', async () => {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your offline learning dashboard is ready', { timeout: 20000 });
    return `loaded ${baseURL}`;
  });

  await check('Service worker is controlling page', async () => {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null, null, {
      timeout: 20000,
    });

    const cacheKeys = await page.evaluate(async () => caches.keys());
    const hasLearningCache = cacheKeys.some((key) => key.startsWith('offline-learning-'));
    if (!hasLearningCache) {
      throw new Error(`No offline-learning-* caches found. keys=${cacheKeys.join(',')}`);
    }

    return `controller active, caches=${cacheKeys.join(',')}`;
  });

  await check('Study API request succeeds online (cache priming)', async () => {
    const prime = await page.evaluate(async (url) => {
      const response = await fetch(url, { cache: 'no-store' });
      const text = await response.text();
      return {
        ok: response.ok,
        status: response.status,
        preview: text.slice(0, 80),
      };
    }, apiURL);

    if (!prime.ok) {
      throw new Error(`status=${prime.status} preview=${prime.preview}`);
    }

    return `status=${prime.status}`;
  });

  await check('Offline reload works (cache-first/network-fallback behavior)', async () => {
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=You are offline.', { timeout: 15000 });
    await page.waitForSelector('text=Your offline learning dashboard is ready', { timeout: 15000 });
    return 'offline banner and dashboard are visible';
  });

  await check('Cached API fallback works while offline', async () => {
    const offlineFetch = await page.evaluate(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        const text = await response.text();
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = null;
        }

        return {
          ok: response.ok,
          status: response.status,
          hasSubjects: Array.isArray(parsed?.subjects),
          offlineError: parsed?.error === 'offline',
          preview: text.slice(0, 80),
        };
      } catch (error) {
        return { transportError: String(error) };
      }
    }, apiURL);

    if (offlineFetch.transportError) {
      throw new Error(offlineFetch.transportError);
    }

    const isCachedSuccess = offlineFetch.status === 200 && offlineFetch.hasSubjects;
    const isStructuredOfflineFallback = offlineFetch.status === 503 && offlineFetch.offlineError;

    if (!isCachedSuccess && !isStructuredOfflineFallback) {
      throw new Error(`unexpected response status=${offlineFetch.status} preview=${offlineFetch.preview}`);
    }

    return `status=${offlineFetch.status} cachedSuccess=${isCachedSuccess} structuredFallback=${isStructuredOfflineFallback}`;
  });

  await browser.close();
  printResults();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
