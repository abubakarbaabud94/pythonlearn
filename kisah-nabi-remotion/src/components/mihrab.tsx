// Interior mihrab (kamar ibadah) untuk kisah Nabi Zakariya. Prosedural, tanpa figur makhluk:
// kehadiran tokoh dan malaikat hanya disiratkan lewat cahaya, pelita, dan benda.
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Dinding batu dengan sambungan blok yang samar. */
export const DindingBatu: React.FC = () => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: -300,
        background: 'linear-gradient(180deg, #1c130d 0%, #2b1d13 45%, #1a110b 100%)',
      }}
    />
    <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible', opacity: 0.22 }}>
      {new Array(22).fill(0).map((_, r) => {
        const y = -200 + r * 110;
        return (
          <g key={r}>
            <line x1={-300} y1={y} x2={1400} y2={y} stroke="#0b0705" strokeWidth={4} />
            {new Array(9).fill(0).map((__, c) => {
              const x = -300 + c * 210 + (r % 2) * 105;
              return <line key={c} x1={x} y1={y} x2={x} y2={y + 110} stroke="#0b0705" strokeWidth={4} />;
            })}
          </g>
        );
      })}
    </svg>
  </>
);

/** Jendela berbusur dengan langit malam; `salju` menandai musim dingin di luar. */
export const Jendela: React.FC<{ x: number; y: number; salju?: boolean }> = ({ x, y, salju }) => {
  const frame = useCurrentFrame();
  const w = 230;
  const h = 470;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: `${w / 2}px ${w / 2}px 0 0`,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #050a1c, #14234a)',
        boxShadow: 'inset 0 0 0 12px #3a2818, 0 0 40px rgba(0,0,0,0.6)',
      }}
    >
      {new Array(30).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: random(`jx${i}`) * w,
            top: random(`jy${i}`) * h * 0.8,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#fff8e0',
            opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 25 + i)),
          }}
        />
      ))}
      {salju &&
        new Array(45).fill(0).map((_, i) => {
          const r = 2 + random(`sr${i}`) * 4;
          const yy = ((random(`sy${i}`) * (h + 40) + frame * (1.2 + random(`sv${i}`))) % (h + 40)) - 20;
          const xx = random(`sx${i}`) * w + Math.sin(frame / 18 + i) * 10;
          return (
            <div
              key={`s${i}`}
              style={{
                position: 'absolute',
                left: xx,
                top: yy,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.85,
              }}
            />
          );
        })}
      {salju && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 40,
            background: 'linear-gradient(180deg, rgba(240,245,255,0.6), #e8eef8)',
          }}
        />
      )}
      {/* kisi jendela */}
      <div style={{ position: 'absolute', left: w / 2 - 5, top: 0, bottom: 0, width: 10, background: '#3a2818' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: h * 0.55, height: 10, background: '#3a2818' }} />
    </div>
  );
};

/** Ceruk mihrab berbusur di tengah dinding. */
export const CerukMihrab: React.FC<{ terang?: number }> = ({ terang = 0 }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
    <defs>
      <linearGradient id="ceruk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0d0805" />
        <stop offset="0.6" stopColor="#1f140c" />
        <stop offset="1" stopColor="#2d1d11" />
      </linearGradient>
      <radialGradient id="cerukTerang" cx="0.5" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#ffe2a0" stopOpacity={0.55 * terang} />
        <stop offset="1" stopColor="#ffe2a0" stopOpacity={0} />
      </radialGradient>
    </defs>
    {/* bingkai luar */}
    <path d="M 250 1520 L 250 880 A 290 290 0 0 1 830 880 L 830 1520 Z" fill="#3b2817" />
    <path d="M 250 1520 L 250 880 A 290 290 0 0 1 830 880 L 830 1520" fill="none" stroke="#8a6a3a" strokeWidth={6} strokeOpacity={0.6} />
    {/* ceruk dalam */}
    <path d="M 300 1520 L 300 900 A 240 240 0 0 1 780 900 L 780 1520 Z" fill="url(#ceruk)" />
    <path d="M 300 1520 L 300 900 A 240 240 0 0 1 780 900 L 780 1520 Z" fill="url(#cerukTerang)" />
    {/* ornamen bintang segi delapan di puncak busur */}
    <g transform="translate(540 700)" opacity={0.75}>
      <rect x={-26} y={-26} width={52} height={52} fill="none" stroke="#c9a15a" strokeWidth={4} />
      <rect x={-26} y={-26} width={52} height={52} fill="none" stroke="#c9a15a" strokeWidth={4} transform="rotate(45)" />
    </g>
    {/* ambang batu */}
    <rect x={230} y={1500} width={620} height={40} fill="#4a3320" />
  </svg>
);

/** Pelita minyak yang tergantung, nyalanya berkedip pelan dan menerangi ruangan. */
export const Pelita: React.FC<{ x: number; y: number; kuat?: number }> = ({ x, y, kuat = 1 }) => {
  const frame = useCurrentFrame();
  const kedip = 0.85 + 0.15 * noise2D('pelita', frame / 8, 0);
  const goyang = noise2D('api', frame / 6, 1) * 4;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - 700,
          top: y - 700,
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,190,100,${0.32 * kedip * kuat}) 0%, rgba(255,150,60,${0.12 * kedip * kuat}) 35%, rgba(255,150,60,0) 65%)`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        <line x1={x} y1={-400} x2={x} y2={y - 40} stroke="#1a120b" strokeWidth={4} />
        <path d={`M ${x - 46} ${y} Q ${x} ${y + 46} ${x + 46} ${y} Z`} fill="#6b4a22" stroke="#a07a3a" strokeWidth={3} />
        <path d={`M ${x + 40} ${y - 4} L ${x + 70} ${y - 14}`} stroke="#6b4a22" strokeWidth={8} strokeLinecap="round" />
        <ellipse
          cx={x + 72 + goyang * 0.3}
          cy={y - 34}
          rx={10 * kedip}
          ry={24 * kedip}
          fill="#ffd27a"
          transform={`rotate(${goyang} ${x + 72} ${y - 14})`}
          style={{ filter: 'drop-shadow(0 0 14px #ffb347)' }}
        />
        <ellipse cx={x + 72} cy={y - 28} rx={4} ry={10} fill="#fff6dc" />
      </svg>
    </>
  );
};

/** Buah-buahan di sisi mihrab dengan pendar keemasan (rezeki dari Allah). */
export const BuahBuahan: React.FC<{ x: number; y: number; muncul: number }> = ({ x, y, muncul }) => {
  const frame = useCurrentFrame();
  const s = interpolate(muncul, [0, 1], [0.6, 1], clamp);
  const pendar = 0.5 + 0.2 * Math.sin(frame / 14);
  const anggur = [
    [0, 0], [26, 0], [52, 0], [13, 22], [39, 22], [26, 44], [0, 44], [52, 44], [13, 66], [39, 66], [26, 88],
  ];
  return (
    <div style={{ position: 'absolute', left: x - 200, top: y - 220, width: 400, height: 300, opacity: muncul, transform: `scale(${s})` }}>
      <div
        style={{
          position: 'absolute',
          inset: -120,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,215,130,${0.35 * pendar}) 0%, rgba(255,215,130,0) 60%)`,
        }}
      />
      <svg viewBox="-200 -220 400 300" width={400} height={300} style={{ overflow: 'visible' }}>
        {/* delima */}
        <circle cx={-80} cy={-20} r={48} fill="#a8242e" />
        <path d="M -92 -70 L -80 -82 L -68 -70 Z" fill="#7a1820" />
        <circle cx={-96} cy={-36} r={10} fill="#ff8a8a" opacity={0.35} />
        <circle cx={30} cy={-34} r={40} fill="#b8303a" />
        <path d="M 20 -76 L 30 -86 L 40 -76 Z" fill="#7a1820" />
        {/* anggur */}
        <g transform="translate(80 -110)">
          <path d="M 26 -14 Q 30 -40 50 -46" stroke="#4a6a2a" strokeWidth={5} fill="none" />
          {anggur.map(([ax, ay], i) => (
            <circle key={i} cx={ax} cy={ay} r={15} fill="#5a2a6a" stroke="#7a4a8a" strokeWidth={2} />
          ))}
        </g>
        {/* mangkuk */}
        <path d="M -170 20 Q 0 110 170 20 Z" fill="#7a5a32" stroke="#b08a4a" strokeWidth={4} />
        <ellipse cx={0} cy={20} rx={170} ry={18} fill="#5a4024" />
      </svg>
      {new Array(10).fill(0).map((_, i) => {
        const t = ((frame + i * 17) % 90) / 90;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 200 + Math.cos(i * 1.7) * (90 + t * 60),
              top: 120 - t * 200,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#ffe6a8',
              opacity: Math.sin(t * Math.PI) * 0.9,
              boxShadow: '0 0 10px #ffd27a',
            }}
          />
        );
      })}
    </div>
  );
};

/** Sajadah di lantai depan mihrab. */
export const Sajadah: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
    <rect x={-400} y={1520} width={1900} height={800} fill="#140d08" />
    <path d="M 330 1560 L 750 1560 L 900 2000 L 180 2000 Z" fill="#5a1c1c" />
    <path d="M 360 1585 L 720 1585 L 855 1980 L 225 1980 Z" fill="none" stroke="#c9a15a" strokeWidth={5} strokeOpacity={0.7} />
    <path d="M 470 1600 Q 540 1560 610 1600" fill="none" stroke="#c9a15a" strokeWidth={5} strokeOpacity={0.7} />
  </svg>
);
