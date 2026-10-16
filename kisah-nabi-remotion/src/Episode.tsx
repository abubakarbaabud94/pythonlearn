import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFonts } from './fonts';
import { Camera } from './lib/camera';
import { captionsDariVo, perkiraanCaptions } from './lib/captions';
import { CueContext, type Cue } from './lib/cues';
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

type Posisi = { scene: Scene; dari: number; dur: number; cues: Cue[] };

/** Posisi tiap scene di timeline. Dengan voiceover, durasi mengikuti voiceover; tanpa itu, `detik`. */
const susunScene = (ep: Episode, fps: number): Posisi[] => {
  const vo = ep.vo;
  if (vo && vo.adegan.length !== ep.scenes.length) {
    throw new Error(`Voiceover punya ${vo.adegan.length} scene, episode punya ${ep.scenes.length}. Cek penanda [long pause].`);
  }
  let mulai = 0;
  return ep.scenes.map((scene, i) => {
    const dari = vo ? Math.round(vo.adegan[i].mulai * fps) : mulai;
    const dur = vo ? Math.round(vo.adegan[i].selesai * fps) - dari : Math.round(scene.detik * fps);
    mulai = dari + dur;
    const pola = scene.cue ? new RegExp(scene.cue, 'i') : null;
    const cues =
      vo && pola
        ? vo.kata.filter((k) => k.adegan === i && pola.test(k.text)).map((k) => ({ frame: Math.round(k.start * fps) - dari, text: k.text }))
        : [];
    return { scene, dari, dur, cues };
  });
};

export const durasiEpisode = (ep: Episode, fps: number) => {
  const p = susunScene(ep, fps).at(-1)!;
  return p.dari + p.dur;
};

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
  const posisi = susunScene(episode, fps);
  const captions = episode.vo ? captionsDariVo(episode.vo) : perkiraanCaptions(episode.scenes);
  // Subtitle disembunyikan saat kartu ayat tampil (terjemahan sudah ada di kartu).
  const sembunyikan = posisi
    .filter((p) => p.scene.overlay === 'ayat')
    .map((p) => [p.dari, p.dari + p.dur] as [number, number]);
  // Ambience diturunkan saat ada voiceover agar narasi tetap jelas.
  const volAmbience = episode.vo ? 0.18 : 0.5;

  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      {posisi.map(({ scene, dari, dur, cues }, i) => (
        <Sequence
          key={scene.id}
          name={scene.id}
          from={dari}
          durationInFrames={i === posisi.length - 1 ? dur : dur + TRANSISI}
        >
          <CueContext.Provider value={cues}>
            <SceneView scene={scene} episode={episode} fadeIn={i > 0} />
          </CueContext.Provider>
        </Sequence>
      ))}
      <Subtitle captions={captions} sembunyikan={sembunyikan} />
      {episode.vo && <Audio src={staticFile(episode.vo.audio)} />}
      {episode.audio?.ambience && (
        <Audio
          src={staticFile(episode.audio.ambience)}
          volume={(f) =>
            interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, volAmbience, volAmbience, 0], {
              extrapolateRight: 'clamp',
            })
          }
        />
      )}
    </AbsoluteFill>
  );
};
