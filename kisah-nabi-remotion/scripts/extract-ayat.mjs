// Ambil teks ayat (Uthmani, QuranEnc) + terjemahan Kemenag dari paket `quran-json`.
// Teks Arab TIDAK pernah diketik manual: selalu lewat skrip ini.
// Pemakaian: npm run ayat
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Tambahkan rujukan untuk episode baru di sini ("surah:ayat" atau "surah:awal-akhir").
const REFS = ['21:87', '21:88', '37:139-148', '10:98', '68:48-50'];

// Nama surah versi Indonesia (transliterasi bawaan paket memakai ejaan Inggris).
const NAMA_SURAH = {
  10: 'Yunus',
  21: "Al-Anbiya'",
  37: 'Aṣ-Ṣaffat',
  68: 'Al-Qalam',
};

const bersihkan = (s) => {
  // Hapus penanda catatan kaki Kemenag, mis. "gelap,536) " -> "gelap, "
  let t = s.replace(/([^\d(])\d+\)\s?/g, '$1 ').replace(/\s+/g, ' ').trim();
  // Sumber kadang memotong tanda kutip penutup.
  if ((t.match(/"/g) || []).length % 2 === 1) t += '"';
  return t;
};

const hasil = {};
for (const ref of REFS) {
  const [surah, range] = ref.split(':');
  const [awal, akhir = awal] = range.split('-').map(Number);
  const path = require.resolve(`quran-json/dist/chapters/id/${surah}.json`);
  const bab = JSON.parse(readFileSync(path, 'utf8'));
  for (let n = awal; n <= akhir; n++) {
    const v = bab.verses.find((x) => x.id === n);
    if (!v) throw new Error(`Ayat ${surah}:${n} tidak ditemukan`);
    hasil[`${surah}:${n}`] = {
      surah: Number(surah),
      ayat: n,
      namaSurah: NAMA_SURAH[surah] ?? bab.transliteration,
      arab: v.text,
      terjemahan: bersihkan(v.translation),
    };
  }
}

writeFileSync(
  new URL('../src/data/ayat.json', import.meta.url),
  JSON.stringify(
    {
      _sumber:
        'Teks Uthmani: QuranEnc (quranenc.com). Terjemahan: Kementerian Agama RI via QuranEnc. Diambil dari paket npm quran-json@3.1.2.',
      ayat: hasil,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Tersimpan ${Object.keys(hasil).length} ayat ke src/data/ayat.json`);
