// Latar gaya Van Gogh (mesin huashu-art-motion di vangogh/engine) untuk satu episode.
//
//   node scripts/vangogh.mjs yunus                     -> tulis vangogh/engine/eras_<id>vg.js (timing dari voiceover)
//   node scripts/vangogh.mjs yunus --render            -> + render semua scene ke public/vangogh/<id>/<scene>.mp4
//   node scripts/vangogh.mjs yunus --render --only kapal,doa --fps 15 --jobs 4
//   node scripts/vangogh.mjs yunus --stills 0.5,4 --only kapal   -> PNG ke out/vangogh-stills/<scene>/
//
// Durasi tiap klip = durasi Sequence scene di Remotion (dur + TRANSISI, kecuali scene terakhir), dihitung sama persis
// dengan susunScene di src/Episode.tsx. Waktu event (kata pemicu, kilat, telan) ditulis ke window.VG_T dalam detik lokal scene.
// Butuh: uv (Python), ffmpeg, Chromium Playwright (PLAYWRIGHT_BROWSERS_PATH).
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENGINE = join(ROOT, 'vangogh/engine');
const FPS = 30; // fps komposisi Remotion
const TRANSISI = 15; // harus sama dengan TRANSISI di src/Episode.tsx

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const id = args[0];
if (!id || id.startsWith('--')) throw new Error('Pakai: node scripts/vangogh.mjs <id-episode> [--render] [--stills 0.5,3] [--only a,b] [--fps 15] [--jobs 4]');

// Kata pemicu per scene (regex, tidak peka huruf besar). Semua kemunculan dicatat, urut waktu.
const ACARA = {
  yunus: {
    hook: { gelap: '^gelap$', satu: '^satu$' },
    pergi: { pergi: '^pergi', marah: '^marah' },
    kapal: { kapal: '^kapal', undian: '^undian', kalah: '^kalah' },
    ditelan: { ditelan: '^ditelan', tercela: '^tercela' },
    'tiga-kegelapan': { tiga: '^tiga$', gelap: '^gelapnya' },
    doa: { seru: '^berseru', tidak: '^tidak$', zalim: '^zalim' },
    dikabulkan: { tasbih: '^bertasbih', allah: '^allah', selamat: '^menyelamatkannya' },
    daratan: { daratan: '^daratan', sakit: '^sakit', tumbuh: '^ditumbuhkan', labu: '^labu' },
    penutup: { kaum: '^kaum…?$', azab: '^azab' },
  },
};

const vo = JSON.parse(readFileSync(join(ROOT, `src/data/vo-${id}.json`), 'utf8'));
const epSrc = readFileSync(join(ROOT, `src/episodes/${id}.ts`), 'utf8');
const latarSrc = readFileSync(join(ROOT, 'src/scenes/Latar.tsx'), 'utf8');

// id & latar scene, urut seperti di file episode
const scenes = [...epSrc.matchAll(/id: '([^']+)',\s*detik: [\d.]+,\s*latar: '([^']+)'/g)].map((m) => ({ id: m[1], latar: m[2] }));
if (scenes.length !== vo.adegan.length) throw new Error(`Episode punya ${scenes.length} scene, voiceover ${vo.adegan.length}.`);
// KILAT & SAAT_TELAN dibaca dari Latar.tsx supaya SFX (gemuruh, telan) dan gambar tetap sinkron
const kilatBlok = latarSrc.match(/export const KILAT[^=]*=\s*\{([^}]*)\}/)[1];
const KILAT = Object.fromEntries([...kilatBlok.matchAll(/'?([\w-]+)'?:\s*\[([^\]]*)\]/g)].map((m) => [m[1], m[2].split(',').map(Number)]));
const SAAT_TELAN = Number(latarSrc.match(/export const SAAT_TELAN = ([\d.]+)/)[1]);

const VG_T = {};
const ERAS = [];
scenes.forEach(({ id: sid, latar }, i) => {
  const dari = Math.round(vo.adegan[i].mulai * FPS);
  const dur = Math.round(vo.adegan[i].selesai * FPS) - dari;
  const durSeq = i === scenes.length - 1 ? dur : dur + TRANSISI;
  const ev = {};
  for (const [nama, pola] of Object.entries(ACARA[id]?.[sid] ?? {})) {
    const re = new RegExp(pola, 'i');
    ev[nama] = vo.kata.filter((k) => k.adegan === i && re.test(k.text)).map((k) => (Math.round(k.start * FPS) - dari) / FPS);
  }
  if (KILAT[latar]) ev.kilat = KILAT[latar].map((f) => Math.round(durSeq * f) / FPS);
  if (latar === 'bawah-laut') ev.telan = [Math.round(durSeq * SAAT_TELAN) / FPS];
  VG_T[sid] = { dur: durSeq / FPS, ev };
  ERAS.push({ id: `vg_${sid.replace(/-/g, '_')}`, scene: sid, dur: durSeq / FPS });
});

// Film utuh (untuk preview di browser: index.html?film=<id>vg) + film satu-scene per klip (render hanya memuat scene itu)
const film = `${id}vg`;
const tulisFilm = (nama, eras) =>
  writeFileSync(
    join(ENGINE, `eras_${nama}.js`),
    `// DIHASILKAN oleh scripts/vangogh.mjs dari src/data/vo-${id}.json. Jangan edit manual.
window.FILM_SIZE = [1080, 1920];
window.FONT_FACES = []; // latar tanpa teks; teks & ayat ditangani Remotion
window.PUNCH = 0;
window.SCENE_LIBS = ['vg_lib.js'];
window.VG_T = ${JSON.stringify(VG_T, null, 1)};
window.ERAS = ${JSON.stringify(eras.map(({ id, dur }) => ({ id, dur })), null, 1)};
`,
  );
tulisFilm(film, ERAS);
for (const e of ERAS) tulisFilm(`${film}_${e.id.slice(3)}`, [e]);
console.log(`eras_${film}.js: ${ERAS.length} scene, ${ERAS.reduce((s, e) => s + e.dur, 0).toFixed(2)} dtk total`);
for (const e of ERAS) console.log(`  ${e.id.padEnd(20)} ${e.dur.toFixed(2)} dtk  ${JSON.stringify(VG_T[e.scene].ev)}`);

const only = opt('--only', '')?.split(',').filter(Boolean) ?? [];
const pilih = ERAS.filter((e) => !only.length || only.includes(e.scene));
const render = args.includes('--render'), stills = opt('--stills', null);
if (!render && !stills) process.exit(0);

const fps = Number(opt('--fps', 15));
const jobs = Number(opt('--jobs', 4));
const tugas = pilih.map((e) => {
  const base = ['run', '--with', 'playwright==1.56.0', 'python', 'render.py', '--film', `${film}_${e.id.slice(3)}`, '--solo', e.id, '--no-counter', '--width', '1080', '--height', '1920'];
  if (stills) {
    const out = join(ROOT, 'out/vangogh-stills', e.scene);
    return { e, cmd: [...base, '--stills', stills, '--out', out] };
  }
  const out = join(ROOT, 'public/vangogh', id, `${e.scene}.mp4`);
  mkdirSync(dirname(out), { recursive: true });
  return { e, cmd: [...base, '--from', '0', '--to', String(e.dur), '--fps', String(fps), '--crf', opt('--crf', '20'), '--out', out] };
});

const jalankan = ({ e, cmd }) =>
  new Promise((ok, gagal) => {
    const t0 = Date.now();
    const p = spawn('uv', cmd, { cwd: ENGINE, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    p.stdout.on('data', (d) => (log += d));
    p.stderr.on('data', (d) => (log += d));
    p.on('close', (code) => {
      if (code) return gagal(new Error(`${e.scene} gagal (${code}):\n${log}`));
      console.log(`  ✓ ${e.scene} ${((Date.now() - t0) / 1000).toFixed(0)} dtk`);
      ok();
    });
  });

const antre = [...tugas];
await Promise.all(Array.from({ length: Math.min(jobs, antre.length) }, async () => { while (antre.length) await jalankan(antre.shift()); }));
console.log(stills ? 'stills -> out/vangogh-stills/' : `klip -> public/vangogh/${id}/`);
