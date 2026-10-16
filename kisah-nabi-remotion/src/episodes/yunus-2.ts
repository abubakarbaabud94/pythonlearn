import type { Episode } from '../types';
import vo from '../data/vo-yunus-2.json';

// Part 2: kaum Nabi Yunus. Setiap klaim punya `sumber`; penjelasan ulama ditandai 'tafsir'.
export const yunus2: Episode = {
  id: 'yunus-2',
  nomor: 21,
  seri: 'KISAH 25 NABI',
  bagian: 'PART 2',
  judul: 'Nabi Yunus — Kaum yang Azabnya Diangkat',
  hook: { baris1: 'AZAB DIANGKAT', baris2: 'DARI SATU KAUM' },
  penutup: {
    part: 'NEXT',
    teaser: 'Nabi Zakariya: doa di usia senja',
    rujukan: 'QS. MARYAM : 2–11',
  },
  audio: { ambience: 'audio/ambience-laut.mp3' },
  // Voiceover ElevenLabs (suara "Arthur – Wise Indonesian Narrator", eleven_v4), lihat npm run sinkron-vo-2.
  vo,
  scenes: [
    {
      id: 'hook',
      detik: 7,
      latar: 'kota-azab',
      overlay: 'hook',
      kamera: { dari: { x: 0, y: 30, zoom: 1.0 }, ke: { x: 0, y: 0, zoom: 1.14 } },
      narasi: 'Banyak kaum dibinasakan karena mendustakan nabinya. Tapi ada satu kaum… yang azabnya justru diangkat.',
    },
    {
      id: 'ringkasan',
      detik: 7,
      latar: 'cahaya',
      kamera: { dari: { x: 0, y: 120, zoom: 1.1 }, ke: { x: 0, y: -60, zoom: 1.0 } },
      narasi:
        'Di Part 1, Nabi Yunus ditelan ikan besar, lalu diselamatkan karena doanya. Sekarang… bagaimana dengan kaum yang ia tinggalkan?',
    },
    {
      id: 'ayat-yunus-98',
      detik: 20,
      latar: 'doa',
      overlay: 'ayat',
      ayat: '10:98',
      cue: '.', // seluruh terjemahan menyala mengikuti narasi
      kamera: { dari: { x: 0, y: 0, zoom: 1.0 }, ke: { x: 0, y: 0, zoom: 1.05 } },
      narasi:
        'Allah berfirman: Maka mengapa tidak ada penduduk suatu negeri pun yang beriman, lalu imannya itu bermanfaat baginya, selain kaum Yunus. Ketika mereka, kaum Yunus itu, beriman, Kami hilangkan dari mereka azab yang menghinakan dalam kehidupan dunia, dan Kami beri kesenangan kepada mereka sampai waktu tertentu.',
    },
    {
      id: 'taubat',
      detik: 9,
      latar: 'kota-taubat',
      kamera: { dari: { x: 0, y: 0, zoom: 1.12 }, ke: { x: 0, y: 40, zoom: 1.0 } },
      narasi:
        'Menurut para mufassir, mereka beriman ketika tanda-tanda azab mulai tampak. Mereka keluar, merendahkan diri, dan memohon ampun kepada Allah.',
      sumber: { tipe: 'tafsir', label: 'Ibnu Katsir, QS. Yunus: 98' },
      momen: [{ nama: 'keluar', kata: '^keluar', sfx: 'desir-lembut', gain: 0.25 }],
    },
    {
      id: 'seratus-ribu',
      detik: 8,
      latar: 'kota-fajar',
      kamera: { dari: { x: -50, y: 20, zoom: 1.1 }, ke: { x: 50, y: 0, zoom: 1.0 } },
      narasi:
        'Yunus diutus kepada seratus ribu orang atau lebih. Mereka beriman, maka Allah memberi mereka kenikmatan hidup hingga waktu tertentu.',
      sumber: { tipe: 'quran', label: 'Aṣ-Ṣaffat: 147–148' },
    },
    {
      id: 'pesan',
      detik: 10,
      latar: 'langit-malam',
      kaligrafi: '68:48',
      kamera: { dari: { x: 0, y: -40, zoom: 1.0 }, ke: { x: 0, y: 30, zoom: 1.08 } },
      narasi:
        "Kisah ini juga menjadi pesan bagi Nabi Muhammad, shallallahu 'alaihi wa sallam: Bersabarlah terhadap ketetapan Tuhanmu, dan janganlah seperti orang yang berada dalam perut ikan.",
      sumber: { tipe: 'quran', label: 'Al-Qalam: 48' },
      momen: [{ nama: 'meteor', kata: '^Bersabarlah', sfx: 'desir-lembut', gain: 0.3 }],
    },
    {
      id: 'dipilih',
      detik: 6,
      latar: 'pantai-fajar',
      kamera: { dari: { x: -40, y: 20, zoom: 1.1 }, ke: { x: 30, y: 0, zoom: 1.0 } },
      narasi: 'Lalu Tuhannya memilihnya, dan menjadikannya termasuk orang-orang yang saleh.',
      sumber: { tipe: 'quran', label: 'Al-Qalam: 50' },
    },
    {
      id: 'penutup',
      detik: 8,
      latar: 'kota-fajar',
      overlay: 'penutup',
      kamera: { dari: { x: 0, y: 0, zoom: 1.15 }, ke: { x: 0, y: -20, zoom: 1.0 } },
      narasi: 'Satu kota kembali kepada Allah… dan Allah mengangkat azab dari mereka. Episode berikutnya: Nabi Zakariya.',
    },
  ],
};
