// Dikabulkan · dari gelap perut ikan ke cahaya. Berkas cahaya menembus dari atas sejak awal, menguat di "bertasbih";
// pada "Allah" matahari bercincin muncul dan langit berubah menjadi pusaran kuning; puncaknya di "menyelamatkannya".
SCENES['vg_dikabulkan'] = (() => {
  const { W, H, P } = VG, ID = 'dikabulkan', SUN = [540, 420];
  const SW = [[220, 900, 220, 1], [840, 1000, 200, -1], [520, 1420, 240, 1], [160, 1600, 140, -1], [900, 1600, 160, 1]];
  const sw = VG.skyAngle(SW, [[SUN[0], SUN[1], 360]]);
  const S = {
    dark: P.swatch(['#2a060c', '#3a0c14', '#14040a', '#4a1418', '#200a18'], 0.4),
    gold: P.swatch(['#fff0a0', '#f6d84a', '#f0b83a', '#ffe680', '#e8a83a', '#c8d870'], 0.35),
  };
  return {
    draw(c, lt) {
      const tb = VG.ev(ID, 'tasbih', 0, 2.7), ta = VG.ev(ID, 'allah', 0, 7.7), tsel = VG.ev(ID, 'selamat', 0, 9.9);
      const L = 0.08 + 0.12 * VG.ramp(lt, tb - 0.5, tb + 1.5) + 0.8 * VG.ramp(lt, ta - 0.2, tsel);
      const b = P.scratch('vgKabulBase'), bg = b.getContext('2d');
      VG.fillV(bg, 0, H, [[0, '#2a0a12'], [1, '#08020a']]);
      if (L > 0.1) { bg.globalAlpha = VG.clamp((L - 0.1) / 0.6); VG.fillV(bg, 0, H, [[0, '#fff2b0'], [0.35, '#f2c84a'], [1, '#c8902a']]); bg.globalAlpha = 1; }
      VG.swirls(bg, SW, lt, { cols: L > 0.45 ? ['#f0b83a', '#fff0a0'] : ['#4a1418', '#6a2a2a'], width: 26, speed: 0.5 });
      if (L > 0.3) VG.glow(bg, SUN[0], SUN[1], 420, [[0, '#ffffff'], [0.3, '#fff0a0'], [1, 'rgba(246,216,74,0)']]);
      c.drawImage(b, 0, 0);
      VG.paint(c, b, { cell: 12, len: 46, width: 9, angle: sw, t: lt, outlineCol: L > 0.45 ? [120, 70, 10] : [10, 2, 6], outlineMix: 0.4,
        palette: (x, y, col, r) => { const d = S.dark(col, r), g = S.gold(col, r); return P.mix(d, g, VG.clamp((L - 0.2) / 0.5)); } });
      const s = VG.ramp(lt, ta - 0.1, ta + 0.8);
      VG.rays(c, lt, { x0: SUN[0], y0: VG.lerp(-200, SUN[1], s), n: 9, spread: VG.lerp(0.6, 2.4, s), len: 1900, a: 0.12 + 0.5 * L, rgb: '255,230,140', w: 60 + 50 * L });
      if (s > 0) { c.save(); c.globalAlpha = s; VG.sun(c, SUN[0], SUN[1], 60 + 50 * s, lt, { rings: 5 }); c.restore(); }
      const kil = VG.flash(lt, tsel, 1.2) * 0.35;
      if (kil > 0) { c.fillStyle = `rgba(255,250,220,${kil})`; c.fillRect(0, 0, W, H); }
      VG.vignette(c, 0.4 * (1 - L) + 0.15);
    },
  };
})();
