// Render beberapa frame sebagai PNG untuk cek visual cepat: [COMP=Yunus2] node scripts/stills.mjs 40 280 500
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? 'Yunus', browserExecutable });
for (const frame of frames) {
  const output = `out/stills/f${String(frame).padStart(4, '0')}.png`;
  await renderStill({ serveUrl, composition, frame, output, browserExecutable, overwrite: true });
  console.log(output);
}
