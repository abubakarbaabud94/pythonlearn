import type { Caption } from '@remotion/captions';
import type { Scene } from '../types';

/**
 * Timing subtitle SEMENTARA: kata dibagi rata sepanjang scene (bobot = panjang kata).
 * Setelah voiceover direkam, ganti dengan hasil Whisper
 * (@remotion/install-whisper-cpp -> toCaptions) supaya kata menyala tepat saat diucapkan.
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
