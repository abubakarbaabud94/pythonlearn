import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from '@remotion/captions';
import { COLORS, FONTS, SAFE } from '../theme';

const Halaman: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000 + page.startMs;
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: SAFE.bottom + 110,
        paddingLeft: SAFE.side,
        paddingRight: SAFE.right,
      }}
    >
      <div
        style={{
          transform: `scale(${0.85 + 0.15 * pop})`,
          textAlign: 'center',
          fontFamily: FONTS.teks,
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.18,
          textTransform: 'uppercase',
          whiteSpace: 'pre-wrap',
          paintOrder: 'stroke',
          WebkitTextStroke: '12px rgba(0,0,0,0.85)',
          textShadow: '0 6px 20px rgba(0,0,0,0.6)',
        }}
      >
        {page.tokens.map((t) => {
          const aktif = t.fromMs <= ms && ms < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: aktif ? COLORS.gold : COLORS.ivory }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Subtitle gaya TikTok: 2–4 kata per halaman, kata yang sedang diucapkan menyala emas. */
export const Subtitle: React.FC<{ captions: Caption[]; sembunyikan: [number, number][] }> = ({
  captions,
  sembunyikan,
}) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 900 }),
    [captions],
  );
  return (
    <>
      {pages.map((page, i) => {
        const dari = Math.round((page.startMs / 1000) * fps);
        const berikut = pages[i + 1]?.startMs ?? page.startMs + page.durationMs;
        const sampai = Math.round((Math.min(berikut, page.startMs + page.durationMs + 300) / 1000) * fps);
        if (sembunyikan.some(([a, b]) => dari >= a && dari < b)) return null;
        if (sampai <= dari) return null;
        return (
          <Sequence key={i} from={dari} durationInFrames={sampai - dari} layout="none">
            <Halaman page={page} />
          </Sequence>
        );
      })}
    </>
  );
};
