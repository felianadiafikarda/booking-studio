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

async function recordPembeli() {
  console.log('=== RECORDING PEMBELI (TARGET ~52 SECONDS) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Pre-authenticate as pelanggan@gmail.com
  console.log('Pre-authenticating customer session...');
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pelanggan@gmail.com', password: 'password123' })
    });
  });

  // Start at Public Homepage (SEBELUM LOGIN customer view)
  console.log('Navigating to Public Homepage...');
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
  await injectOverlays(page);

  const outputPath = path.resolve(__dirname, 'clip_1_pembeli.mp4');
  const recorder = new ScreenRecorder(page, outputPath, 30);
  await recorder.start();
  console.log('Recorder started...');

  // ==========================================
  // SECTION A: Website Publik (~12 detik)
  // ==========================================
  // Scene 1.1: Beranda & Menu Navigasi
  await setLabel(page, 'Lumina Luxe • Website Publik Studio Foto');
  await sleep(1500);

  // Move mouse to Navbar menus (Paket Foto, Galeri, Cek Booking, FAQ)
  const navPos = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return null;
    const r = nav.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (navPos) {
    await moveMouseSmooth(page, recorder, { x: 960, y: 540 }, navPos, 600);
    await sleep(800);
  }

  // Scene 1.2: Scroll halus ke bagian paket foto
  console.log('Scrolling to featured packages...');
  await setLabel(page, 'Katalog Paket Foto & Fasilitas Studio');
  await smoothScroll(page, 1850, 1500);
  await sleep(600);

  // Zoom 1: Kartu Paket Prewedding Cinematic
  console.log('Zooming into Prewedding package card...');
  await performSmoothZoom(page, 560, 620, 1.35, 1000);
  await sleep(400);

  // Scene 1.3: Klik "Pilih & Jadwalkan"
  console.log('Clicking Pilih & Jadwalkan...');
  const chooseBtnPos = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/booking/prewedding-cinematic"]'));
    const btn = links[links.length - 1];
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (chooseBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, chooseBtnPos, 450);
    await clickAt(page, chooseBtnPos.x, chooseBtnPos.y);
  } else {
    await page.goto(`${BASE_URL}/booking/prewedding-cinematic`, { waitUntil: 'networkidle0' });
  }

  // Wait for Booking Stepper to load via SPA transition
  try {
    await page.waitForFunction(() => window.location.pathname.includes('/booking/'), { timeout: 3000 });
  } catch (e) {
    await page.goto(`${BASE_URL}/booking/prewedding-cinematic`, { waitUntil: 'networkidle0' });
  }
  await injectOverlays(page);
  await sleep(800);

  // ==========================================
  // SECTION B: Wizard Booking (Semua 5 Langkah) (~40 detik)
  // ==========================================

  // STEP 1: Paket & Waktu (~8s)
  console.log('Step 1: Paket & Waktu...');
  await setLabel(page, 'Langkah 1/5 • Pilih Jadwal & Jam Sesi Foto');
  await sleep(800);

  // Wait for available slots
  await page.waitForSelector('button', { timeout: 4000 });
  await sleep(600);

  // Zoom 2: Grid Slot Jam
  await performSmoothZoom(page, 800, 680, 1.35, 1000);

  // Click available slot
  console.log('Selecting slot...');
  const slotBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const slot = btns.find(b => !b.disabled && /\d{2}:\d{2}/.test(b.textContent || ''));
    if (!slot) return null;
    slot.scrollIntoView({ block: 'center' });
    const r = slot.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (slotBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, slotBtnPos, 400);
    await clickAt(page, slotBtnPos.x, slotBtnPos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const slot = btns.find(b => !b.disabled && /\d{2}:\d{2}/.test(b.textContent || ''));
      if (slot) slot.click();
    });
  }
  await sleep(800);

  // Scroll down to click Lanjut ke Add-on
  console.log('Scrolling down to click Lanjut ke Add-on...');
  await smoothScroll(page, 650, 600);
  await sleep(400);

  const nextStep1Pos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('lanjut ke add-on'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (nextStep1Pos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, nextStep1Pos, 450);
    await clickAt(page, nextStep1Pos.x, nextStep1Pos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('lanjut ke add-on'));
      if (btn) btn.click();
    });
  }
  await sleep(1500);

  // STEP 2: Add-on (~7s)
  console.log('Step 2: Add-on...');
  await setLabel(page, 'Langkah 2/5 • Pilih Tambahan (Add-On)');
  await smoothScroll(page, 0, 400);
  await sleep(600);

  // Click Plus on Frame 12R Addon
  const plusAddonPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const plus = btns.find(b => b.querySelector('svg.lucide-plus'));
    if (!plus) return null;
    const r = plus.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (plusAddonPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, plusAddonPos, 400);
    await clickAt(page, plusAddonPos.x, plusAddonPos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const plus = btns.find(b => b.querySelector('svg.lucide-plus'));
      if (plus) plus.click();
    });
  }
  await sleep(600);

  // Zoom 3: Ringkasan Pesanan (shows price updated)
  console.log('Zooming into Ringkasan Pesanan...');
  await performSmoothZoom(page, 1550, 480, 1.35, 1000);
  await sleep(400);

  // Click "Lanjut ke Data Diri"
  console.log('Clicking Lanjut ke Data Diri...');
  const nextStep2Pos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('lanjut ke data diri'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (nextStep2Pos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, nextStep2Pos, 400);
    await clickAt(page, nextStep2Pos.x, nextStep2Pos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('lanjut ke data diri'));
      if (btn) btn.click();
    });
  }
  await sleep(1500);

  // STEP 3: Data Pemesan (~6s)
  console.log('Step 3: Data Pemesan...');
  await setLabel(page, 'Langkah 3/5 • Verifikasi Data Pemesan');
  await smoothScroll(page, 0, 400);
  await sleep(800);

  // Type note
  const notesSelector = 'textarea';
  const hasNotes = await page.$(notesSelector);
  if (hasNotes) {
    await clickSelector(page, recorder, notesSelector, 350);
    await typeSmooth(page, notesSelector, 'Konsep foto earth tone & warm aesthetic', 40);
    await sleep(400);
  }

  // Click "Lanjut ke Ringkasan & Bayar"
  console.log('Clicking Lanjut ke Ringkasan & Bayar...');
  const nextStep3Pos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('ringkasan & bayar'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (nextStep3Pos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, nextStep3Pos, 400);
    await clickAt(page, nextStep3Pos.x, nextStep3Pos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('ringkasan & bayar'));
      if (btn) btn.click();
    });
  }
  await sleep(1500);

  // STEP 4: Ringkasan & Pembayaran (~10s)
  console.log('Step 4: Ringkasan & Pembayaran...');
  await setLabel(page, 'Langkah 4/5 • Terapkan Promo Diskon & Opsi DP');
  await smoothScroll(page, 0, 400);
  await sleep(600);

  // Promo voucher input
  const promoInput = 'input[placeholder*="LUMINA10"], input[placeholder*="Contoh"]';
  await clickSelector(page, recorder, promoInput, 400);
  await typeSmooth(page, promoInput, 'LUMINA10', 50);
  await sleep(300);

  // Click Terapkan button
  const applyBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const apply = btns.find(b => b.textContent && b.textContent.includes('Terapkan'));
    if (!apply) return null;
    const r = apply.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (applyBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, applyBtnPos, 350);
    await clickAt(page, applyBtnPos.x, applyBtnPos.y);
  }
  await sleep(1200);

  // Zoom 4: Promo Discount Badge & Summary
  await performSmoothZoom(page, 1550, 560, 1.38, 1000);
  await sleep(400);

  // Select DP 30% option
  console.log('Selecting Uang Muka (DP 30%)...');
  const dpOptionPos = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const dp = divs.find(d => d.textContent && d.textContent.includes('Uang Muka (DP 30%)'));
    if (!dp) return null;
    const r = dp.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (dpOptionPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, dpOptionPos, 400);
    await clickAt(page, dpOptionPos.x, dpOptionPos.y);
  }
  await sleep(600);

  // Click Kunci Slot & Bayar
  console.log('Clicking Kunci Slot & Bayar...');
  const payBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && (b.textContent.includes('Kunci Slot') || b.textContent.includes('Bayar')));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (payBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, payBtnPos, 400);
    await clickAt(page, payBtnPos.x, payBtnPos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Kunci Slot & Bayar'));
      if (btn) btn.click();
    });
  }
  await sleep(2500);

  // STEP 5: Selesaikan (~9s)
  console.log('Step 5: Pembayaran QRIS & Slot Hold...');
  await injectOverlays(page);
  await setLabel(page, 'Langkah 5/5 • QRIS & Batas Waktu Hold Slot');
  await smoothScroll(page, 0, 400);
  await sleep(600);

  // Zoom 5: QRIS Frame & Countdown
  await performSmoothZoom(page, 720, 520, 1.35, 1000);
  await sleep(400);

  // Click Simulasikan Pembayaran Berhasil
  console.log('Clicking Simulasikan Pembayaran Berhasil...');
  const simBtnPos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sim = btns.find(b => b.textContent && b.textContent.includes('Simulasikan Pembayaran Berhasil'));
    if (!sim) return null;
    const r = sim.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (simBtnPos) {
    await moveMouseSmooth(page, recorder, recorder.curMouse, simBtnPos, 450);
    await clickAt(page, simBtnPos.x, simBtnPos.y);
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sim = btns.find(b => b.textContent && b.textContent.includes('Simulasikan Pembayaran Berhasil'));
      if (sim) sim.click();
    });
  }

  // Wait for redirect to E-Ticket Status page
  try {
    await page.waitForFunction(() => window.location.pathname.includes('/booking/status/'), { timeout: 3500 });
  } catch (e) {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const direct = btns.find(b => b.textContent && b.textContent.includes('Halaman Status'));
      if (direct) direct.click();
    });
    await sleep(1500);
  }
  await sleep(1000);

  // Confirm redirected to E-Ticket Status
  console.log('Confirmation / E-Ticket page...');
  await injectOverlays(page);
  await setLabel(page, 'Selesai • E-Ticket QR Code Terbit (Terkonfirmasi)');
  await sleep(600);

  // Zoom 6: E-Ticket QR Code & Confirmed Badge
  await performSmoothZoom(page, 960, 480, 1.4, 1000);
  await sleep(1500);

  await recorder.stop();
  await browser.close();
  console.log('✓ Pembeli clip completed successfully:', outputPath);
}

recordPembeli().catch(console.error);

