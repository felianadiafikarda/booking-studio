import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CHROME_PATH,
  BASE_URL,
  ScreenRecorder,
  injectOverlays,
  moveMouseSmooth,
  clickAt,
  moveToSelector,
  clickSelector,
  typeSmooth,
  smoothScroll,
  performSmoothZoom,
  setLabel,
  sleep,
} from './record-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function recordAdmin() {
  console.log('=== RECORDING ADMIN (TARGET ~22 SECONDS) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Authenticate as Admin
  console.log('Authenticating as admin@luminafoto.com...');
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@luminafoto.com', password: 'password123' }),
    });
  });

  // Navigate to /admin
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
  await injectOverlays(page);

  const outputPath = path.resolve(__dirname, 'clip_2_admin.mp4');
  const recorder = new ScreenRecorder(page, outputPath, 30);
  await recorder.start();
  console.log('Recorder started...');

  // Scene 2.1: Dashboard Ringkasan & Statistik (~7s)
  await setLabel(page, 'Admin Studio • Dashboard Ringkasan & Statistik');
  await sleep(1500);

  // Zoom into KPI Stat Cards
  console.log('Zooming into KPI statistics cards...');
  await performSmoothZoom(page, 960, 360, 1.35, 1000);
  await sleep(1000);

  // Move mouse over recent bookings
  await smoothScroll(page, 350, 600);
  await sleep(1800);

  // Scene 2.2: Kalender Jadwal Foto Timeline (~7s)
  console.log('Navigating to Kalender Jadwal...');
  await page.goto(`${BASE_URL}/admin/calendar`, { waitUntil: 'networkidle0' });
  await injectOverlays(page);
  await setLabel(page, 'Admin Studio • Kalender Jadwal Sesi Foto Timeline');
  await sleep(800);

  // Click next day chevron button ('>') to reveal scheduled sessions
  console.log('Clicking next day button to show active sessions...');
  const nextDayBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.querySelector('svg.lucide-chevron-right'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (nextDayBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, nextDayBtnPos, 400);
    await clickAt(page, nextDayBtnPos.x, nextDayBtnPos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.querySelector('svg.lucide-chevron-right'));
      if (btn) btn.click();
    });
  }
  await sleep(1200);

  // Zoom into scheduled event
  await performSmoothZoom(page, 960, 520, 1.35, 1000);

  // Click session event to open modal
  console.log('Opening session details modal...');
  await page.evaluate(() => {
    const eventCards = Array.from(document.querySelectorAll('div[class*="rounded-xl border"][class*="cursor-pointer"]'));
    if (eventCards.length > 0) eventCards[0].click();
  });
  await sleep(1500);

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button');
    if (closeBtn) closeBtn.click();
  });
  await sleep(600);

  // Scene 2.3: Paket & Add-on Studio (~8s)
  console.log('Navigating to Paket & Add-on...');
  await page.goto(`${BASE_URL}/admin/packages`, { waitUntil: 'networkidle0' });
  await injectOverlays(page);
  await setLabel(page, 'Admin Studio • Manajemen Paket & Add-on Studio');
  await sleep(800);

  // Click Edit on the first package
  console.log('Opening edit package modal...');
  const editBtnPos = await page.evaluate(() => {
    const editBtns = Array.from(document.querySelectorAll('button'));
    const btn = editBtns.find(b => b.querySelector('svg.lucide-edit-2') || b.textContent.includes('Edit'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (editBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, editBtnPos, 400);
    await clickAt(page, editBtnPos.x, editBtnPos.y);
  } else {
    await page.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll('button'));
      const btn = editBtns.find(b => b.querySelector('svg.lucide-edit-2') || b.textContent.includes('Edit'));
      if (btn) btn.click();
    });
  }
  await sleep(600);

  // Zoom into Edit Package Form Modal
  await performSmoothZoom(page, 960, 540, 1.35, 1000);

  // Close modal without saving
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Batal'));
    if (closeBtn) closeBtn.click();
  });
  await sleep(600);

  // Switch tab to Add-on
  console.log('Switching to Add-on tab...');
  const addonTabPos = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(b => b.textContent && b.textContent.includes('Add-on'));
    if (!tab) return null;
    const r = tab.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (addonTabPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, addonTabPos, 400);
    await clickAt(page, addonTabPos.x, addonTabPos.y);
  } else {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const tab = tabs.find(b => b.textContent && b.textContent.includes('Add-on'));
      if (tab) tab.click();
    });
  }
  await sleep(2500);

  await recorder.stop();
  await browser.close();
  console.log('✓ Admin clip completed successfully:', outputPath);
}

recordAdmin().catch(console.error);
