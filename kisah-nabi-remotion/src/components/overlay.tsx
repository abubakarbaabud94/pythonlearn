import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import ayatData from '../data/ayat.json';
import { useCueWords, useCues } from '../lib/cues';
import { COLORS, FONTS, SAFE } from '../theme';
import type { Episode, Sumber } from '../types';

type AyatEntry = { surah: number; ayat: number; namaSurah: string; arab: string; terjemahan: string };
const AYAT = ayatData.ayat as Record<string, AyatEntry>;

export const getAyat = (kunci: string): AyatEntry => {
  const a = AYAT[kunci];
  if (!a) throw new Error(`Ayat ${kunci} belum ada di src/data/ayat.json, tambahkan di scripts/extract-ayat.mjs lalu jalankan "npm run ayat"`);
  return a;
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Bintang segi delapan (ornamen geometri Islam). */
const Ornamen: React.FC<{ ukuran?: number; warna?: string }> = ({ ukuran = 34, warna = COLORS.gold }) => (
  <svg width={ukuran} height={ukuran} viewBox="-10 -10 20 20">
    <rect x={-6} y={-6} width={12} height={12} fill="none" stroke={warna} strokeWidth={1.4} />
    <rect x={-6} y={-6} width={12} height={12} fill="none" stroke={warna} strokeWidth={1.4} transform="rotate(45)" />
    <circle r={1.6} fill={warna} />
  </svg>
);

const GarisOrnamen: React.FC<{ lebar: number }> = ({ lebar }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
    <div style={{ width: lebar, height: 2, background: `linear-gradient(90deg, transparent, ${COLORS.gold})` }} />
    <Ornamen />
    <div style={{ width: lebar, height: 2, background: `linear-gradient(90deg, ${COLORS.gold}, transparent)` }} />
  </div>
);

/** Label sumber di atas layar. Tafsir diberi warna & label berbeda dari ayat Al-Qur'an. */
export const SourceTag: React.FC<{ sumber: Sumber }> = ({ sumber }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const masuk = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const quran = sumber.tipe === 'quran';
  const warna = quran ? COLORS.gold : COLORS.tafsir;
  return (
    <div
      style={{
        position: 'absolute',
        top: SAFE.top + 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: masuk,
        transform: `translateY(${(1 - masuk) * -30}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 28px',
          borderRadius: 999,
          background: 'rgba(5,8,13,0.62)',
          border: `2px solid ${warna}`,
          fontFamily: FONTS.teks,
          fontWeight: 800,
          fontSize: 30,
          color: COLORS.ivory,
          letterSpacing: 0.5,
        }}
      >
        <span style={{ color: warna, fontSize: 22, letterSpacing: 3 }}>{quran ? 'AL-QUR’AN' : 'TAFSIR'}</span>
        <span style={{ width: 2, height: 26, background: warna, opacity: 0.6 }} />
        <span>{sumber.label}</span>
      </div>
    </div>
  );
};

export const SeriesBadge: React.FC<{ episode: Episode }> = ({ episode }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 12], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: SAFE.top + 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: op,
        fontFamily: FONTS.judul,
        color: COLORS.gold,
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: 8,
      }}
    >
      {episode.seri} · #{episode.nomor}
    </div>
  );
};

/** Judul pembuka yang menghantam masuk di detik pertama. */
export const HookTitle: React.FC<{ episode: Episode }> = ({ episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b1 = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 160 } });
  const b2 = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 160 } });
  const garis = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const teks: React.CSSProperties = {
    fontFamily: FONTS.judul,
    fontWeight: 900,
    textAlign: 'center',
    lineHeight: 1.05,
    background: `linear-gradient(180deg, #FFF3D6 0%, ${COLORS.gold} 55%, ${COLORS.goldDeep} 100%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.8))',
  };
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 380 }}>
      <div style={{ ...teks, fontSize: 112, opacity: b1, transform: `scale(${2 - b1})`, letterSpacing: interpolate(b1, [0, 1], [30, 4]) }}>
        {episode.hook.baris1}
      </div>
      <div style={{ width: 620 * garis, height: 3, background: COLORS.gold, margin: '26px 0', opacity: 0.8 }} />
      <div style={{ ...teks, fontSize: 76, opacity: b2, transform: `translateY(${(1 - b2) * 40}px)`, letterSpacing: 6 }}>
        {episode.hook.baris2}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Kartu ayat: teks Arab muncul kata demi kata, bagian yang disorot (doa) berwarna emas, lalu terjemahan Kemenag.
 * Dengan voiceover (scene.cue = '.'), bagian sorot muncul saat diucapkan dan kutipan terjemahan menyala
 * kata demi kata mengikuti narasi.
 */
export const AyatCard: React.FC<{ kunci: string; sorotKataTerakhir?: number }> = ({ kunci, sorotKataTerakhir = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = getAyat(kunci);
  const kata = a.arab.split(' ');
  const nPembuka = kata.length - sorotKataTerakhir;
  const bagian = a.terjemahan.split(/(".*?")/);
  const kutipan = bagian.find((b) => b.startsWith('"'));
  const kataKutipan = kutipan ? kutipan.slice(1, -1).split(' ') : [];

  // Titik sinkron dari voiceover: kata pertama kutipan yang diucapkan.
  const ucapan = useCueWords();
  const pertama = kataKutipan.length
    ? ucapan.findIndex((c) => c.text.toLowerCase().startsWith(kataKutipan[0].toLowerCase()))
    : -1;
  const sinkron = pertama >= 0;
  const cueKutipan = sinkron ? ucapan.slice(pertama, pertama + kataKutipan.length).map((c) => c.frame) : [];

  // Jadwal kemunculan tiap kata Arab.
  const akhirArab = sinkron ? cueKutipan[0] - 6 : durationInFrames * 0.42;
  const mulaiKata = (i: number) => {
    if (!sinkron || i < nPembuka) {
      const n = sinkron ? nPembuka : kata.length;
      return 10 + i * ((akhirArab - 10) / n);
    }
    const j = i - nPembuka;
    const t0 = cueKutipan[0];
    const t1 = cueKutipan.at(-1)! + 10;
    return t0 + (j * (t1 - t0)) / sorotKataTerakhir;
  };
  const munculTerjemahan = sinkron ? 24 : akhirArab;
  const terjemahanOp = interpolate(frame, [munculTerjemahan, munculTerjemahan + 18], [0, 1], clamp);
  const kartuOp = interpolate(frame, [0, 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: `0 ${SAFE.side}px`, opacity: kartuOp }}>
      <GarisOrnamen lebar={300} />
      <div
        style={{
          direction: 'rtl',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 18,
          margin: '36px 0 30px',
          fontFamily: FONTS.arab,
          fontSize: 66,
          lineHeight: 2.05,
        }}
      >
        {kata.map((k, i) => {
          const mulai = mulaiKata(i);
          const op = interpolate(frame, [mulai, mulai + 12], [0, 1], clamp);
          const sorot = i >= nPembuka;
          return (
            <span
              key={i}
              style={{
                opacity: op,
                filter: `blur(${(1 - op) * 8}px)`,
                transform: `translateY(${(1 - op) * 14}px)`,
                color: sorot ? COLORS.gold : COLORS.ivory,
                textShadow: sorot ? '0 0 28px rgba(232,194,122,0.55)' : '0 2px 12px rgba(0,0,0,0.8)',
              }}
            >
              {k}
            </span>
          );
        })}
      </div>
      <div
        style={{
          opacity: terjemahanOp,
          fontFamily: FONTS.teks,
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.45,
          color: 'rgba(246,238,221,0.86)',
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        {bagian.map((b, i) => {
          if (!b.startsWith('"')) return <span key={i}>{b}</span>;
          return (
            <span key={i} style={{ fontWeight: 800 }}>
              {'"'}
              {kataKutipan.map((w, j) => {
                const nyala = !sinkron || frame >= cueKutipan[j];
                return (
                  <span key={j} style={{ color: nyala ? COLORS.gold : 'rgba(246,238,221,0.45)' }}>
                    {(j ? ' ' : '') + w}
                  </span>
                );
              })}
              {'"'}
            </span>
          );
        })}
      </div>
      <div
        style={{
          opacity: terjemahanOp,
          marginTop: 30,
          fontFamily: FONTS.judul,
          fontWeight: 700,
          fontSize: 34,
          color: COLORS.gold,
          letterSpacing: 4,
        }}
      >
        QS. {a.namaSurah} : {a.ayat}
      </div>
      <div style={{ marginTop: 30, opacity: terjemahanOp }}>
        <GarisOrnamen lebar={300} />
      </div>
    </AbsoluteFill>
  );
};

/** Kaligrafi raksasa yang samar dan bergeser perlahan di belakang adegan. */
export const KaligrafiLatar: React.FC<{ kunci: string }> = ({ kunci }) => {
  const frame = useCurrentFrame();
  const a = getAyat(kunci);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          direction: 'rtl',
          fontFamily: FONTS.arab,
          fontSize: 170,
          lineHeight: 1.7,
          textAlign: 'center',
          color: COLORS.gold,
          opacity: 0.11,
          width: 1400,
          transform: `translateX(${interpolate(frame, [0, 300], [60, -60])}px)`,
        }}
      >
        {a.arab}
      </div>
    </AbsoluteFill>
  );
};

/** Tiga kegelapan muncul berurutan, sinkron dengan lapisan latar. */
export const TigaKegelapan: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const baris = ['Gelap malam', 'Gelap lautan', 'Gelap perut ikan'];
  const cues = useCues(3, [0.08, 0.38, 0.68], durationInFrames);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 34, paddingBottom: 260 }}>
      {baris.map((b, i) => {
        const s = spring({ frame: frame - (cues[i] - 4), fps, config: { damping: 200 } });
        const aktif = i === 2 || frame < cues[i + 1];
        return (
          <div
            key={b}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              opacity: s * (aktif ? 1 : 0.38),
              transform: `translateX(${(1 - s) * -60}px)`,
            }}
          >
            <span style={{ fontFamily: FONTS.judul, fontWeight: 900, fontSize: 60, color: COLORS.gold, width: 60 }}>
              {i + 1}
            </span>
            <span style={{ fontFamily: FONTS.judul, fontWeight: 700, fontSize: 70, color: COLORS.ivory, letterSpacing: 2 }}>
              {b}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const PenutupOverlay: React.FC<{ episode: Episode }> = ({ episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  const s2 = spring({ frame: frame - 22, fps, config: { damping: 200 } });
  const s3 = spring({ frame: frame - 50, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 470, padding: `470px ${SAFE.side}px 0` }}>
      <div
        style={{
          fontFamily: FONTS.judul,
          fontWeight: 900,
          fontSize: 150,
          color: COLORS.gold,
          letterSpacing: 10,
          transform: `scale(${s1})`,
          textShadow: '0 0 40px rgba(232,194,122,0.4)',
        }}
      >
        {episode.penutup.part}
      </div>
      <div
        style={{
          opacity: s2,
          marginTop: 24,
          fontFamily: FONTS.judul,
          fontWeight: 700,
          fontSize: 54,
          lineHeight: 1.25,
          color: COLORS.ivory,
          textAlign: 'center',
        }}
      >
        {episode.penutup.teaser}
      </div>
      <div style={{ opacity: s2, marginTop: 26, fontFamily: FONTS.teks, fontWeight: 800, fontSize: 32, color: COLORS.gold, letterSpacing: 3 }}>
        {episode.penutup.rujukan}
      </div>
      <div
        style={{
          opacity: s3,
          marginTop: 60,
          padding: '18px 40px',
          borderRadius: 999,
          border: `2px solid ${COLORS.gold}`,
          fontFamily: FONTS.teks,
          fontWeight: 800,
          fontSize: 34,
          color: COLORS.ivory,
        }}
      >
        Follow agar tidak ketinggalan
      </div>
      <div style={{ opacity: s3, marginTop: 44 }}>
        <Disclaimer />
      </div>
    </AbsoluteFill>
  );
};

/** Catatan etika yang tampil kecil di akhir video. */
const Disclaimer: React.FC = () => (
  <div
    style={{
      textAlign: 'center',
      fontFamily: FONTS.teks,
      fontWeight: 500,
      fontSize: 24,
      color: 'rgba(246,238,221,0.6)',
    }}
  >
    Visual hanya ilustrasi · Para nabi tidak divisualisasikan
  </div>
);
