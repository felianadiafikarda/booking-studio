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

async function recordOwner() {
  console.log('=== RECORDING OWNER (TARGET ~28 SECONDS) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Authenticate as Owner
  console.log('Authenticating as owner@luminafoto.com...');
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@luminafoto.com', password: 'password123' }),
    });
  });

  // Navigate to /admin/bookings
  await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'networkidle0' });
  await injectOverlays(page);

  const outputPath = path.resolve(__dirname, 'clip_3_owner.mp4');
  const recorder = new ScreenRecorder(page, outputPath, 30);
  await recorder.start();
  console.log('Recorder started...');

  // Scene 3.1: Kelola Booking & Ubah Status (~10s)
  await setLabel(page, 'Owner • Kelola Reservasi & Manajemen Status');
  await sleep(800);

  // Type search filter "Dimas"
  console.log('Searching bookings table for "Dimas"...');
  const searchInput = 'input[placeholder*="Cari"]';
  await clickSelector(page, recorder, searchInput, 350);
  await typeSmooth(page, searchInput, 'Dimas', 50);
  await sleep(300);

  // Click search button
  const searchBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Cari'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (searchBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, searchBtnPos, 350);
    await clickAt(page, searchBtnPos.x, searchBtnPos.y);
  }
  await sleep(1800);

  // Click Ubah Status on first row
  console.log('Opening booking status modal...');
  const editStatusBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Ubah Status'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (editStatusBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, editStatusBtnPos, 400);
    await clickAt(page, editStatusBtnPos.x, editStatusBtnPos.y);
  }
  await sleep(1000);

  // Zoom into Status & Cash Pelunasan Studio Modal
  await performSmoothZoom(page, 960, 520, 1.35, 1000);

  // Close modal without saving
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Batal'));
    if (closeBtn) closeBtn.click();
  });
  await sleep(1500);

  // Scene 3.2: Promo & Voucher Diskon (~8s)
  console.log('Navigating to Promos...');
  await page.goto(`${BASE_URL}/admin/promos`, { waitUntil: 'networkidle0' });
  await injectOverlays(page);
  await setLabel(page, 'Owner • Manajemen Promo & Diskon Voucher');
  await sleep(1500);

  // Click + Tambah Promo Baru
  console.log('Opening Tambah Promo modal form...');
  const addPromoBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Tambah Promo Baru'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (addPromoBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, addPromoBtnPos, 400);
    await clickAt(page, addPromoBtnPos.x, addPromoBtnPos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Tambah Promo Baru'));
      if (btn) btn.click();
    });
  }
  await sleep(1000);

  // Zoom into Promo Form Modal
  await performSmoothZoom(page, 960, 520, 1.35, 1000);

  // Close modal without saving
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Batal'));
    if (closeBtn) closeBtn.click();
  });
  await sleep(1200);

  // Scene 3.3: Laporan Finansial & Ekspor Data (~10s)
  console.log('Navigating to Laporan...');
  await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle0' });
  await injectOverlays(page);
  await setLabel(page, 'Owner • Laporan Finansial & Ekspor Data');
  await sleep(800);

  // Change date filter / period view
  console.log('Showing reports summary and best sellers...');
  await sleep(1000);

  // Zoom into Ekspor CSV / Excel button & click it
  console.log('Zooming into Ekspor CSV button...');
  const exportBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Ekspor'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (exportBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, exportBtnPos, 450);
    await performSmoothZoom(page, exportBtnPos.x, exportBtnPos.y, 1.38, 1000);
    await clickAt(page, exportBtnPos.x, exportBtnPos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Ekspor'));
      if (btn) btn.click();
    });
  }
  await sleep(2000);

  await recorder.stop();
  await browser.close();
  console.log('✓ Owner clip completed successfully:', outputPath);
}

recordOwner().catch(console.error);
