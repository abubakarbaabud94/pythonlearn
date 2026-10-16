import type { Episode } from '../types';

// Setiap klaim di narasi harus punya `sumber`. Ayat Al-Qur'an -> tipe 'quran'.
// Penjelasan ulama -> tipe 'tafsir' (tampil dengan label & warna berbeda).
export const yunus: Episode = {
  id: 'yunus',
  nomor: 21,
  seri: 'KISAH 25 NABI',
  judul: 'Nabi Yunus',
  hook: { baris1: 'SATU KALIMAT', baris2: 'DARI PERUT IKAN' },
  penutup: {
    part: 'PART 2',
    teaser: 'Satu-satunya kaum yang imannya menolak azab',
    rujukan: 'QS. YUNUS : 98',
  },
  audio: { ambience: 'audio/ambience-laut.mp3' },
  scenes: [
    {
      id: 'hook',
      detik: 5,
      latar: 'bawah-laut-gelap',
      overlay: 'hook',
      kamera: { dari: { x: 0, y: 0, zoom: 1.05 }, ke: { x: -40, y: 20, zoom: 1.15 } },
      narasi: 'Ditelan ikan besar. Di tengah lautan. Dalam gelap gulita. Dan doanya… hanya satu kalimat.',
    },
    {
      id: 'pergi',
      detik: 8,
      latar: 'kota-senja',
      kamera: { dari: { x: -60, y: 40, zoom: 1.14 }, ke: { x: 70, y: 0, zoom: 1.0 } },
      narasi: 'Yunus termasuk salah seorang rasul. Namun suatu hari, ia pergi meninggalkan kaumnya dalam keadaan marah.',
      sumber: { tipe: 'quran', label: "Aṣ-Ṣaffat: 139 · Al-Anbiya': 87" },
    },
    {
      id: 'kapal',
      detik: 9,
      latar: 'badai',
      kamera: { dari: { x: 0, y: 0, zoom: 1.08 }, ke: { x: 40, y: -30, zoom: 1.18 } },
      narasi: 'Ia lari menuju kapal yang penuh muatan. Lalu diadakan undian… dan Yunus termasuk yang kalah.',
      sumber: { tipe: 'quran', label: 'Aṣ-Ṣaffat: 140–141' },
    },
    {
      id: 'ditelan',
      detik: 7,
      latar: 'bawah-laut',
      kaligrafi: '37:142',
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: 0, zoom: 1.06 } },
      narasi: 'Maka ia ditelan oleh ikan besar, dalam keadaan tercela.',
      sumber: { tipe: 'quran', label: 'Aṣ-Ṣaffat: 142' },
    },
    {
      id: 'tiga-kegelapan',
      detik: 9,
      latar: 'kegelapan',
      overlay: 'tiga-kegelapan',
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: 0, zoom: 1.1 } },
      narasi:
        'Para mufassir menjelaskan, ia berada dalam tiga kegelapan sekaligus: gelapnya malam, gelapnya lautan, dan gelapnya perut ikan.',
      sumber: { tipe: 'tafsir', label: "Ibnu Katsir, QS. Al-Anbiya': 87" },
    },
    {
      id: 'doa',
      detik: 14,
      latar: 'doa',
      overlay: 'ayat',
      ayat: '21:87',
      sorotKataTerakhir: 9,
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: 0, zoom: 1.06 } },
      narasi:
        'Di dalam kegelapan itu, ia berseru: Tidak ada tuhan selain Engkau. Mahasuci Engkau. Sungguh, aku termasuk orang-orang yang zalim.',
    },
    {
      id: 'dikabulkan',
      detik: 10,
      latar: 'cahaya',
      kamera: { dari: { x: 0, y: 120, zoom: 1.1 }, ke: { x: 0, y: -80, zoom: 1.0 } },
      narasi:
        'Seandainya ia bukan orang yang banyak bertasbih, ia akan tetap di perut ikan sampai Hari Berbangkit. Namun Allah mengabulkan doanya dan menyelamatkannya.',
      sumber: { tipe: 'quran', label: "Aṣ-Ṣaffat: 143–144 · Al-Anbiya': 88" },
    },
    {
      id: 'daratan',
      detik: 9,
      latar: 'pantai-fajar',
      kamera: { dari: { x: -60, y: 20, zoom: 1.12 }, ke: { x: 40, y: 0, zoom: 1.0 } },
      narasi:
        'Ia dilemparkan ke daratan yang tandus dalam keadaan sakit. Lalu ditumbuhkan untuknya sebatang pohon labu.',
      sumber: { tipe: 'quran', label: 'Aṣ-Ṣaffat: 145–146' },
    },
    {
      id: 'penutup',
      detik: 7,
      latar: 'penutup',
      overlay: 'penutup',
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: -20, zoom: 1.12 } },
      narasi: 'Lalu bagaimana nasib kaumnya? Satu-satunya kaum yang imannya menolak azab.',
    },
  ],
};
