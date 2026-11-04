import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function runFfmpeg(args, desc) {
  console.log(`Running: ${desc}...`);
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    p.stderr.on('data', d => { stderr += d.toString(); });
    p.on('close', code => {
      if (code === 0) {
        console.log(`✓ ${desc} completed`);
        resolve();
      } else {
        console.error(`Failed ${desc}:`, stderr);
        reject(new Error(`FFmpeg exited with ${code}`));
      }
    });
  });
}

function getDuration(filePath) {
  try {
    const out = execSync(`"${ffmpegPath}" -i "${filePath}" 2>&1`, { encoding: 'utf8' });
    const match = out.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const mins = parseFloat(match[2]);
      const secs = parseFloat(match[3]);
      return hours * 3600 + mins * 60 + secs;
    }
  } catch (e) {
    const out = e.stdout || e.stderr || '';
    const match = out.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const mins = parseFloat(match[2]);
      const secs = parseFloat(match[3]);
      return hours * 3600 + mins * 60 + secs;
    }
  }
  return 0;
}

async function editAndConcat() {
  console.log('=== EDITING & CONCATENATING LUMINA LUXE DEMO V2 VIDEO ===');

  const rawClips = [
    { id: 0, file: path.join(__dirname, 'clip_0_intro.mp4'), name: 'Intro' },
    { id: 1, file: path.join(__dirname, 'clip_1_pembeli.mp4'), name: 'Pembeli' },
    { id: 2, file: path.join(__dirname, 'clip_2_admin.mp4'), name: 'Admin' },
    { id: 3, file: path.join(__dirname, 'clip_3_owner.mp4'), name: 'Owner' },
    { id: 4, file: path.join(__dirname, 'clip_4_outro.mp4'), name: 'Outro' },
  ];

  const normClips = [];

  for (const c of rawClips) {
    const dur = getDuration(c.file);
    console.log(`Clip ${c.id} (${c.name}): duration = ${dur.toFixed(2)}s`);

    const normFile = path.join(__dirname, `norm_${c.id}.mp4`);
    normClips.push(normFile);

    // Apply fade in & fade out
    const fadeOutStart = Math.max(0, dur - 0.35);
    const vf = `fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=0.35,fade=t=out:st=${fadeOutStart.toFixed(2)}:d=0.35`;

    await runFfmpeg([
      '-y',
      '-i', c.file,
      '-vf', vf,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '19',
      '-pix_fmt', 'yuv420p',
      normFile
    ], `Normalizing clip ${c.id} (${c.name})`);
  }

  // Create concat file list
  const listFile = path.join(__dirname, 'concat_list_v2.txt');
  const listContent = normClips.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listFile, listContent);

  const finalOutput = path.join(ROOT_DIR, 'lumina-foto-demo-v2.mp4');

  await runFfmpeg([
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c', 'copy',
    finalOutput
  ], 'Concatenating all clips into final video (v2)');

  const finalDur = getDuration(finalOutput);
  const stats = fs.statSync(finalOutput);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('==============================================');
  console.log(`FINAL VIDEO GENERATED SUCCESSFULLY!`);
  console.log(`Path: ${finalOutput}`);
  console.log(`Duration: ${finalDur.toFixed(2)} seconds (Target: 105 - 115s, Max: 120s)`);
  console.log(`Size: ${sizeMb} MB`);
  console.log(`Resolution: 1920x1080 @ 30fps`);
  console.log('==============================================');
}

editAndConcat().catch(console.error);

