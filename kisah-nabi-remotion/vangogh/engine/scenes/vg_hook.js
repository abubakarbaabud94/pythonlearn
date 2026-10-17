// Hook · laut malam di bawah langit berpusar; kapal kecil di cakrawala, ikan besar naik pelan di bawah ombak.
// Frame 0 = thumbnail: komposisi sudah utuh sejak awal. Kata "gelap" meredupkan langit sedikit, "satu" membuat halo bulan memuncak.
SCENES['vg_hook'] = (() => {
  const { W, H, P } = VG, HZ = 1090, MOON = [860, 400], ID = 'hook';
  const SW = [[380, 560, 200, 1], [720, 450, 150, -1], [200, 260, 95, -1], [880, 800, 110, 1], [560, 880, 80, -1]];
  const STARS = [[150, 520, 15], [520, 170, 13], [960, 640, 14], [640, 700, 11], [300, 900, 12], [930, 150, 9], [110, 760, 9]];
  const wave = VG.waveFn(HZ);
  const fx = t => 600 - t * 16, fy = t => 1580 - t * 14;
  const sky = VG.skyAngle(SW, [[MOON[0], MOON[1], 200]]), seaA = VG.seaAngle(wave);
  const angle = (x, y, t) => (y < HZ - 4 ? sky(x, y, t) : seaA(x, y, t));
  const S = {
    sky: P.swatch(['#1c2c8a', '#2b4cb4', '#5b86d8', '#94bbee', '#c6daf6', '#3a62c8', '#7aa0e2'], 0.42),
    gold: P.swatch(['#fff2a0', '#f6d84a', '#ffe680', '#f0b83a'], 0.3),
    fish: P.swatch(['#071226', '#0c1c38', '#13284a', '#1d3c62', '#0a1830', '#2a5478'], 0.3),
    foam: P.swatch(['#d8f0f6', '#a8d8e8', '#eaf6f8', '#8ac4dc'], 0.2),
    wood: P.swatch(['#3a2418', '#5a3a22', '#2a1a12', '#6a4a2a'], 0.3),
    sail: P.swatch(['#e8c060', '#d8a840', '#f4d878', '#c08a30'], 0.25),
    sea: P.swatch(['#173d74', '#24589a', '#3e78b8', '#0e2a56', '#5a9ad0', '#1f6a7a', '#2f8a8a'], 0.4),
  };
  const palette = (x, y, col, r) => {
    if (Math.hypot(x - MOON[0], y - MOON[1]) < 150) return S.gold(col, r);
    if (y < HZ - 4) return S.sky(col, r);
    if (col[0] > 180 && col[2] < 150) return S.gold(col, r);
    if (col[2] > 200 && col[1] > 190) return S.foam(col, r);
    return S.sea(col, r);
  };
  function base(g, t) {
    VG.fillV(g, 0, HZ, [[0, '#0f1d66'], [0.6, '#2346a6'], [1, '#3d68c4']]);
    VG.swirls(g, SW, t);
    VG.ribbon(g, t, { y: 640 });
    VG.glow(g, MOON[0], MOON[1], 190, [[0, '#fff6c0'], [0.45, '#f2d55a'], [1, 'rgba(60,100,200,0)']]);
    VG.sea(g, t, wave, { HZ, stops: [[0, '#24508a'], [0.35, '#163a6c'], [1, '#081633']] });
    g.fillStyle = 'rgba(246,216,74,.8)';
    for (let k = 0; k < 9; k++) { const y = HZ + 30 + k * 34, w = 70 - k * 5 + Math.sin(t * 3 + k) * 10; g.fillRect(MOON[0] - w / 2 + Math.sin(t * 2 + k * 1.3) * 8, y, w, 9); }
    g.fillStyle = '#0d1d4a'; g.fillRect(0, HZ - 6, W, 12);
  }
  function ship(g, t) {
    g.save(); g.translate(250, HZ + 4); g.rotate(Math.sin(t * 1.8) * 0.12);
    g.fillStyle = '#2a1d1a'; g.beginPath(); g.moveTo(-70, -6); g.lineTo(70, -6); g.quadraticCurveTo(52, 22, 0, 24); g.quadraticCurveTo(-52, 22, -70, -6); g.fill();
    g.fillStyle = '#1a1210'; g.fillRect(-3, -120, 6, 116);
    g.fillStyle = '#d8b25a'; g.beginPath(); g.moveTo(5, -112); g.quadraticCurveTo(58, -70, 54, -14); g.lineTo(5, -14); g.closePath(); g.fill();
    g.fillStyle = '#b88a3a'; g.beginPath(); g.moveTo(-5, -100); g.quadraticCurveTo(-46, -60, -44, -16); g.lineTo(-5, -16); g.closePath(); g.fill();
    g.fillStyle = '#ffd86a'; g.beginPath(); g.arc(30, -2, 5, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  return {
    draw(c, lt) {
      const b = P.scratch('vgHookBase'), bg = b.getContext('2d');
      base(bg, lt); c.drawImage(b, 0, 0);
      VG.paint(c, b, { angle, t: lt, palette, mask: (x, y) => y < HZ - 4 });
      VG.paint(c, b, { cell: 11, len: 38, width: 8, seed: 21, angle, t: lt, palette, outlineCol: [8, 18, 50], outlineMix: 0.45, mask: (x, y) => y >= HZ - 4 });
      VG.obj(c, 'vgHookFish', g => VG.fish(g, fx(lt), fy(lt), 1, lt), { cell: 8, len: 30, width: 7, outline: 0.7, outlineCol: [6, 14, 34], outlineMix: 0.55, t: lt,
        palette: (x, y, col, r) => S.fish(col, r), angle: (x, y) => 0.22 * Math.sin((x - fx(lt)) * 0.006) + (y - fy(lt)) * 0.0012 }, 0.95);
      c.save(); c.globalAlpha = 0.12; P.strokes(c, b, { cell: 18, len: 40, width: 7, angle, seed: 33, t: lt, boil: 0, outline: 0, palette, mask: (x, y) => y > 1330 }); c.restore();
      VG.obj(c, 'vgHookShip', g => ship(g, lt), { cell: 5, len: 12, width: 4, seed: 8, t: lt, boil: 8, outlineCol: [20, 12, 8],
        palette: (x, y, col, r) => (col[0] > 150 ? S.sail(col, r) : S.wood(col, r)), angle: (x, y) => (y < HZ - 14 ? -Math.PI / 2 + 0.2 : 0.05) });
      // "gelap": langit meredup sedikit; "satu": halo bulan memuncak
      const redup = 0.22 * VG.ramp(lt, VG.ev(ID, 'gelap', 0, 99), VG.ev(ID, 'gelap', 0, 99) + 1.2);
      if (redup > 0) { c.fillStyle = `rgba(4,8,30,${redup})`; c.fillRect(0, 0, W, HZ); }
      const puncak = VG.flash(lt, VG.ev(ID, 'satu', 0, 99), 1.4);
      VG.halo(c, MOON[0], MOON[1], lt, { a: 0.3 + 0.35 * puncak, r1: 220 + 120 * puncak });
      VG.moon(c, MOON[0], MOON[1]);
      VG.stars(c, STARS, lt, 1 - redup * 1.5);
    },
  };
})();
