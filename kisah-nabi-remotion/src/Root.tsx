import React from 'react';
import { Composition } from 'remotion';
import { EpisodeVideo, durasiEpisode } from './Episode';
import { yunus } from './episodes/yunus';
import { yunusVg } from './episodes/yunus-vg';
import { yunus2 } from './episodes/yunus-2';
import { zakariya } from './episodes/zakariya';
import { VIDEO } from './theme';

// Episode baru: buat file di src/episodes/, lalu daftarkan di sini.
const EPISODES = [
  { id: 'Yunus', episode: yunus },
  { id: 'YunusVG', episode: yunusVg },
  { id: 'Yunus2', episode: yunus2 },
  { id: 'Zakariya', episode: zakariya },
];

export const RemotionRoot: React.FC = () => (
  <>
    {EPISODES.map(({ id, episode }) => (
      <Composition
        key={id}
        id={id}
        component={EpisodeVideo}
        durationInFrames={durasiEpisode(episode, VIDEO.fps)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{ episode }}
      />
    ))}
  </>
);
