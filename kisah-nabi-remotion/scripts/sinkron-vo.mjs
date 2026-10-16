// Sinkronkan voiceover dengan video:
//  1. pecah kata per scene memakai penanda "[long pause]" di transkrip,
//  2. padatkan jeda yang terlalu panjang (deteksi hening dengan ffmpeg),
//  3. normalisasi audio (-14 LUFS), opsional percepat tempo tanpa mengubah nada,
//  4. tulis src/data/vo-<id>.json: durasi tiap scene + timestamp per kata untuk subtitle.
//
// Pemakaian:
//   node scripts/sinkron-vo.mjs --id yunus --audio voiceover/yunus-raw.mp3 \
//     --kata voiceover/yunus-words.json [--tempo 1.08] [--lambat 5]
//
// --kata: JSON berisi { words: [{ text, type, start, end }] } (format ElevenLabs Scribe).
// --lambat: indeks scene (mulai 0) yang jedanya dibiarkan lebih panjang, mis. scene doa.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values: opt } = parseArgs({
  options: {
    id: { type: 'string' },
    audio: { type: 'string' },
    kata: { type: 'string' },
    tempo: { type: 'string', default: '1' },
    lambat: { type: 'string', default: '-1' },
  },
});
if (!opt.id || !opt.audio || !opt.kata) throw new Error('Wajib: --id, --audio, --kata');

const TEMPO = Number(opt.tempo);
const SCENE_LAMBAT = Number(opt.lambat);
const JEDA = { dalam: 0.5, lambat: 0.8, antarScene: 0.9, awal: 0.1, akhir: 0.4 };
const EKOR_PENUTUP = 1.8; // detik ekstra setelah kata terakhir agar CTA sempat terbaca

// 1. Kelompokkan kata per scene; tag [..] bukan ucapan, "[long pause]" = batas scene.
const raw = JSON.parse(readFileSync(opt.kata, 'utf8')).words.filter((w) => w.type === 'word');
const scenes = [[]];
let tag = null;
for (const w of raw) {
  if (tag !== null || w.text.startsWith('[')) {
    tag = (tag ? `${tag} ` : '') + w.text;
    if (w.text.endsWith(']')) {
      if (tag === '[long pause]' && scenes.at(-1).length) scenes.push([]);
      tag = null;
    }
    continue;
  }
  scenes.at(-1).push({ text: w.text, start: w.start, end: w.end });
}

// 2. Deteksi hening.
// silencedetect menulis hasilnya ke stderr.
const log = spawnSync(
  'ffmpeg',
  ['-hide_banner', '-i', opt.audio, '-af', 'silencedetect=noise=-40dB:d=0.3', '-f', 'null', '-'],
  { encoding: 'utf8' },
).stderr;
const durasiAsli = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', opt.audio], {
    encoding: 'utf8',
  }),
);
const hening = [];
let mulai = null;
for (const baris of log.split('\n')) {
  const s = baris.match(/silence_start: ([\d.]+)/);
  const e = baris.match(/silence_end: ([\d.]+)/);
  if (s) mulai = Number(s[1]);
  if (e && mulai !== null) {
    hening.push([mulai, Number(e[1])]);
    mulai = null;
  }
}
if (mulai !== null) hening.push([mulai, durasiAsli]);

// Akhir kata dari transkrip sering memanjang ke dalam hening: potong di awal hening.
const semua = scenes.flat();
for (const [i, w] of semua.entries()) {
  const h = hening.find(([s]) => s > w.start && s < w.end);
  if (h) w.end = h[0] + 0.05;
  const berikut = semua[i + 1];
  if (berikut && w.end > berikut.start) w.end = berikut.start;
}

// 3. Tentukan bagian hening yang dibuang.
const batas = scenes.slice(1).map((g, i) => [scenes[i].at(-1).end, g[0].start]);
const sceneDari = (t) => scenes.findIndex((g) => t >= g[0].start - 0.01 && t <= g.at(-1).end + 0.01);
const buang = [];
for (const [s, e] of hening) {
  if (e <= semua[0].start + 0.01) {
    if (semua[0].start - JEDA.awal > 0) buang.push([0, semua[0].start - JEDA.awal]);
    continue;
  }
  if (s >= semua.at(-1).end - 0.01) {
    if (durasiAsli - s > JEDA.akhir) buang.push([s + JEDA.akhir, durasiAsli]);
    continue;
  }
  const antar = batas.some(([a, b]) => s < b && e > a);
  const target = antar ? JEDA.antarScene : sceneDari((s + e) / 2) === SCENE_LAMBAT ? JEDA.lambat : JEDA.dalam;
  if (e - s > target) buang.push([s + target / 2, e - target / 2]);
}
buang.sort((a, b) => a[0] - b[0]);

const petakan = (t) => {
  let geser = 0;
  for (const [a, b] of buang) {
    if (t >= b) geser += b - a;
    else if (t > a) return (a - geser) / TEMPO;
  }
  return (t - geser) / TEMPO;
};

// 4. Render audio: sambung bagian yang disimpan, atur tempo, bersihkan & normalisasi.
const simpan = [];
let kursor = 0;
for (const [a, b] of buang) {
  if (a > kursor) simpan.push([kursor, a]);
  kursor = b;
}
if (kursor < durasiAsli) simpan.push([kursor, durasiAsli]);
const filter =
  simpan.map(([a, b], i) => `[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[s${i}]`).join(';') +
  `;${simpan.map((_, i) => `[s${i}]`).join('')}concat=n=${simpan.length}:v=0:a=1,` +
  `atempo=${TEMPO},highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=11,volume=3dB,alimiter=limit=0.89:level=false[out]`;
const keluar = `public/audio/vo-${opt.id}.mp3`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', opt.audio, '-filter_complex', filter, '-map', '[out]', '-ar', '44100', '-b:a', '192k', keluar]);
const durasiBaru = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', keluar], {
    encoding: 'utf8',
  }),
);

// 5. Batas scene = titik tengah jeda antar-scene pada timeline baru.
const awalScene = [0, ...batas.map(([a, b]) => (petakan(a) + petakan(b)) / 2)];
const adegan = awalScene.map((m, i) => ({
  mulai: +m.toFixed(3),
  selesai: +(i + 1 < awalScene.length ? awalScene[i + 1] : durasiBaru + EKOR_PENUTUP).toFixed(3),
}));
const kata = scenes.flatMap((g, i) =>
  g.map((w) => ({ text: w.text, start: +petakan(w.start).toFixed(3), end: +petakan(w.end).toFixed(3), adegan: i })),
);

const r = (n) => n.toFixed(1);
writeFileSync(
  `src/data/vo-${opt.id}.json`,
  JSON.stringify({ audio: `audio/vo-${opt.id}.mp3`, tempo: TEMPO, durasi: +durasiBaru.toFixed(3), adegan, kata }, null, 1) + '\n',
);
console.log(`Scene terdeteksi: ${scenes.length}, kata: ${kata.length}`);
console.log(`Durasi audio: ${r(durasiAsli)} dtk -> ${r(durasiBaru)} dtk (tempo ${TEMPO}x, ${buang.length} jeda dipadatkan)`);
adegan.forEach((a, i) => console.log(`  scene ${i}: ${r(a.mulai)}–${r(a.selesai)} (${r(a.selesai - a.mulai)} dtk)`));
