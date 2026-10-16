import { continueRender, delayRender } from 'remotion';
import amiriQuran from '@fontsource/amiri-quran/files/amiri-quran-arabic-400-normal.woff2';
import scheherazade from '@fontsource/scheherazade-new/files/scheherazade-new-arabic-400-normal.woff2';
import cinzel700 from '@fontsource/cinzel/files/cinzel-latin-700-normal.woff2';
import cinzel900 from '@fontsource/cinzel/files/cinzel-latin-900-normal.woff2';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff2';
import inter800 from '@fontsource/inter/files/inter-latin-800-normal.woff2';
import inter900 from '@fontsource/inter/files/inter-latin-900-normal.woff2';

const FACES: [family: string, url: string, weight: string][] = [
  ['Amiri Quran', amiriQuran, '400'],
  ['Scheherazade New', scheherazade, '400'],
  ['Cinzel', cinzel700, '700'],
  ['Cinzel', cinzel900, '900'],
  ['Inter', inter500, '500'],
  ['Inter', inter800, '800'],
  ['Inter', inter900, '900'],
];

let loaded = false;

// Tahan render sampai semua font siap, supaya frame pertama tidak memakai font cadangan.
export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Memuat font');
  Promise.all(
    FACES.map(([family, url, weight]) => {
      const face = new FontFace(family, `url(${url}) format('woff2')`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
