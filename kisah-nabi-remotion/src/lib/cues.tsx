import { createContext, useContext } from 'react';

/** Kata voiceover yang cocok dengan `cue` scene, dengan frame relatif terhadap awal scene. */
export type Cue = { frame: number; text: string };

export const CueContext = createContext<Cue[]>([]);

export const useCueWords = (): Cue[] => useContext(CueContext);

/** Kembalikan `jumlah` titik sinkron; jika voiceover belum ada, pakai fraksi cadangan dari durasi. */
export const useCues = (jumlah: number, cadangan: number[], durasi: number): number[] => {
  const cues = useContext(CueContext);
  return cues.length >= jumlah ? cues.slice(0, jumlah).map((c) => c.frame) : cadangan.map((f) => f * durasi);
};
