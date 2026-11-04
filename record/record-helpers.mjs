import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:8000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ScreenRecorder {
  constructor(page, outputPath, targetFps = 30) {
    this.page = page;
    this.outputPath = outputPath;
    this.targetFps = targetFps;
    this.client = null;
    this.ffmpeg = null;
    this.isRecording = false;
    this.framePump = null;
    this.curMouse = { x: 960, y: 540 };
    this.latestFrameBuffer = null;
  }

  async start() {
    this.client = await this.page.target().createCDPSession();

    this.ffmpeg = spawn(ffmpegPath, [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-r', String(this.targetFps),
      '-i', '-',
      '-vf', `fps=${this.targetFps}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      this.outputPath,
    ]);

    this.ffmpeg.stderr.on('data', () => {});

    this.isRecording = true;

    this.client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      this.latestFrameBuffer = Buffer.from(data, 'base64');
      try {
        await this.client.send('Page.screencastFrameAck', { sessionId });
      } catch (e) {}
    });

    await this.client.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 90,
      maxWidth: 1920,
      maxHeight: 1080,
      everyNthFrame: 1,
    });

    try {
      const initSnap = await this.page.screenshot({ type: 'jpeg', quality: 90 });
      this.latestFrameBuffer = Buffer.from(initSnap);
    } catch (e) {}

    const frameIntervalMs = 1000 / this.targetFps;
    this.framePump = setInterval(() => {
      if (!this.isRecording || !this.ffmpeg || this.ffmpeg.stdin.destroyed) return;
      if (this.latestFrameBuffer) {
        try {
          this.ffmpeg.stdin.write(this.latestFrameBuffer);
        } catch (e) {}
      }
    }, frameIntervalMs);
  }

  async stop() {
    this.isRecording = false;
    if (this.framePump) {
      clearInterval(this.framePump);
      this.framePump = null;
    }

    try {
      await this.client.send('Page.stopScreencast');
    } catch (e) {}

    return new Promise((resolve) => {
      if (this.ffmpeg) {
        this.ffmpeg.stdin.end();
        this.ffmpeg.on('close', () => resolve());
      } else {
        resolve();
      }
    });
  }
}

async function injectOverlays(page) {
  await page.evaluate(() => {
    if (document.getElementById('__video_cursor_style')) return;

    const style = document.createElement('style');
    style.id = '__video_cursor_style';
    style.innerHTML = `
      #__virtual_cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 24px;
        height: 24px;
        z-index: 2147483647;
        pointer-events: none;
        transform: translate(960px, 540px);
        transition: transform 0.05s ease-out;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.45));
      }
      .click-ripple {
        position: fixed;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.45);
        border: 2px solid #f59e0b;
        transform: translate(-50%, -50%) scale(0.2);
        animation: ripple-anim 0.45s ease-out forwards;
        pointer-events: none;
        z-index: 2147483646;
      }
      @keyframes ripple-anim {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
      }
      #__video_overlay_label {
        position: fixed;
        top: 24px;
        left: 32px;
        z-index: 2147483640;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(245, 158, 11, 0.45);
        border-radius: 9999px;
        padding: 9px 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.35);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transform: translateY(-50px);
        opacity: 0;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
      }
      #__video_overlay_label.visible {
        transform: translateY(0);
        opacity: 1;
      }
      #__video_overlay_dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #f59e0b;
        box-shadow: 0 0 10px #f59e0b;
        display: inline-block;
      }
      #__video_overlay_text {
        color: #f8fafc;
        font-size: 14.5px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      /* Sensitive blur style */
      input[type="tel"],
      .sensitive-blur {
        filter: blur(6px) !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.id = '__virtual_cursor';
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.65 12.37H5.46L5.32 12.5L0.5 16.88V1.2L11.78 12.37H5.65Z" fill="#18181b" stroke="#ffffff" stroke-width="1.5"/>
      </svg>
    `;
    document.documentElement.appendChild(cursor);

    const label = document.createElement('div');
    label.id = '__video_overlay_label';
    label.innerHTML = `
      <span id="__video_overlay_dot"></span>
      <span id="__video_overlay_text">Lumina Luxe Photo Studio</span>
    `;
    document.documentElement.appendChild(label);

    window.__moveCursor = (x, y) => {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.__showRipple = (x, y) => {
      const rip = document.createElement('div');
      rip.className = 'click-ripple';
      rip.style.left = x + 'px';
      rip.style.top = y + 'px';
      document.documentElement.appendChild(rip);
      setTimeout(() => rip.remove(), 500);
    };

    window.__setOverlayLabel = (text) => {
      const el = document.getElementById('__video_overlay_label');
      const txt = document.getElementById('__video_overlay_text');
      if (!el || !txt) return;
      if (text) {
        txt.textContent = text;
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    };

    window.__zoomTo = (x, y, scale, durationMs) => {
      document.body.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      document.body.style.transformOrigin = `${x}px ${y}px`;
      document.body.style.transform = `scale(${scale})`;
    };

    window.__resetZoom = (durationMs) => {
      document.body.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      document.body.style.transform = 'scale(1)';
    };

    // Sensitive Data Masking Scanner (runs periodically)
    setInterval(() => {
      document.querySelectorAll('input[type="tel"]').forEach((el) => {
        el.style.filter = 'blur(6px)';
      });

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.id?.startsWith('__video')) continue;
        // Match Phone numbers (08..., +62...) or VA numbers (8801...)
        if (/(?:08\d{8,11}|\+?62\s?8\d{8,11}|8801\d{5,8})/.test(node.textContent)) {
          parent.style.filter = 'blur(6px)';
        }
      }
    }, 250);
  });
}

async function moveMouseSmooth(page, recorder, from, to, durationMs = 500) {
  const fps = 30;
  const steps = Math.max(12, Math.floor(durationMs / (1000 / fps)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const x = Math.round(from.x + (to.x - from.x) * ease);
    const y = Math.round(from.y + (to.y - from.y) * ease);
    if (recorder) recorder.curMouse = { x, y };
    await page.evaluate((cx, cy) => {
      if (window.__moveCursor) window.__moveCursor(cx, cy);
    }, x, y);
    await page.mouse.move(x, y);
    await sleep(Math.floor(1000 / fps));
  }
}

async function clickAt(page, x, y) {
  await page.evaluate((cx, cy) => {
    if (window.__showRipple) window.__showRipple(cx, cy);
  }, x, y);
  await page.mouse.click(x, y);
  await sleep(150);
}

async function getElementPos(page, selector) {
  return await page.evaluate((sel) => {
    let el = null;
    if (sel.startsWith('xpath=')) {
      const xp = sel.replace('xpath=', '');
      const snap = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      el = snap.singleNodeValue;
    } else {
      el = document.querySelector(sel);
    }
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.left + r.width / 2),
      y: Math.round(r.top + r.height / 2),
      left: Math.round(r.left),
      top: Math.round(r.top),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  }, selector);
}

async function moveToSelector(page, recorder, selector, durationMs = 450) {
  const pos = await getElementPos(page, selector);
  if (!pos) return null;
  const cur = recorder ? recorder.curMouse : { x: 960, y: 540 };
  await moveMouseSmooth(page, recorder, cur, { x: pos.x, y: pos.y }, durationMs);
  return pos;
}

async function clickSelector(page, recorder, selector, durationMs = 450) {
  const pos = await moveToSelector(page, recorder, selector, durationMs);
  if (pos) {
    await clickAt(page, pos.x, pos.y);
  }
  return pos;
}

async function typeSmooth(page, selector, text, delayMs = 50) {
  await page.focus(selector);
  for (const ch of text) {
    await page.keyboard.sendCharacter(ch);
    await sleep(delayMs);
  }
  await sleep(150);
}

async function smoothScroll(page, targetY, durationMs = 600) {
  const steps = 15;
  const startY = await page.evaluate(() => window.scrollY);
  const diff = targetY - startY;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const y = Math.round(startY + diff * ease);
    await page.evaluate((scY) => window.scrollTo(0, scY), y);
    await sleep(Math.floor(durationMs / steps));
  }
}

// Strictly adheres to zoom rules:
// Zoom max 1.5x, zoom-in 0.6s, hold max 1.0s, zoom-out 0.5s (total ~2.1s)
async function performSmoothZoom(page, x, y, scale = 1.35, holdMs = 1000) {
  await page.evaluate((zx, zy, zs) => {
    if (window.__zoomTo) window.__zoomTo(zx, zy, zs, 600);
  }, x, y, scale);
  await sleep(600);
  await sleep(Math.min(1000, holdMs));
  await page.evaluate(() => {
    if (window.__resetZoom) window.__resetZoom(500);
  });
  await sleep(500);
}

async function setLabel(page, text) {
  await page.evaluate((t) => {
    if (window.__setOverlayLabel) window.__setOverlayLabel(t);
  }, text);
}

export {
  CHROME_PATH,
  BASE_URL,
  sleep,
  ScreenRecorder,
  injectOverlays,
  moveMouseSmooth,
  clickAt,
  getElementPos,
  moveToSelector,
  clickSelector,
  typeSmooth,
  smoothScroll,
  performSmoothZoom,
  setLabel,
};

