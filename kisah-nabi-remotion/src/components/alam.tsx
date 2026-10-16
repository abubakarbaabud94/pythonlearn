// Elemen alam prosedural (SVG/CSS). Tidak ada figur manusia sama sekali:
// kisah diceritakan lewat lingkungan, objek, dan cahaya.
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';

// Kanvas sedikit lebih lebar dari frame agar gerak kamera tidak memperlihatkan tepi.
const X0 = -420;
const X1 = 1500;

export const Langit: React.FC<{ warna: string[]; stops?: number[] }> = ({ warna, stops }) => {
  const parts = warna.map((w, i) => `${w} ${stops ? stops[i] : (i / (warna.length - 1)) * 100}%`);
  // Sengaja div biasa: AbsoluteFill mengunci width/height 100% sehingga inset negatif tidak memperluasnya.
  // Batas gradien dihitung terhadap frame (stops 0–100% = y 0–1920), lalu diperluas 300px ke segala arah.
  return (
    <div
      style={{
        position: 'absolute',
        inset: -300,
        background: `linear-gradient(180deg, ${warna[0]} 0px, ${parts
          .map((pt) => pt.replace(/ ([\d.]+)%$/, (_, n) => ` calc(300px + ${n} * 19.2px)`))
          .join(', ')}, ${warna[warna.length - 1]} 100%)`,
      }}
    />
  );
};

export const Bintang: React.FC<{ jumlah?: number; seed?: string; batasY?: number; opacity?: number }> = ({
  jumlah = 140,
  seed = 'bintang',
  batasY = 1100,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity }}>
      {new Array(jumlah).fill(0).map((_, i) => {
        const x = X0 + random(`${seed}x${i}`) * (X1 - X0);
        const y = -250 + random(`${seed}y${i}`) * (batasY + 250);
        const r = 1 + random(`${seed}r${i}`) * 2.6;
        const kedip = 0.45 + 0.55 * Math.abs(Math.sin(frame / (18 + random(`${seed}k${i}`) * 40) + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: '#FFF6E0',
              opacity: kedip,
              boxShadow: r > 2.6 ? '0 0 8px 2px rgba(255,240,200,0.6)' : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Bulan: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 70 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 38% 35%, #FFFBEA, #E9DDB8 60%, #C9B98F)',
      boxShadow: '0 0 80px 30px rgba(255,240,200,0.25), 0 0 220px 90px rgba(180,200,255,0.12)',
    }}
  />
);

export const Matahari: React.FC<{ x: number; y: number; r?: number; warna?: string; glow?: string }> = ({
  x,
  y,
  r = 110,
  warna = '#FFD58A',
  glow = 'rgba(255,170,80,0.45)',
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: `radial-gradient(circle, #FFF4D6 0%, ${warna} 55%, ${warna}00 72%)`,
      boxShadow: `0 0 160px 80px ${glow}`,
    }}
  />
);

export type ParamGelombang = { y: number; amp: number; panjang: number; kecepatan: number; fase?: number };

/** Tinggi permukaan gelombang di titik x pada frame t (dipakai juga untuk menaruh kapal). */
export const tinggiGelombang = (x: number, t: number, p: ParamGelombang) => {
  const f = p.fase ?? 0;
  return (
    p.y +
    p.amp * Math.sin((2 * Math.PI * x) / p.panjang + t * p.kecepatan + f) +
    p.amp * 0.35 * Math.sin((2 * Math.PI * x) / (p.panjang * 0.43) - t * p.kecepatan * 1.6 + f * 2) +
    p.amp * 0.25 * noise2D(`g${f}`, x / 300, t * 0.02)
  );
};

export const Gelombang: React.FC<ParamGelombang & { warna: string; kilau?: string }> = ({ warna, kilau, ...p }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let d = `M ${X0} 2600 L ${X0} ${tinggiGelombang(X0, t, p)}`;
  for (let x = X0 + 16; x <= X1; x += 16) d += ` L ${x} ${tinggiGelombang(x, t, p).toFixed(1)}`;
  d += ` L ${X1} 2600 Z`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <path d={d} fill={warna} stroke={kilau} strokeWidth={kilau ? 3 : 0} strokeOpacity={0.5} />
      </svg>
    </AbsoluteFill>
  );
};

export const Kapal: React.FC<{ x: number; gelombang: ParamGelombang; skala?: number }> = ({
  x,
  gelombang,
  skala = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const y = tinggiGelombang(x, t, gelombang);
  const kemiringan = Math.atan2(tinggiGelombang(x + 40, t, gelombang) - tinggiGelombang(x - 40, t, gelombang), 80);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 210 * skala,
        top: y - 330 * skala,
        width: 420 * skala,
        height: 380 * skala,
        transform: `rotate(${kemiringan}rad)`,
        transformOrigin: '50% 87%',
      }}
    >
      <svg viewBox="0 0 420 380" width="100%" height="100%">
        <defs>
          <linearGradient id="layar" x1="0" x2="1">
            <stop offset="0" stopColor="#3a3328" />
            <stop offset="1" stopColor="#1a1712" />
          </linearGradient>
        </defs>
        {/* tiang & layar */}
        <rect x={203} y={20} width={9} height={300} fill="#0d0b09" />
        <path d="M 212 40 Q 300 90 330 190 L 212 210 Z" fill="url(#layar)" />
        <path d="M 203 60 Q 130 110 110 200 L 203 215 Z" fill="url(#layar)" opacity={0.9} />
        <path d="M 212 22 L 250 32 L 212 42 Z" fill="#7a2e22" />
        {/* lambung + muatan */}
        <rect x={120} y={268} width={50} height={32} fill="#15110d" />
        <rect x={250} y={262} width={60} height={38} fill="#15110d" />
        <path d="M 30 290 L 390 290 Q 370 350 300 362 L 110 362 Q 50 350 30 290 Z" fill="#0c0a08" />
        <path d="M 30 290 L 390 290" stroke="#5b4a33" strokeWidth={4} />
      </svg>
    </div>
  );
};

/** Siluet ikan besar (al-hut). Ekor dikibaskan, tubuh sedikit bergelombang. */
export const IkanBesar: React.FC<{ x: number; y: number; skala: number; hadap?: 'kiri' | 'kanan'; opacity?: number }> = ({
  x,
  y,
  skala,
  hadap = 'kiri',
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const kibas = Math.sin(frame / 9) * 12;
  const ayun = Math.sin(frame / 22) * 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 500 * skala,
        top: y - 220 * skala,
        width: 1000 * skala,
        height: 440 * skala,
        opacity,
        transform: `scaleX(${hadap === 'kiri' ? 1 : -1}) rotate(${ayun}deg)`,
      }}
    >
      <svg viewBox="0 0 1000 440" width="100%" height="100%">
        <defs>
          <linearGradient id="kulit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16303d" />
            <stop offset="0.6" stopColor="#0a1820" />
            <stop offset="1" stopColor="#04090c" />
          </linearGradient>
        </defs>
        <g transform={`rotate(${kibas} 840 215)`}>
          <path d="M 830 215 L 990 95 Q 935 215 990 335 Z" fill="url(#kulit)" />
        </g>
        <path
          d="M 40 235 C 55 120 250 62 480 80 C 640 92 770 150 845 205 L 845 228 C 760 300 600 362 420 362 C 220 362 70 322 40 235 Z"
          fill="url(#kulit)"
          stroke="#3f7f8f"
          strokeOpacity={0.35}
          strokeWidth={3}
        />
        <path d="M 380 330 Q 440 425 540 432 Q 480 380 470 330 Z" fill="#081218" />
        <path d="M 42 245 Q 150 275 270 265" stroke="#02070a" strokeWidth={6} fill="none" />
        <circle cx={160} cy={198} r={9} fill="#9fd3d8" opacity={0.55} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${110 + i * 26} ${300 + i * 6} L ${170 + i * 32} ${292 + i * 7}`} stroke="#1f3b47" strokeWidth={3} />
        ))}
      </svg>
    </div>
  );
};

export const Kota: React.FC<{ y: number; warna: string; lampu?: boolean; seed?: string }> = ({
  y,
  warna,
  lampu = true,
  seed = 'kota',
}) => {
  const frame = useCurrentFrame();
  const bangunan: { x: number; w: number; h: number }[] = [];
  let x = X0;
  let i = 0;
  while (x < X1) {
    const w = 60 + random(`${seed}w${i}`) * 110;
    const h = 60 + random(`${seed}h${i}`) * 150;
    bangunan.push({ x, w, h });
    x += w - 6;
    i++;
  }
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        {/* tembok kota berbenteng */}
        <rect x={X0} y={y - 60} width={X1 - X0} height={2000} fill={warna} />
        {new Array(Math.floor((X1 - X0) / 40)).fill(0).map((_, k) => (
          <rect key={k} x={X0 + k * 40} y={y - 82} width={22} height={24} fill={warna} />
        ))}
        {/* menara bertingkat di tengah */}
        {[300, 230, 160, 100].map((w, k) => (
          <rect key={k} x={540 - w / 2} y={y - 60 - (k + 1) * 70} width={w} height={74} fill={warna} />
        ))}
        {bangunan.map((b, k) => (
          <rect key={k} x={b.x} y={y - 60 - b.h} width={b.w} height={b.h + 10} fill={warna} />
        ))}
        {lampu &&
          bangunan.map((b, k) => {
            if (random(`${seed}l${k}`) < 0.45) return null;
            const nyala = 0.55 + 0.45 * noise2D(`${seed}n${k}`, k, frame / 40);
            return (
              <rect
                key={`l${k}`}
                x={b.x + b.w * 0.4}
                y={y - 60 - b.h * 0.6}
                width={9}
                height={13}
                fill="#FFB866"
                opacity={nyala}
              />
            );
          })}
      </svg>
    </AbsoluteFill>
  );
};

export const PohonKurma: React.FC<{ x: number; y: number; tinggi: number; warna: string; flip?: boolean }> = ({
  x,
  y,
  tinggi,
  warna,
  flip,
}) => {
  const frame = useCurrentFrame();
  const angin = Math.sin(frame / 25 + x) * 2.5;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - tinggi * 0.5,
        top: y - tinggi,
        width: tinggi,
        height: tinggi,
        transform: `scaleX(${flip ? -1 : 1})`,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <path d="M 48 100 Q 52 60 58 22 L 61 22 Q 56 60 53 100 Z" fill={warna} />
        <g transform={`rotate(${angin} 59 22)`}>
          {[-150, -115, -80, -45, -10, 20].map((a, i) => (
            <path
              key={i}
              d="M 59 22 Q 75 10 98 22 Q 76 17 59 24 Z"
              fill={warna}
              transform={`rotate(${a + 60} 59 22)`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export const Burung: React.FC<{ jumlah?: number; y: number; seed?: string }> = ({ jumlah = 5, y, seed = 'burung' }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(jumlah).fill(0).map((_, i) => {
        const bx = ((random(`${seed}${i}`) * 1400 + frame * (1.6 + random(`${seed}v${i}`))) % 1700) - 300;
        const by = y + random(`${seed}y${i}`) * 200 + Math.sin(frame / 15 + i) * 6;
        const kepak = Math.sin(frame / 4 + i) * 8;
        return (
          <svg key={i} style={{ position: 'absolute', left: bx, top: by, overflow: 'visible' }} width={40} height={20}>
            <path d={`M 0 ${8 - kepak} Q 10 6 20 12 Q 30 6 40 ${8 - kepak}`} stroke="#120a14" strokeWidth={3} fill="none" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

export const BerkasCahaya: React.FC<{ jumlah?: number; warna?: string; kekuatan?: number; asalX?: number }> = ({
  jumlah = 7,
  warna = '180,230,240',
  kekuatan = 0.18,
  asalX = 540,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(jumlah).fill(0).map((_, i) => {
        const sudut = -28 + (56 / (jumlah - 1)) * i + noise2D(`rs${i}`, i, frame / 90) * 6;
        const op = kekuatan * (0.5 + 0.5 * noise2D(`ro${i}`, i * 3, frame / 50));
        const lebar = 70 + random(`rw${i}`) * 130;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: asalX - lebar / 2,
              top: -300,
              width: lebar,
              height: 2600,
              transformOrigin: '50% 0%',
              transform: `rotate(${sudut}deg)`,
              // Tepi lembut lewat gradien horizontal (lebih ringan & stabil daripada filter blur).
              background: `linear-gradient(90deg, rgba(${warna},0), rgba(${warna},${op}) 50%, rgba(${warna},0))`,
              maskImage: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.4) 45%, transparent 80%)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Partikel naik (gelembung di air, atau debu cahaya keemasan). */
export const Partikel: React.FC<{
  jumlah?: number;
  warna?: string;
  ukuran?: [number, number];
  kecepatan?: number;
  gelembung?: boolean;
  seed?: string;
}> = ({ jumlah = 40, warna = 'rgba(200,240,255,0.5)', ukuran = [3, 12], kecepatan = 2, gelembung = true, seed = 'p' }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const tinggiTotal = height + 400;
  return (
    <AbsoluteFill>
      {new Array(jumlah).fill(0).map((_, i) => {
        const r = ukuran[0] + random(`${seed}r${i}`) * (ukuran[1] - ukuran[0]);
        const v = kecepatan * (0.5 + random(`${seed}v${i}`));
        const y = height + 200 - ((random(`${seed}y${i}`) * tinggiTotal + frame * v) % tinggiTotal);
        const x = X0 + 200 + random(`${seed}x${i}`) * 1500 + Math.sin(frame / 20 + i) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: gelembung ? `2px solid ${warna}` : undefined,
              background: gelembung ? 'transparent' : warna,
              boxShadow: gelembung ? undefined : `0 0 ${r * 3}px ${warna}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Hujan: React.FC<{ jumlah?: number }> = ({ jumlah = 160 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        {new Array(jumlah).fill(0).map((_, i) => {
          const panjang = 40 + random(`hp${i}`) * 50;
          const y = ((random(`hy${i}`) * 2300 + frame * 55) % 2300) - 300;
          const x = X0 + random(`hx${i}`) * (X1 - X0) - (y + 300) * 0.25;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x - panjang * 0.25}
              y2={y + panjang}
              stroke="rgba(190,210,230,0.35)"
              strokeWidth={2}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Kilat: kilatan layar + petir bercabang pada frame tertentu (relatif terhadap scene). */
export const Kilat: React.FC<{ frames: number[]; merah?: boolean }> = ({ frames, merah }) => {
  const frame = useCurrentFrame();
  const aktif = frames.find((f) => frame >= f && frame < f + 10);
  if (aktif === undefined) return null;
  const k = frame - aktif;
  const kilau = interpolate(k, [0, 1, 3, 4, 10], [0, 0.85, 0.2, 0.6, 0]);
  let d = `M ${300 + random(`k${aktif}`) * 500} -50`;
  let x = 300 + random(`k${aktif}`) * 500;
  for (let s = 0; s < 9; s++) {
    x += (random(`kx${aktif}${s}`) - 0.5) * 140;
    d += ` L ${x} ${s * 90 + 40}`;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: merah ? `rgba(255,120,90,${kilau * 0.35})` : `rgba(210,225,255,${kilau * 0.55})` }} />
      <svg width={1080} height={1920}>
        <path
          d={d}
          stroke={merah ? '#FFE0D0' : '#EAF2FF'}
          strokeWidth={5}
          fill="none"
          opacity={kilau}
          style={{ filter: `drop-shadow(0 0 12px ${merah ? '#ff7a5c' : '#9cc4ff'})` }}
        />
      </svg>
    </AbsoluteFill>
  );
};

/** Awan gelap: elips kabur yang bergerak perlahan. */
export const Awan: React.FC<{ y: number; warna: string; jumlah?: number; seed?: string }> = ({
  y,
  warna,
  jumlah = 9,
  seed = 'awan',
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(jumlah).fill(0).map((_, i) => {
        const w = 420 + random(`${seed}w${i}`) * 500;
        const x = ((random(`${seed}x${i}`) * 1900 + frame * (0.6 + random(`${seed}v${i}`))) % 1900) - 600;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y + random(`${seed}y${i}`) * 380 - 120,
              width: w,
              height: w * 0.38,
              borderRadius: '50%',
              background: warna,
              filter: 'blur(40px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Pohon labu (yaqtin) yang tumbuh: batang digambar bertahap, daun & buah muncul berurutan. */
export const PohonLabu: React.FC<{ x: number; y: number; progres: number }> = ({ x, y, progres }) => {
  const batang = 'M 0 0 C 40 -120 -60 -220 20 -340 C 80 -430 -10 -520 60 -620';
  const daun = [
    { cx: 22, cy: -110, r: 46, a: -30 },
    { cx: -20, cy: -210, r: 58, a: 200 },
    { cx: 40, cy: -320, r: 62, a: -20 },
    { cx: 30, cy: -450, r: 52, a: 210 },
    { cx: 58, cy: -590, r: 44, a: -40 },
  ];
  return (
    <svg
      style={{ position: 'absolute', left: x - 200, top: y - 700, overflow: 'visible' }}
      width={400}
      height={720}
      viewBox="-200 -700 400 720"
    >
      <path
        d={batang}
        stroke="#2f5a2a"
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.min(1, progres * 1.3)}
      />
      {daun.map((d, i) => {
        const s = interpolate(progres, [0.15 + i * 0.12, 0.35 + i * 0.12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <g key={i} transform={`translate(${d.cx} ${d.cy}) rotate(${d.a}) scale(${s})`}>
            <path
              d={`M 0 0 C ${d.r} ${-d.r * 0.2} ${d.r * 1.1} ${d.r} 0 ${d.r * 1.25} C ${-d.r * 1.1} ${d.r} ${-d.r} ${-d.r * 0.2} 0 0 Z`}
              fill="#3f7a36"
              stroke="#5fa04f"
              strokeWidth={3}
            />
            <path d={`M 0 4 L 0 ${d.r * 1.1}`} stroke="#5fa04f" strokeWidth={3} />
          </g>
        );
      })}
      <ellipse
        cx={-40}
        cy={-160}
        rx={34}
        ry={46}
        fill="#cfd9a2"
        opacity={interpolate(progres, [0.75, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </svg>
  );
};

export const Vignette: React.FC<{ kekuatan?: number }> = ({ kekuatan = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,${kekuatan}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/**
 * Arak-arakan cahaya pelita yang keluar dari kota menuju padang: simbol penduduk yang keluar
 * memohon ampun, tanpa menggambar satu pun sosok manusia.
 */
export const ArakCahaya: React.FC<{ jumlah?: number; asalY?: number; seed?: string }> = ({
  jumlah = 70,
  asalY = 1400,
  seed = 'arak',
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(jumlah).fill(0).map((_, i) => {
        const siklus = 160 + random(`${seed}s${i}`) * 140;
        const t = ((frame + random(`${seed}o${i}`) * siklus) % siklus) / siklus;
        const x0 = 380 + random(`${seed}a${i}`) * 320;
        const x1 = -250 + random(`${seed}b${i}`) * 1580;
        const cx = (x0 + x1) / 2 + (random(`${seed}c${i}`) - 0.5) * 300;
        // Kurva Bezier kuadrat dari gerbang kota ke depan layar; makin dekat makin besar (perspektif).
        const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
        const y = (1 - t) * (1 - t) * asalY + 2 * (1 - t) * t * (asalY + 120) + t * t * 2150;
        const r = 2 + t * t * 9;
        const op = interpolate(t, [0, 0.12, 0.8, 1], [0, 1, 0.9, 0]) * (0.7 + 0.3 * Math.sin(frame / 5 + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: '#FFD08A',
              opacity: op,
              boxShadow: `0 0 ${r * 4}px ${r * 1.5}px rgba(255,180,90,0.55)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
