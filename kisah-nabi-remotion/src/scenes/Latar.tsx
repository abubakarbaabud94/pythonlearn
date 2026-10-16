import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';
import { Layer } from '../lib/camera';
import {
  Awan,
  BerkasCahaya,
  Bintang,
  Bulan,
  Burung,
  Gelombang,
  Hujan,
  IkanBesar,
  Kapal,
  Kilat,
  Kota,
  Langit,
  Matahari,
  Partikel,
  PohonKurma,
  PohonLabu,
  Vignette,
  type ParamGelombang,
} from '../components/alam';
import type { Latar as LatarType } from '../types';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const useProgres = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return { frame, p: frame / durationInFrames, durasi: durationInFrames };
};

/** Hook: laut dalam yang gelap, ikan besar melintas sangat dekat dengan kamera. */
const BawahLautGelap: React.FC = () => {
  const { frame, durasi } = useProgres();
  const ikanX = interpolate(frame, [0, durasi], [1500, -300]);
  return (
    <>
      <Langit warna={['#05202b', '#021118', '#000305']} />
      <Layer depth={0.2}>
        <BerkasCahaya kekuatan={0.1} />
      </Layer>
      <Layer depth={0.4}>
        <Partikel jumlah={30} warna="rgba(140,200,210,0.35)" ukuran={[1, 3]} gelembung={false} kecepatan={0.6} />
      </Layer>
      <Layer depth={1}>
        <IkanBesar x={ikanX} y={980} skala={2.3} />
      </Layer>
      <Layer depth={1.2}>
        <Partikel jumlah={18} ukuran={[4, 14]} kecepatan={3} seed="hook" />
      </Layer>
      <Vignette kekuatan={0.85} />
    </>
  );
};

/** Kota kuno saat senja: Yunus meninggalkan kaumnya (tanpa menampilkan sosok). */
const KotaSenja: React.FC = () => {
  const { p } = useProgres();
  return (
    <>
      <Langit warna={['#140b2e', '#3b1b4a', '#8a3a4f', '#e07a4a', '#f2b16a']} stops={[0, 30, 52, 66, 72]} />
      <Layer depth={0.05}>
        <Bintang jumlah={70} batasY={700} opacity={interpolate(p, [0, 1], [0.15, 0.7])} />
      </Layer>
      <Layer depth={0.1}>
        <Matahari x={560} y={interpolate(p, [0, 1], [1140, 1200])} r={120} />
      </Layer>
      <Layer depth={0.25}>
        <Kota y={1290} warna="#2a1626" seed="jauh" lampu={false} />
      </Layer>
      <Layer depth={0.45}>
        <Kota y={1380} warna="#1a0d18" seed="kota" />
      </Layer>
      <Layer depth={0.3}>
        <Burung y={760} jumlah={6} />
      </Layer>
      <Layer depth={0.8}>
        <div style={{ position: 'absolute', left: -400, right: -400, top: 1420, bottom: -400, background: '#0d0710' }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
          {/* jalan setapak menjauh dari kota */}
          <path d="M 900 1920 Q 760 1640 560 1450" stroke="#3a2230" strokeWidth={70} fill="none" opacity={0.7} />
        </svg>
      </Layer>
      <Layer depth={1.25}>
        <PohonKurma x={80} y={2000} tinggi={900} warna="#060307" />
        <PohonKurma x={1060} y={2050} tinggi={760} warna="#060307" flip />
      </Layer>
      <Vignette kekuatan={0.6} />
    </>
  );
};

const OMBAK_BADAI: ParamGelombang = { y: 1230, amp: 70, panjang: 760, kecepatan: 1.4, fase: 1 };

/** Laut berbadai: kapal penuh muatan di tengah malam. */
const Badai: React.FC = () => {
  const { frame, durasi } = useProgres();
  const guncang = noise2D('shake', frame / 6, 0) * 8;
  return (
    <AbsoluteFill style={{ transform: `translate(${guncang}px, ${guncang * 0.6}px)` }}>
      <Langit warna={['#04060a', '#0d1620', '#1b2a36']} stops={[0, 50, 70]} />
      <Layer depth={0.1}>
        <Awan y={150} warna="rgba(40,52,64,0.9)" jumlah={10} />
      </Layer>
      <Kilat frames={[Math.round(durasi * 0.18), Math.round(durasi * 0.62)]} />
      <Layer depth={0.3}>
        <Gelombang y={1150} amp={40} panjang={520} kecepatan={1.1} fase={3} warna="#0c1822" />
      </Layer>
      <Layer depth={0.6}>
        <Kapal x={560} gelombang={OMBAK_BADAI} skala={1.15} />
        <Gelombang {...OMBAK_BADAI} warna="#09131b" kilau="#5d7f95" />
      </Layer>
      <Layer depth={1.1}>
        <Gelombang y={1560} amp={110} panjang={980} kecepatan={1.7} fase={5} warna="#050b10" kilau="#46677a" />
      </Layer>
      <Layer depth={1.3}>
        <Hujan />
      </Layer>
      <Vignette kekuatan={0.8} />
    </AbsoluteFill>
  );
};

/** Bawah laut: ikan besar mendekat sampai memenuhi layar (ditelan). */
const BawahLaut: React.FC = () => {
  const { frame, durasi, p } = useProgres();
  const skala = interpolate(frame, [0, durasi], [0.35, 4.2], { easing: Easing.in(Easing.cubic) });
  const gelap = interpolate(p, [0.78, 1], [0, 1], clamp);
  return (
    <>
      <Langit warna={['#1f6b7a', '#0b3442', '#031219']} stops={[0, 40, 100]} />
      <Layer depth={0.15}>
        <BerkasCahaya kekuatan={0.22} />
      </Layer>
      <Layer depth={0.5}>
        <Partikel jumlah={25} warna="rgba(170,230,240,0.4)" ukuran={[1, 3]} gelembung={false} kecepatan={0.5} seed="debu" />
      </Layer>
      <Layer depth={0.8}>
        <IkanBesar x={600} y={1000} skala={skala} />
      </Layer>
      <Layer depth={1.1}>
        <Partikel jumlah={30} ukuran={[3, 13]} kecepatan={3.5} seed="gelembung" />
      </Layer>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${gelap})` }} />
      <Vignette kekuatan={0.7} />
    </>
  );
};

/** Tiga kegelapan (menurut tafsir): malam, laut, perut ikan, muncul berlapis. */
const Kegelapan: React.FC = () => {
  const { p } = useProgres();
  const malam = interpolate(p, [0.05, 0.25], [0, 1], clamp);
  const laut = interpolate(p, [0.35, 0.55], [0, 1], clamp);
  const perut = interpolate(p, [0.65, 0.85], [0, 1], clamp);
  return (
    <>
      <Langit warna={['#000', '#020307']} />
      <Layer depth={0.1}>
        <Bintang jumlah={110} opacity={malam * (1 - perut * 0.85)} seed="malam" />
      </Layer>
      <Layer depth={0.4} style={{ opacity: laut * (1 - perut * 0.6) }}>
        <Gelombang y={1050} amp={30} panjang={700} kecepatan={0.6} warna="rgba(10,30,45,0.85)" kilau="#2a5368" />
        <Gelombang y={1350} amp={45} panjang={900} kecepatan={0.8} fase={2} warna="rgba(4,14,22,0.95)" kilau="#1f4252" />
      </Layer>
      <AbsoluteFill
        style={{
          opacity: perut,
          background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(40,8,6,0.35), rgba(8,1,1,0.97) 70%)',
        }}
      />
      <Vignette kekuatan={0.9} />
    </>
  );
};

/** Doa: kegelapan pekat dengan cahaya keemasan yang perlahan bernafas. */
const Doa: React.FC = () => {
  const { frame } = useProgres();
  const nafas = 0.55 + 0.25 * Math.sin(frame / 28);
  return (
    <>
      <Langit warna={['#030205', '#07050b']} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 46%, rgba(232,194,122,${0.22 * nafas}) 0%, rgba(232,194,122,0) 45%)`,
        }}
      />
      <Layer depth={0.4}>
        <Partikel jumlah={36} warna="rgba(232,194,122,0.55)" ukuran={[1, 3]} gelembung={false} kecepatan={0.7} seed="doa" />
      </Layer>
      <Vignette kekuatan={0.85} />
    </>
  );
};

/** Doa dikabulkan: cahaya menembus dari atas, partikel emas naik. */
const Cahaya: React.FC = () => {
  const { p } = useProgres();
  const terang = interpolate(p, [0, 0.7], [0, 1], clamp);
  return (
    <>
      <Langit warna={['#000', '#020407']} />
      <AbsoluteFill style={{ opacity: terang }}>
        <Langit warna={['#f3d79a', '#3f8a92', '#0b2f3c', '#031117']} stops={[0, 25, 60, 100]} />
      </AbsoluteFill>
      <Layer depth={0.2} style={{ opacity: terang }}>
        <BerkasCahaya jumlah={9} warna="255,230,170" kekuatan={0.4} />
      </Layer>
      <Layer depth={0.6}>
        <Partikel jumlah={50} warna="rgba(255,215,140,0.7)" ukuran={[2, 5]} gelembung={false} kecepatan={2.6} seed="emas" />
      </Layer>
      <Layer depth={1}>
        <Partikel jumlah={22} warna="rgba(255,240,210,0.5)" ukuran={[5, 16]} kecepatan={4} seed="naik" />
      </Layer>
      <Vignette kekuatan={0.5} />
    </>
  );
};

/** Pantai saat fajar: daratan tandus, pohon labu tumbuh. */
const PantaiFajar: React.FC = () => {
  const { p } = useProgres();
  return (
    <>
      <Langit warna={['#1d2a55', '#6a5a8a', '#e59a6a', '#ffd6a0']} stops={[0, 35, 58, 66]} />
      <Layer depth={0.05}>
        <Matahari x={420} y={interpolate(p, [0, 1], [1290, 1150])} r={100} warna="#FFC97A" />
      </Layer>
      <Layer depth={0.3}>
        <Gelombang y={1280} amp={6} panjang={400} kecepatan={0.5} warna="#4b5a86" kilau="#ffd9a8" />
      </Layer>
      <Layer depth={0.45}>
        <Gelombang y={1360} amp={9} panjang={520} kecepatan={0.7} fase={2} warna="#2e3a63" kilau="#f5c08a" />
      </Layer>
      <Layer depth={0.2}>
        <Burung y={700} jumlah={4} seed="camar" />
      </Layer>
      <Layer depth={0.9}>
        <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
          <path d="M -400 1560 Q 200 1440 700 1500 Q 1100 1540 1500 1460 L 1500 2400 L -400 2400 Z" fill="#7a5a43" />
          <path d="M -400 1640 Q 300 1560 800 1620 Q 1200 1660 1500 1600 L 1500 2400 L -400 2400 Z" fill="#5a4030" />
        </svg>
        <PohonLabu x={790} y={1610} progres={interpolate(p, [0.1, 0.95], [0, 1], clamp)} />
      </Layer>
      <Vignette kekuatan={0.45} />
    </>
  );
};

/** Penutup: kota kaum Yunus di bawah langit yang mencekam (teaser Part 2). */
const Penutup: React.FC = () => {
  const { p } = useProgres();
  return (
    <>
      <Langit warna={['#0a0507', '#2a0d10', '#5a1c18']} stops={[0, 55, 75]} />
      <Layer depth={0.1}>
        <Awan y={300} warna="rgba(20,6,8,0.95)" jumlah={12} seed="azab" />
      </Layer>
      <Layer depth={0.35}>
        <Kota y={1420} warna="#0c0406" seed="ninawa" />
      </Layer>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${interpolate(p, [0, 1], [0.15, 0.45])})` }} />
      <Vignette kekuatan={0.85} />
    </>
  );
};

const PETA: Record<LatarType, React.FC> = {
  'bawah-laut-gelap': BawahLautGelap,
  'kota-senja': KotaSenja,
  badai: Badai,
  'bawah-laut': BawahLaut,
  kegelapan: Kegelapan,
  doa: Doa,
  cahaya: Cahaya,
  'pantai-fajar': PantaiFajar,
  penutup: Penutup,
};

export const Latar: React.FC<{ jenis: LatarType }> = ({ jenis }) => {
  const Komponen = PETA[jenis];
  return <Komponen />;
};
