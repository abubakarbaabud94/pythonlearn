// Contact sheet untuk review: satu frame setiap N detik, dirender di lebar HP (360 px),
// diberi label waktu, lalu disusun 5×2 per lembar di out/sheets/<COMP>-NN.png.
// Pemakaian: node scripts/sheet.mjs <Komposisi> [jarakDetik=2.5]
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [comp = 'Yunus', jarakArg = '2.5'] = process.argv.slice(2);
const jarak = Number(jarakArg);
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const tmp = path.resolve('out/sheets/tmp', comp);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
const { fps, durationInFrames } = composition;
const frames = [];
for (let t = 0; t * fps < durationInFrames; t += jarak) frames.push(Math.min(durationInFrames - 1, Math.round(t * fps)));

for (const frame of frames) {
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: path.join(tmp, `${String(frame).padStart(5, '0')}.png`),
    browserExecutable,
    scale: 360 / composition.width,
    overwrite: true,
  });
}
const r = spawnSync('python3', ['scripts/tile-sheet.py', tmp, `out/sheets/${comp}`, String(fps)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
