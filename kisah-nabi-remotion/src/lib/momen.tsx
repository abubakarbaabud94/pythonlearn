import { createContext, useContext } from 'react';

/**
 * Momen = kata di voiceover yang memicu event visual/SFX di tengah scene
 * (mis. buah muncul saat kata "makanan" diucapkan). Nilainya frame relatif terhadap awal scene.
 */
export const MomenContext = createContext<Record<string, number>>({});

/** Frame momen `nama`; tanpa voiceover pakai `cadangan` (frame). */
export const useMomen = (nama: string, cadangan: number): number => {
  const m = useContext(MomenContext);
  return m[nama] ?? cadangan;
};

/** Denyut 0→1→0: naik cepat sejak frame `mulai`, lalu meluruh. */
export const denyut = (frame: number, mulai: number, naik = 10, turun = 70) => {
  const t = frame - mulai;
  if (t < 0) return 0;
  if (t < naik) return t / naik;
  return Math.exp(-(t - naik) / (turun / 3));
};
