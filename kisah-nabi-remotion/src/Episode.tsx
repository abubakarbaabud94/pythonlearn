import React from 'react';
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFonts } from './fonts';
import { Camera } from './lib/camera';
import { captionsDariVo, perkiraanCaptions } from './lib/captions';
import { CueContext, type Cue } from './lib/cues';
import { MomenContext } from './lib/momen';
import { KILAT, Latar, SAAT_TELAN } from './scenes/Latar';
import { Grain } from './components/tekstur';
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
import type { Episode, JenisSfx, Scene } from './types';

loadFonts();

const TRANSISI = 15; // frame crossfade antar-scene

type Posisi = { scene: Scene; dari: number; dur: number; cues: Cue[]; momen: Record<string, number> };

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
    const momen: Record<string, number> = {};
    for (const m of scene.momen ?? []) {
      const pola = new RegExp(m.kata, 'i');
      const k = vo?.kata.find((w) => w.adegan === i && pola.test(w.text));
      if (k) momen[m.nama] = Math.round(k.start * fps) - dari;
    }
    return { scene, dari, dur, cues, momen };
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
      {scene.klip ? (
        <OffthreadVideo src={staticFile(scene.klip)} muted style={{ width: '100%', height: '100%' }} />
      ) : (
        <Camera dari={scene.kamera.dari} ke={scene.kamera.ke}>
          <Latar jenis={scene.latar} />
        </Camera>
      )}
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
      {posisi.map(({ scene, dari, dur, cues, momen }, i) => (
        <Sequence
          key={scene.id}
          name={scene.id}
          from={dari}
          durationInFrames={i === posisi.length - 1 ? dur : dur + TRANSISI}
        >
          <CueContext.Provider value={cues}>
            <MomenContext.Provider value={momen}>
              <SceneView scene={scene} episode={episode} fadeIn={i > 0} />
            </MomenContext.Provider>
          </CueContext.Provider>
        </Sequence>
      ))}
      <Grain />
      <Subtitle captions={captions} sembunyikan={sembunyikan} />
      <JalurSfx posisi={posisi} />
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

type Bunyi = { jenis: JenisSfx; frame: number; gain: number; durasi?: number };

/**
 * Sound design otomatis dari struktur episode (tanpa bunyi bernada):
 * desir di setiap pergantian scene, hantaman pada hook/kartu ayat/penutup, tik saat label sumber muncul,
 * guntur tepat di frame kilat, angin di scene badai, bunyi "telan", tiga hantaman pada tiga kegelapan,
 * dan SFX dari `momen` yang dipicu kata di voiceover.
 */
const susunBunyi = (posisi: Posisi[], fps: number): Bunyi[] => {
  const b: Bunyi[] = [];
  posisi.forEach(({ scene, dari, dur, cues, momen }, i) => {
    const durSeq = i === posisi.length - 1 ? dur : dur + TRANSISI;
    if (i > 0) {
      const lembut = scene.overlay === 'ayat' || scene.overlay === 'penutup';
      // Puncak desir (±0,55 dtk) jatuh tepat di awal scene baru.
      b.push({ jenis: lembut ? 'desir-lembut' : 'desir', frame: dari - Math.round((lembut ? 0.95 : 0.55) * fps), gain: lembut ? 0.32 : 0.26 });
    }
    if (scene.overlay === 'hook') b.push({ jenis: 'hantam', frame: dari, gain: 0.55 });
    if (scene.overlay === 'ayat') b.push({ jenis: 'hantam', frame: dari + 2, gain: 0.28 });
    if (scene.overlay === 'penutup') b.push({ jenis: 'hantam', frame: dari + 4, gain: 0.45 });
    if (scene.sumber) b.push({ jenis: 'tik', frame: dari + 8, gain: 0.3 });
    for (const f of KILAT[scene.latar] ?? []) b.push({ jenis: 'gemuruh', frame: dari + Math.round(durSeq * f), gain: 0.5 });
    if (scene.latar === 'badai' || scene.latar === 'kota-azab') b.push({ jenis: 'angin', frame: dari, gain: 0.2, durasi: durSeq });
    if (scene.latar === 'bawah-laut') b.push({ jenis: 'telan', frame: dari + Math.round(durSeq * SAAT_TELAN), gain: 0.55 });
    if (scene.overlay === 'tiga-kegelapan') cues.slice(0, 3).forEach((c) => b.push({ jenis: 'hantam', frame: dari + c.frame, gain: 0.22 }));
    for (const m of scene.momen ?? []) {
      if (m.sfx && momen[m.nama] !== undefined) b.push({ jenis: m.sfx, frame: dari + momen[m.nama], gain: m.gain ?? 0.4 });
    }
  });
  return b.filter((x) => x.frame >= 0);
};

const JalurSfx: React.FC<{ posisi: Posisi[] }> = ({ posisi }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {susunBunyi(posisi, fps).map((x, i) => (
        <Sequence key={i} from={x.frame} durationInFrames={x.durasi} layout="none" name={`sfx-${x.jenis}`}>
          {x.durasi ? (
            <Audio
              src={staticFile(`sfx/${x.jenis}.wav`)}
              loop
              volume={(f) => interpolate(f, [0, 20, x.durasi! - 20, x.durasi!], [0, x.gain, x.gain, 0], { extrapolateRight: 'clamp' })}
            />
          ) : (
            <Audio src={staticFile(`sfx/${x.jenis}.wav`)} volume={x.gain} />
          )}
        </Sequence>
      ))}
    </>
  );
};
