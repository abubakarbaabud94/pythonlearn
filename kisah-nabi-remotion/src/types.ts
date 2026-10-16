export type Latar =
  | 'bawah-laut-gelap'
  | 'kota-senja'
  | 'badai'
  | 'bawah-laut'
  | 'kegelapan'
  | 'doa'
  | 'cahaya'
  | 'pantai-fajar'
  | 'penutup';

export type Kamera = { x: number; y: number; zoom: number };

export type Sumber =
  | { tipe: 'quran'; label: string }
  // Detail di luar teks Al-Qur'an WAJIB diberi tipe 'tafsir' agar penonton tahu sumbernya.
  | { tipe: 'tafsir'; label: string };

export type Scene = {
  id: string;
  detik: number;
  latar: Latar;
  kamera: { dari: Kamera; ke: Kamera };
  narasi: string;
  sumber?: Sumber;
  overlay?: 'hook' | 'ayat' | 'tiga-kegelapan' | 'penutup';
  /** Kunci ayat dari src/data/ayat.json, mis. "21:87". */
  ayat?: string;
  /** Sorot N kata terakhir ayat (mis. bagian doa). */
  sorotKataTerakhir?: number;
  /** Kaligrafi samar raksasa di latar belakang. */
  kaligrafi?: string;
};

export type Episode = {
  id: string;
  nomor: number;
  seri: string;
  judul: string;
  hook: { baris1: string; baris2: string };
  penutup: { part: string; teaser: string; rujukan: string };
  scenes: Scene[];
  /** File di public/ (opsional). */
  audio?: { voiceover?: string; ambience?: string };
};
