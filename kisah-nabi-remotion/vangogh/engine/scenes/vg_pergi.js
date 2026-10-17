// Pergi · senja di Niniwe, gaya "Wheatfield with Crows": matahari bercincin di atas kota, ladang gandum, jalan berkelok
// menjauh dari gerbang kota. Kata "pergi" melepas kawanan gagak menjauh; menjelang "marah" langit memerah dan pusaran mengencang.
SCENES['vg_pergi'] = (() => {
  const { W, H, P } = VG, HZ = 1180, SUN = [790, 900], ID = 'pergi';
  const SW = [[230, 380, 170, 1], [640, 260, 140, -1], [930, 520, 120, 1], [420, 700, 110, -1], [120, 860, 80, 1]];
  const sky = VG.skyAngle(SW, [[SUN[0], SUN[1], 260]]);
  // jalan: kurva dari gerbang kota (kiri tengah) ke kanan bawah
  const jalan = (y) => { const u = (y - HZ) / (H - HZ); return 300 + u * u * 620 + Math.sin(u * 5) * 40; };
  const lebar = (y) => 14 + ((y - HZ) / (H - HZ)) * 230;
  const angle = (x, y, t) => {
    if (y < HZ - 6) return sky(x, y, t);
    if (Math.abs(x - jalan(y)) < lebar(y)) return Math.atan2(1, 1.25 * (jalan(y + 10) - jalan(y - 10)) / 20) ;
    return -Math.PI / 2 + 0.5 + 0.35 * Math.sin(x * 0.01 + t * 1.6 + y * 0.004);   // gandum condong ditiup angin
  };
  const S = {
    sky: P.swatch(['#1d2f78', '#2c4aa0', '#5878c0', '#88a8d8', '#c06a4a', '#e08a4a'], 0.5),
    hot: P.swatch(['#fff0a0', '#f6d84a', '#f0a83a', '#ffce5a'], 0.3),
    wheat: P.swatch(['#e8b23a', '#d0902a', '#f4cc5a', '#b8782a', '#f0d070'], 0.35),
    road: P.swatch(['#a0522d', '#7a3a22', '#c06a3a', '#4a7a3a', '#6a8a3a'], 0.35),
  };
  const palette = (x, y, col, r) => {
    if (Math.hypot(x - SUN[0], y - SUN[1]) < 240) return S.hot(col, r);
    if (y < HZ - 6) return S.sky(col, r);
    if (Math.abs(x - jalan(y)) < lebar(y)) return S.road(col, r);
    return S.wheat(col, r);
  };
  const BIRDS = Array.from({ length: 14 }, (_, k) => { const r = U.rng(k + 3); return [r() * 300 - 40, r() * 260 - 130, 0.6 + r() * 0.7, r() * 6, 0.6 + r() * 0.9]; });
  function base(g, t, m) {
    VG.fillV(g, 0, HZ, [[0, '#14205a'], [0.45, '#3a4aa0'], [0.8, '#d07a4a'], [1, '#f2b04a']]);
    if (m > 0) { g.fillStyle = `rgba(160,24,16,${0.4 * m})`; g.fillRect(0, 0, W, HZ); }
    VG.swirls(g, SW, t, { cols: m > 0.4 ? ['#a0403a', '#e08a5a'] : ['#4a62b0', '#d89a6a'], speed: 0.4 + 0.8 * m });
    VG.ribbon(g, t, { y: 560, col: m > 0.4 ? '#e09a6a' : '#b0c0e8', amp: 60, speed: 0.5 + m });
    VG.glow(g, SUN[0], SUN[1], 300, [[0, '#fff2b0'], [0.35, '#f6c84a'], [1, 'rgba(240,140,60,0)']]);
    // ladang gandum + jalan
    VG.fillV(g, HZ, H, [[0, '#c88a2a'], [0.5, '#d8a23a'], [1, '#8a5a1a']]);
    g.lineCap = 'round';
    for (let y = HZ; y < H; y += 6) { g.strokeStyle = '#8a4a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(jalan(y) - lebar(y), y); g.lineTo(jalan(y) + lebar(y), y); g.stroke(); }
    for (const s of [-1, 1]) { g.strokeStyle = '#4f7a34'; g.lineWidth = 14; g.beginPath(); for (let y = HZ; y < H; y += 10) { const x = jalan(y) + s * lebar(y); y > HZ ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  }
  return {
    draw(c, lt) {
      const tm = VG.ev(ID, 'marah', 0, 8.3), tp = VG.ev(ID, 'pergi', 0, 5.2);
      const m = VG.ramp(lt, tm - 2.4, tm + 0.2);
      const b = P.scratch('vgPergiBase'), bg = b.getContext('2d');
      base(bg, lt, m); c.drawImage(b, 0, 0);
      VG.paint(c, b, { angle, t: lt, palette, mask: (x, y) => y < HZ - 6 });
      VG.paint(c, b, { cell: 11, len: 36, width: 8, seed: 31, angle, t: lt, palette, outlineCol: [70, 36, 10], outlineMix: 0.5, mask: (x, y) => y >= HZ - 6 });
      VG.sun(c, SUN[0], SUN[1], 70, lt, m > 0.3 ? { mid: '#f0903a', ring: '#d0502a', core: '#ffd27a' } : {});
      // kota Niniwe: siluet di cakrawala kiri
      VG.obj(c, 'vgPergiKota', g => { VG.city(g, lt, { y: HZ + 10, x0: -60, s: 0.62, col: '#2a1430', lit: '#ffc85a' }); VG.palm(g, 600, HZ + 16, 190, lt, '#1e1420'); VG.palm(g, 40, HZ + 16, 150, lt, '#1e1420'); },
        { cell: 5, len: 14, width: 4, seed: 7, t: lt, outlineCol: [10, 4, 14], palette: (x, y, col, r) => (col[0] > 200 ? col : P.mix([42, 20, 48], col, 0.5)), angle: () => -Math.PI / 2 });
      // gagak: lepas dari kota saat "pergi", terbang menjauh ke kanan atas
      const k = VG.ramp(lt, tp - 0.4, tp + 3.8);
      if (k > 0) VG.crows(c, BIRDS.map(([dx, dy, s, ph, sp]) => [260 + dx + k * 700 * sp, 980 + dy - k * 520 * sp, s * (1 - 0.4 * k), ph]), lt);
      VG.vignette(c, 0.35);
    },
  };
})();
