import { chromium } from '@playwright/test';

const base = process.env.PWA_BASE_URL || 'http://127.0.0.1:4173';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${base}/progress`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Chapter Progress by Subject');
  const progressToggle = page.locator('button:has-text("Mark Complete"), button:has-text("Mark Incomplete")').first();
  if ((await progressToggle.count()) === 0) {
    throw new Error('No progress toggle button found');
  }
  const before = (await progressToggle.textContent()) ?? 'unknown';
  await progressToggle.click();
  await page.waitForTimeout(500);
  const after = (await progressToggle.textContent()) ?? 'unknown';
  console.log(`PASS progress toggle ${before} -> ${after}`);

  await page.goto(`${base}/subjects`, { waitUntil: 'domcontentloaded' });
  await page.locator('a[href*="/subjects/"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.locator('a:has-text("Open Chapter"), a:has-text("Continue Chapter")').first().click();
  await page.waitForLoadState('domcontentloaded');
  const bookmarkBtn = page.locator('button:has-text("Add Bookmark"), button:has-text("Bookmarked")').first();
  await bookmarkBtn.click();
  await page.waitForTimeout(400);

  await page.goto(`${base}/bookmarks`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Saved Bookmarks');
  const bookmarksBody = (await page.textContent('body')) ?? '';
  if (!bookmarksBody.includes('Remove bookmark')) {
    throw new Error('Bookmark not visible in saved list');
  }
  console.log('PASS bookmark flow');

  await page.goto(`${base}/quiz`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Question 1 of');
  await page.locator('article button').first().click();
  const navBtn = page.locator('button:has-text("Next"), button:has-text("Finish Quiz")').first();
  await navBtn.click();
  console.log('PASS quiz interaction');

  await page.goto(`${base}/ai-tutor`, { waitUntil: 'domcontentloaded' });
  const input = page.locator('input[placeholder*="Ask a question"]');
  await input.fill('Explain fractions in short');
  await page.locator('button:has-text("Send")').click();
  await page.waitForSelector('text=Based on your offline materials', { timeout: 7000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const chatBody = (await page.textContent('body')) ?? '';
  if (!chatBody.includes('Explain fractions in short')) {
    throw new Error('Chat message did not persist after reload');
  }
  console.log('PASS chat persistence');

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
