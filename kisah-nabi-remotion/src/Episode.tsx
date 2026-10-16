import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFonts } from './fonts';
import { Camera } from './lib/camera';
import { perkiraanCaptions } from './lib/captions';
import { Latar } from './scenes/Latar';
import { Subtitle } from './components/Subtitle';
import {
  AyatCard,
  HookTitle,
  KaligrafiLatar,
  PenutupOverlay,
  SeriesBadge,
  SourceTag,
  TigaKegelapan,
} from './components/overlay';
import { COLORS } from './theme';
import type { Episode, Scene } from './types';

loadFonts();

const TRANSISI = 15; // frame crossfade antar-scene

export const durasiEpisode = (ep: Episode, fps: number) =>
  ep.scenes.reduce((a, s) => a + Math.round(s.detik * fps), 0);

const SceneView: React.FC<{ scene: Scene; episode: Episode; fadeIn: boolean }> = ({ scene, episode, fadeIn }) => {
  const frame = useCurrentFrame();
  const op = fadeIn ? interpolate(frame, [0, TRANSISI], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ opacity: op, overflow: 'hidden' }}>
      <Camera dari={scene.kamera.dari} ke={scene.kamera.ke}>
        <Latar jenis={scene.latar} />
      </Camera>
      {scene.kaligrafi && <KaligrafiLatar kunci={scene.kaligrafi} />}
      {scene.overlay === 'hook' && (
        <>
          <SeriesBadge episode={episode} />
          <HookTitle episode={episode} />
        </>
      )}
      {scene.overlay === 'tiga-kegelapan' && <TigaKegelapan />}
      {scene.overlay === 'ayat' && scene.ayat && (
        <AyatCard kunci={scene.ayat} sorotKataTerakhir={scene.sorotKataTerakhir} />
      )}
      {scene.overlay === 'penutup' && <PenutupOverlay episode={episode} />}
      {scene.sumber && <SourceTag sumber={scene.sumber} />}
    </AbsoluteFill>
  );
};

export const EpisodeVideo: React.FC<{ episode: Episode }> = ({ episode }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const captions = perkiraanCaptions(episode.scenes);

  let mulai = 0;
  const posisi = episode.scenes.map((s) => {
    const dur = Math.round(s.detik * fps);
    const p = { scene: s, dari: mulai, dur };
    mulai += dur;
    return p;
  });
  // Subtitle disembunyikan saat kartu ayat tampil (terjemahan sudah ada di kartu).
  const sembunyikan = posisi
    .filter((p) => p.scene.overlay === 'ayat')
    .map((p) => [p.dari, p.dari + p.dur] as [number, number]);

  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      {posisi.map(({ scene, dari, dur }, i) => (
        <Sequence
          key={scene.id}
          name={scene.id}
          from={dari}
          durationInFrames={i === posisi.length - 1 ? dur : dur + TRANSISI}
        >
          <SceneView scene={scene} episode={episode} fadeIn={i > 0} />
        </Sequence>
      ))}
      <Subtitle captions={captions} sembunyikan={sembunyikan} />
      {episode.audio?.voiceover && <Audio src={staticFile(episode.audio.voiceover)} />}
      {episode.audio?.ambience && (
        <Audio
          src={staticFile(episode.audio.ambience)}
          volume={(f) => interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, 0.5, 0.5, 0], { extrapolateRight: 'clamp' })}
        />
      )}
    </AbsoluteFill>
  );
};
