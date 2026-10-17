import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// Tile noise prosedural (SVG feTurbulence), tanpa file aset.
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Grain film tipis di atas seluruh gambar (di bawah subtitle), bergeser tiap 2 frame. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const langkah = Math.floor(frame / 2);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        backgroundImage: NOISE,
        backgroundSize: '256px 256px',
        backgroundPosition: `${(langkah * 73) % 256}px ${(langkah * 151) % 256}px`,
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
};
