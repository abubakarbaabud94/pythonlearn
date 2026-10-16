export type Latar =
  | 'bawah-laut-gelap'
  | 'kota-senja'
  | 'badai'
  | 'bawah-laut'
  | 'kegelapan'
  | 'doa'
  | 'cahaya'
  | 'pantai-fajar'
  | 'penutup'
  | 'kota-azab'
  | 'kota-taubat'
  | 'kota-fajar'
  | 'langit-malam'
  | 'mihrab-malam'
  | 'mihrab-buah'
  | 'mihrab-musim'
  | 'mihrab-cahaya'
  | 'kosmos';

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
  /** Regex kata di voiceover yang menjadi titik sinkron animasi (mis. "^gelapnya"). */
  cue?: string;
  /** Event di tengah scene yang dipicu kata di voiceover (visual dibaca latar lewat useMomen, SFX opsional). */
  momen?: Momen[];
};

export type JenisSfx = 'desir' | 'desir-lembut' | 'hantam' | 'gemuruh' | 'angin' | 'udara' | 'tik' | 'telan';

export type Momen = {
  /** Nama yang dibaca komponen latar, mis. 'buah', 'nyala', 'ledak'. */
  nama: string;
  /** Regex kata pemicu (kecocokan pertama di scene ini). */
  kata: string;
  sfx?: JenisSfx;
  gain?: number;
};

/** Hasil scripts/sinkron-vo.mjs (waktu dalam detik). */
export type VoData = {
  audio: string;
  durasi: number;
  adegan: { mulai: number; selesai: number }[];
  kata: { text: string; start: number; end: number; adegan: number }[];
};

export type Episode = {
  id: string;
  nomor: number;
  seri: string;
  /** Mis. "PART 2", ditampilkan di badge seri. */
  bagian?: string;
  judul: string;
  hook: { baris1: string; baris2: string };
  penutup: { part: string; teaser: string; rujukan: string };
  scenes: Scene[];
  /** File di public/ (opsional). */
  audio?: { ambience?: string };
  /** Voiceover tersinkron. Jika ada, durasi scene & subtitle mengikuti voiceover, bukan `detik`. */
  vo?: VoData;
};
