import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Kamera } from '../types';

const CameraContext = createContext<Kamera>({ x: 0, y: 0, zoom: 1 });

/** Gerak kamera halus dari `dari` ke `ke` sepanjang durasi scene. */
export const Camera: React.FC<{ dari: Kamera; ke: Kamera; children: React.ReactNode }> = ({
  dari,
  ke,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const cam = {
    x: dari.x + (ke.x - dari.x) * t,
    y: dari.y + (ke.y - dari.y) * t,
    zoom: dari.zoom + (ke.zoom - dari.zoom) * t,
  };
  return <CameraContext.Provider value={cam}>{children}</CameraContext.Provider>;
};

/**
 * Lapisan parallax. depth 0 = diam (langit jauh), 1 = ikut kamera penuh (latar depan).
 * Semakin besar depth, semakin cepat bergerak -> ilusi kedalaman 2.5D.
 */
export const Layer: React.FC<{ depth: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth,
  children,
  style,
}) => {
  const cam = useContext(CameraContext);
  const scale = 1 + (cam.zoom - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-cam.x * depth}px, ${-cam.y * depth}px) scale(${scale})`,
        transformOrigin: '50% 50%',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
