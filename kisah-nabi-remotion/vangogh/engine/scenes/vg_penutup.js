// Penutup · Niniwe di bawah langit merah-ungu yang berpusar (pertanda Part 2). Bagian atas gelap untuk teks penutup;
// pada "azab" langit berdenyut merah.
SCENES['vg_penutup'] = (() => {
  const { W, H, P } = VG, ID = 'penutup', HZ = 1400;
  const SW = [[240, 520, 210, 1], [800, 640, 230, -1], [520, 1000, 180, 1], [140, 1150, 120, -1], [960, 1120, 120, 1]];
  const sky = VG.skyAngle(SW, [], { wind: 0.4 });
  const angle = (x, y, t) => (y < HZ ? sky(x, y, t) : 0.2 * Math.sin(x * 0.01));
  const S = { sky: P.swatch(['#2a0a2a', '#4a1430', '#7a2030', '#a03a2a', '#3a1450', '#5a2a6a'], 0.45), ground: P.swatch(['#1a0a14', '#2a1020', '#120610'], 0.4) };
  return {
    draw(c, lt) {
      const ta = VG.ev(ID, 'azab', 0, 6.2);
      const d = VG.flash(lt, ta, 1.6);
      const b = P.scratch('vgTutupBase'), bg = b.getContext('2d');
      VG.fillV(bg, 0, HZ, [[0, '#0e0618'], [0.45, '#3a0e2a'], [0.85, '#8a2a24'], [1, '#c8582a']]);
      VG.swirls(bg, SW, lt, { cols: ['#6a1a30', '#b04a34'], width: 26, speed: 0.6 + 0.8 * d });
      VG.ribbon(bg, lt, { y: 880, col: '#c86a3a', amp: 70, speed: 0.8 });
      if (d > 0) { bg.fillStyle = `rgba(200,30,20,${0.35 * d})`; bg.fillRect(0, 0, W, HZ); }
      VG.fillV(bg, HZ, H, [[0, '#2a1020'], [1, '#08030a']]);
      c.drawImage(b, 0, 0);
      VG.paint(c, b, { cell: 12, len: 46, width: 9, angle, t: lt, outlineCol: [10, 2, 10], outlineMix: 0.5, palette: (x, y, col, r) => (y < HZ ? S.sky(col, r) : S.ground(col, r)) });
      VG.obj(c, 'vgTutupKota', g => { VG.city(g, lt, { y: HZ + 20, x0: 0, s: 0.95, col: '#14060e', lit: '#ffb04a' }); VG.palm(g, 60, HZ + 30, 230, lt, '#0c0408'); VG.palm(g, 1010, HZ + 30, 260, lt, '#0c0408'); },
        { cell: 5, len: 14, width: 4, seed: 9, t: lt, outlineCol: [6, 2, 6], palette: (x, y, col, r) => (col[0] > 200 ? col : P.mix([24, 8, 16], col, 0.5)), angle: () => -Math.PI / 2 });
      // atas lebih gelap: ruang untuk teks penutup
      VG.fillV(c, 0, 1000, [[0, 'rgba(6,3,10,.55)'], [1, 'rgba(6,3,10,0)']]);
      VG.vignette(c, 0.45);
    },
  };
})();
