export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

// Zona aman 9:16: atas ±160px (tab For You), bawah ±380px (caption & tombol), kanan ±140px (tombol like/share).
export const SAFE = { top: 170, bottom: 400, side: 70, right: 150 } as const;

export const COLORS = {
  gold: '#E8C27A',
  goldDeep: '#B8863B',
  ivory: '#F6EEDD',
  ink: '#05080D',
  tafsir: '#8FB8C9',
} as const;

export const FONTS = {
  arab: '"Amiri Quran", "Scheherazade New", serif',
  judul: 'Cinzel, serif',
  teks: 'Inter, system-ui, sans-serif',
} as const;
