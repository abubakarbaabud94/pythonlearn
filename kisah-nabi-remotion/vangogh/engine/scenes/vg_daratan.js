// Daratan · fajar di pantai tandus: matahari bercincin rendah di atas laut tenang, pasir oker berpola sapuan.
// "ditumbuhkan" -> sebatang pohon labu (sulur berdaun lebar) tumbuh di kanan; selesai tepat di kata "labu".
SCENES['vg_daratan'] = (() => {
  const { W, H, P } = VG, ID = 'daratan', HZ = 1000, SUN = [330, 820];
  const SW = [[760, 330, 200, 1], [260, 380, 150, -1], [880, 700, 110, -1], [520, 140, 100, 1]];
  const wave = VG.waveFn(HZ - 40, { amp: 0.5, speed: 0.6, gap: 40 });
  const pantai = (x) => 1180 + (x / W) * -40 + Math.sin(x * 0.01) * 18;            // garis pantai
  const sky = VG.skyAngle(SW, [[SUN[0], SUN[1], 240]]), seaA = VG.seaAngle(wave, 1);
  const angle = (x, y, t) => (y < HZ ? sky(x, y, t) : y < pantai(x) ? seaA(x, y, t) : 0.25 * Math.sin(x * 0.008 + y * 0.01) + 0.15);
  const S = {
    sky: P.swatch(['#a8d0c8', '#d8e8a0', '#f0d880', '#88b8c8', '#c8e0b0'], 0.45),
    hot: P.swatch(['#fff2a0', '#f6d84a', '#f0b83a'], 0.3),
    sea: P.swatch(['#3a8aa0', '#5aa8b0', '#2a6a88', '#8ac8c0'], 0.4),
    sand: P.swatch(['#d8a860', '#c08a48', '#e8c078', '#a87038', '#b89058'], 0.4),
    daun: P.swatch(['#2a6a2a', '#4a8a2a', '#1a4a1a', '#6aa83a', '#3a7a3a'], 0.3),
  };
  const palette = (x, y, col, r) => (Math.hypot(x - SUN[0], y - SUN[1]) < 200 ? S.hot(col, r) : y < HZ ? S.sky(col, r) : y < pantai(x) ? S.sea(col, r) : S.sand(col, r));
  const PX = 860, PY = 1290;                                          // akar pohon labu
  // sulur: titik-titik batang dari akar ke pucuk (melengkung ke kiri atas), daun lebar bergantian kiri-kanan
  const stem = (u) => [PX - 160 * u * u + Math.sin(u * 7) * 26, PY - 520 * u];
  const LEAVES = Array.from({ length: 11 }, (_, k) => { const u = 0.12 + k * 0.08; return { u, side: k % 2 ? 1 : -1, size: 105 - k * 4 }; });
  function leaf(g, x, y, r, rot, col) {
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
    g.moveTo(0, 0); g.bezierCurveTo(-r * 1.1, -r * 0.2, -r * 0.9, -r * 1.3, 0, -r * 1.0); g.bezierCurveTo(r * 0.9, -r * 1.3, r * 1.1, -r * 0.2, 0, 0); g.fill();
    g.strokeStyle = 'rgba(20,50,16,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r * 0.85); g.stroke();
    g.restore();
  }
  function plant(g, t, p) {
    g.strokeStyle = '#2e4a1a'; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    for (let u = 0; u <= p; u += 0.02) { const [x, y] = stem(u); u ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    // sulur pembelit
    g.lineWidth = 4; g.strokeStyle = '#4a7a2a';
    [0.35, 0.6, 0.85].forEach((u, k) => { if (p < u) return; const [x, y] = stem(u); g.beginPath(); for (let a = 0; a < 9; a += 0.3) g.lineTo(x + (k % 2 ? 1 : -1) * (20 + a * 6) + Math.cos(a * 2) * 10, y - a * 4 + Math.sin(a * 2) * 10); g.stroke(); });
    LEAVES.forEach(({ u, side, size }, k) => {
      const q = VG.clamp((p - u) / 0.14); if (q <= 0) return;
      const [x, y] = stem(u), sway = Math.sin(t * 1.4 + k) * 0.05, px = x + side * (70 + 20 * (k % 2)) * q, py = y - 20 * q;
      g.strokeStyle = '#3a6a22'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + side * 30 * q, y - 30 * q, px, py); g.stroke();
      leaf(g, px, py, size * 0.85 * q, side * (1.25 + 0.15 * (k % 3)) + sway, ['#2e7424', '#64b040', '#3e8a2c'][k % 3]);
    });
    // buah labu menggantung
    [[0.42, -1], [0.7, 1]].forEach(([u, side]) => {
      const f = VG.clamp((p - u - 0.12) / 0.2); if (f <= 0) return; const [x, y] = stem(u);
      g.fillStyle = '#c8d070'; g.beginPath(); g.ellipse(x + side * 50, y + 70 * f, 30 * f, 52 * f, side * -0.25, 0, Math.PI * 2); g.fill();
    });
  }
  return {
    draw(c, lt) {
      const tt = VG.ev(ID, 'tumbuh', 0, 5.1), tl = VG.ev(ID, 'labu', 0, 7.2);
      const b = P.scratch('vgDaratBase'), bg = b.getContext('2d');
      VG.fillV(bg, 0, HZ, [[0, '#5a90b0'], [0.5, '#b8d8b0'], [1, '#f2d88a']]);
      VG.swirls(bg, SW, lt, { cols: ['#88b8c0', '#e8e8b0'], width: 20, speed: 0.3 });
      VG.glow(bg, SUN[0], SUN[1], 300, [[0, '#fff6c0'], [0.4, '#f6d84a'], [1, 'rgba(240,220,120,0)']]);
      VG.sea(bg, lt, wave, { HZ: HZ - 40, stops: [[0, '#6ab0b8'], [1, '#2a7090']], bands: 5, cols: ['#8ac8c8', '#4a98a8'], foam: '#f0f4e8', width: 10 });
      bg.fillStyle = '#d0a060'; bg.beginPath(); bg.moveTo(0, H); for (let x = 0; x <= W; x += 20) bg.lineTo(x, pantai(x)); bg.lineTo(W, H); bg.closePath(); bg.fill();
      bg.strokeStyle = '#f4f0dc'; bg.lineWidth = 10; bg.beginPath(); for (let x = 0; x <= W; x += 20) bg.lineTo(x, pantai(x) - 4 + Math.sin(lt * 1.5 + x * 0.02) * 4); bg.stroke();
      VG.fillV(bg, 1500, H, [[0, 'rgba(120,70,30,0)'], [1, 'rgba(90,50,20,.6)']]);
      bg.fillStyle = '#7a5a3a'; [[120, 1330, 70, 34], [300, 1290, 40, 20], [620, 1360, 54, 26], [980, 1300, 46, 22]].forEach(([x, y, rx, ry]) => { bg.beginPath(); bg.ellipse(x, y, rx, ry, 0, Math.PI, 0); bg.fill(); });
      bg.strokeStyle = '#6a4a2a'; bg.lineWidth = 5; bg.lineCap = 'round';
      [[200, 1250], [480, 1270], [720, 1240]].forEach(([x, y]) => { bg.beginPath(); bg.moveTo(x, y); bg.lineTo(x - 20, y - 50); bg.moveTo(x - 10, y - 25); bg.lineTo(x + 18, y - 52); bg.stroke(); });
      c.drawImage(b, 0, 0);
      VG.paint(c, b, { cell: 12, len: 44, width: 9, angle, t: lt, palette, outlineCol: [60, 50, 30], outlineMix: 0.35 });
      VG.sun(c, SUN[0], SUN[1], 72, lt);
      const p = VG.ramp(lt, tt - 0.1, tl);
      if (p > 0) VG.obj(c, 'vgDaratPlant', g => plant(g, lt, p), { cell: 6, len: 16, width: 5, seed: 12, t: lt, boil: 8, outlineCol: [10, 30, 10],
        palette: (x, y, col, r) => (col[0] > 180 ? P.mix([230, 210, 100], col, 0.5) : P.mix(S.daun(col, r), col, 0.55)), angle: (x, y) => Math.atan2(y - PY, x - PX) + Math.PI / 2 });
      VG.vignette(c, 0.3);
    },
  };
})();
