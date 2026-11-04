import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import { CHROME_PATH, ScreenRecorder, sleep } from './record-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function recordTitleCards() {
  console.log('=== RECORDING TITLE CARDS (INTRO & OUTRO) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Record Intro (3.5s)
  const introUrl = 'file:///' + path.resolve(__dirname, 'intro.html').replace(/\\/g, '/');
  console.log('Loading Intro:', introUrl);
  await page.goto(introUrl, { waitUntil: 'networkidle0' });

  const introPath = path.resolve(__dirname, 'clip_0_intro.mp4');
  const recorderIntro = new ScreenRecorder(page, introPath, 30);
  await recorderIntro.start();
  console.log('Recording Intro (3.5s)...');
  await sleep(3500);
  await recorderIntro.stop();
  console.log('✓ Intro recorded:', introPath);

  // 2. Record Outro (4.5s)
  const outroUrl = 'file:///' + path.resolve(__dirname, 'outro.html').replace(/\\/g, '/');
  console.log('Loading Outro:', outroUrl);
  await page.goto(outroUrl, { waitUntil: 'networkidle0' });

  const outroPath = path.resolve(__dirname, 'clip_4_outro.mp4');
  const recorderOutro = new ScreenRecorder(page, outroPath, 30);
  await recorderOutro.start();
  console.log('Recording Outro (4.5s)...');
  await sleep(4500);
  await recorderOutro.stop();
  console.log('✓ Outro recorded:', outroPath);

  await browser.close();
  console.log('=== INTRO & OUTRO COMPLETE ===');
}

recordTitleCards().catch(console.error);

