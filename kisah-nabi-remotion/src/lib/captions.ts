import type { Caption } from '@remotion/captions';
import type { Scene, VoData } from '../types';

/** Subtitle dari voiceover tersinkron: timing per kata hasil transkripsi. */
export const captionsDariVo = (vo: VoData): Caption[] =>
  vo.kata.map((k, i) => ({
    text: (i === 0 ? '' : ' ') + k.text,
    startMs: Math.round(k.start * 1000),
    endMs: Math.round(k.end * 1000),
    timestampMs: null,
    confidence: null,
    pageBreakAfter: vo.kata[i + 1]?.adegan !== k.adegan || /[.?!:…]$/.test(k.text),
  }));

/**
 * Timing subtitle SEMENTARA (jika belum ada voiceover): kata dibagi rata sepanjang scene (bobot = panjang kata).
 * Setelah ada voiceover, jalankan scripts/sinkron-vo.mjs dan isi `vo` di file episode.
 */
export const perkiraanCaptions = (scenes: Scene[]): Caption[] => {
  const hasil: Caption[] = [];
  let mulaiScene = 0;
  for (const s of scenes) {
    const kata = s.narasi.split(/\s+/).filter(Boolean);
    const awal = mulaiScene + 300;
    const akhir = mulaiScene + s.detik * 1000 - 400;
    const bobot = kata.map((k) => k.length + 3 + (/[.,?!:…]$/.test(k) ? 6 : 0));
    const total = bobot.reduce((a, b) => a + b, 0);
    let t = awal;
    kata.forEach((k, i) => {
      const dur = ((akhir - awal) * bobot[i]) / total;
      hasil.push({
        text: (i === 0 ? '' : ' ') + k,
        startMs: Math.round(t),
        endMs: Math.round(t + dur),
        timestampMs: null,
        confidence: null,
        // Halaman subtitle tidak boleh menyeberang ke scene berikutnya.
        pageBreakAfter: i === kata.length - 1 || /[.?!:…]$/.test(k),
      });
      t += dur;
    });
    mulaiScene += s.detik * 1000;
  }
  return hasil;
};
