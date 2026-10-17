import type { Episode } from '../types';
import { yunus } from './yunus';

// Yunus Part 1 dengan latar lukisan bergerak gaya Van Gogh (mesin huashu-art-motion, vangogh/engine).
// Naskah, voiceover, overlay, subtitle, dan SFX sama dengan episode `yunus`; hanya latarnya diganti klip.
// Klip dibuat dengan: npm run vangogh  (-> public/vangogh/yunus/<id-scene>.mp4)
export const yunusVg: Episode = {
  ...yunus,
  id: 'yunus-vg',
  scenes: yunus.scenes.map((s) => ({ ...s, klip: `vangogh/yunus/${s.id}.mp4` })),
};
