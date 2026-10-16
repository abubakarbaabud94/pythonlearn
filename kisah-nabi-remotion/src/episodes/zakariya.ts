import type { Episode } from '../types';
import vo from '../data/vo-zakariya.json';

// Episode #22: Nabi Zakariya. Setiap klaim punya `sumber`; penjelasan ulama ditandai 'tafsir'.
// Tokoh (Zakariya, Maryam) dan malaikat tidak divisualisasikan: hanya ruang, benda, dan cahaya.
export const zakariya: Episode = {
  id: 'zakariya',
  nomor: 22,
  seri: 'KISAH 25 NABI',
  judul: 'Nabi Zakariya — Doa di Usia Senja',
  hook: { baris1: 'DOA YANG LEMBUT', baris2: 'DI USIA SENJA' },
  penutup: {
    part: 'NEXT',
    teaser: 'Nabi Yahya: nama yang belum pernah ada',
    rujukan: 'QS. MARYAM : 12–15',
  },
  audio: { ambience: 'audio/ambience-laut.mp3' },
  // Voiceover ElevenLabs (suara "Arthur – Wise Indonesian Narrator", eleven_v4), lihat npm run sinkron-vo-zakariya.
  vo,
  scenes: [
    {
      id: 'hook',
      detik: 8,
      latar: 'mihrab-malam',
      overlay: 'hook',
      kamera: { dari: { x: 0, y: 40, zoom: 1.15 }, ke: { x: 0, y: 0, zoom: 1.0 } },
      narasi: 'Rambutnya sudah memutih. Tulangnya sudah melemah. Istrinya mandul. Tapi ia tetap berdoa… dengan suara yang lembut.',
      momen: [{ nama: 'nyala', kata: '^berdoa', sfx: 'udara', gain: 0.45 }],
    },
    {
      id: 'pengasuh',
      detik: 11,
      latar: 'mihrab-buah',
      kamera: { dari: { x: 0, y: -60, zoom: 1.0 }, ke: { x: 0, y: 80, zoom: 1.15 } },
      narasi:
        'Zakariya adalah pengasuh Maryam. Setiap kali ia masuk ke mihrab, ia mendapati makanan di sisinya. Ia bertanya, Wahai Maryam, dari mana ini engkau peroleh? Maryam menjawab, Itu dari Allah.',
      sumber: { tipe: 'quran', label: "Āli 'Imrān: 37" },
      momen: [
        { nama: 'buah', kata: '^makanan', sfx: 'udara', gain: 0.35 },
        { nama: 'pendar', kata: '^Allah', sfx: 'udara', gain: 0.5 },
      ],
    },
    {
      id: 'luar-musim',
      detik: 6,
      latar: 'mihrab-musim',
      kamera: { dari: { x: -60, y: 0, zoom: 1.12 }, ke: { x: 60, y: 0, zoom: 1.12 } },
      narasi: 'Menurut para mufassir, makanan itu adalah buah-buahan yang tidak sedang musimnya.',
      sumber: { tipe: 'tafsir', label: "Ibnu Katsir, QS. Āli 'Imrān: 37" },
    },
    {
      id: 'di-sanalah',
      detik: 5,
      latar: 'mihrab-malam',
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: -40, zoom: 1.1 } },
      narasi: 'Melihat itu… di sanalah Zakariya berdoa kepada Tuhannya.',
      sumber: { tipe: 'quran', label: "Āli 'Imrān: 38" },
      momen: [{ nama: 'nyala', kata: '^berdoa', sfx: 'udara', gain: 0.45 }],
    },
    {
      id: 'doa',
      detik: 15,
      latar: 'doa',
      overlay: 'ayat',
      ayat: '19:4',
      sorotKataTerakhir: 13, // semua kata setelah قَالَ
      cue: '.', // kutipan doa menyala mengikuti narasi
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: 0, zoom: 1.05 } },
      narasi:
        'Dengan suara yang lembut, ia berkata: Ya Tuhanku, sungguh tulangku telah melemah dan kepalaku telah dipenuhi uban, sedang aku belum pernah kecewa dalam berdoa kepada-Mu, ya Tuhanku.',
    },
    {
      id: 'kabar-gembira',
      detik: 10,
      latar: 'mihrab-cahaya',
      kamera: { dari: { x: 0, y: 60, zoom: 1.12 }, ke: { x: 0, y: -40, zoom: 1.0 } },
      narasi:
        'Lalu para malaikat memanggilnya, ketika ia berdiri melaksanakan salat di mihrab: Allah menyampaikan kabar gembira kepadamu, dengan kelahiran Yahya.',
      sumber: { tipe: 'quran', label: "Āli 'Imrān: 39" },
      momen: [
        { nama: 'kabar', kata: '^Yahya', sfx: 'hantam', gain: 0.3 },
        { nama: 'kabar-udara', kata: '^Yahya', sfx: 'udara', gain: 0.5 },
      ],
    },
    {
      id: 'nama',
      detik: 6,
      latar: 'langit-malam',
      kaligrafi: '19:7',
      kamera: { dari: { x: 0, y: -40, zoom: 1.0 }, ke: { x: 0, y: 20, zoom: 1.08 } },
      narasi: 'Sebuah nama… yang belum pernah diberikan kepada siapa pun sebelumnya.',
      sumber: { tipe: 'quran', label: 'Maryam: 7' },
    },
    {
      id: 'bagaimana',
      detik: 15,
      latar: 'kosmos',
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: 0, zoom: 1.2 } },
      narasi:
        'Zakariya bertanya, bagaimana aku akan mempunyai anak, padahal istriku mandul dan aku sudah sangat tua? Allah berfirman: Hal itu mudah bagi-Ku. Engkau telah Aku ciptakan sebelum itu, padahal engkau belum berwujud sama sekali.',
      sumber: { tipe: 'quran', label: 'Maryam: 8–9' },
      momen: [
        { nama: 'inti', kata: '^Hal$', sfx: 'udara', gain: 0.5 },
        { nama: 'ledak', kata: '^ciptakan', sfx: 'hantam', gain: 0.32 },
      ],
    },
    {
      id: 'dikabulkan',
      detik: 10,
      latar: 'pantai-fajar',
      kamera: { dari: { x: -50, y: 20, zoom: 1.1 }, ke: { x: 40, y: 0, zoom: 1.0 } },
      narasi:
        'Maka Allah mengabulkan doanya. Sungguh, mereka selalu bersegera dalam kebaikan, dan berdoa kepada Allah dengan penuh harap dan cemas.',
      sumber: { tipe: 'quran', label: "Al-Anbiya': 90" },
    },
    {
      id: 'penutup',
      detik: 8,
      latar: 'mihrab-malam',
      overlay: 'penutup',
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: -20, zoom: 1.12 } },
      narasi: 'Ia tidak pernah kecewa dalam berdoa kepada Tuhannya. Episode berikutnya: Nabi Yahya.',
    },
  ],
};
