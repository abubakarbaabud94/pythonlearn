// Kapal · badai: langit hijau-kelam berpusar, hujan miring, ombak besar; kapal sarat muatan terombang-ambing.
// Kilat tepat di frame KILAT (gemuruh di Remotion jatuh di frame yang sama). Kata "kalah": ombak raksasa naik di latar depan.
SCENES['vg_kapal'] = (() => {
  const { W, H, P } = VG, HZ = 1120, ID = 'kapal';
  const SW = [[260, 330, 230, -1], [800, 420, 200, 1], [520, 760, 150, -1], [120, 820, 110, 1], [950, 900, 100, -1]];
  const wave = VG.waveFn(HZ, { amp: 2.4, speed: 1.7, gap: 130 });
  const sky = VG.skyAngle(SW, [], { wind: 0.6 }), seaA = VG.seaAngle(wave, 1);
  const S = {
    sky: P.swatch(['#16263a', '#24404e', '#3a5c64', '#5a7c7a', '#1a2a3e', '#46646a'], 0.45),
    sea: P.swatch(['#10303e', '#1a4652', '#2a5e66', '#0a1e2a', '#3a7270'], 0.4),
    foam: P.swatch(['#d8eaea', '#b0d0d0', '#eef6f4'], 0.25),
    wood: P.swatch(['#3a2418', '#5a3a22', '#2a1a12', '#6a4a2a'], 0.3),
    sail: P.swatch(['#c8b080', '#a89060', '#d8c090'], 0.3),
  };
  // ombak raksasa latar depan (muncul pada "kalah")
  const besar = (x, t, h) => H + 60 - h * (880 + 160 * Math.sin(x * 0.004 + 1.2)) + Math.sin(x * 0.012 - t * 2) * 36 * h;
  const angle = (x, y, t) => (y < HZ - 6 ? sky(x, y, t) : seaA(x, y, t));
  const palette = (x, y, col, r) => {
    if (y < HZ - 6) return S.sky(col, r);
    if (col[0] > 170 && col[1] > 190) return S.foam(col, r);
    return S.sea(col, r);
  };
  const shipY = t => wave(540, t, 0) - 70, shipR = t => Math.sin(t * 1.6) * 0.2 + Math.cos(t * 0.9) * 0.06;
  function ship(g, t) {
    g.save(); g.translate(540, shipY(t)); g.rotate(shipR(t)); g.scale(1.6, 1.6);
    g.fillStyle = '#3a2418'; g.beginPath(); g.moveTo(-120, -10); g.lineTo(120, -10); g.quadraticCurveTo(95, 36, 0, 40); g.quadraticCurveTo(-95, 36, -120, -10); g.fill();
    g.fillStyle = '#5a3a22'; [[-90, 34], [-50, 40], [10, 30], [50, 38]].forEach(([x, w]) => g.fillRect(x, -10 - w * 0.8, w, w * 0.8)); // muatan: peti
    g.fillStyle = '#8a5a2a'; [[-100, -26], [92, -24]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 12, 18, 0, 0, Math.PI * 2); g.fill(); }); // tempayan
    g.fillStyle = '#1a1210'; g.fillRect(-4, -190, 8, 182);
    g.fillStyle = '#c8b080'; g.beginPath(); g.moveTo(6, -180); g.quadraticCurveTo(80, -120, 70, -40); g.lineTo(6, -46); g.closePath(); g.fill();
    g.restore();
  }
  return {
    draw(c, lt) {
      const tk = VG.ev(ID, 'kalah', 0, 7.3), K = VG.T(ID).ev.kilat || [];
      const h = VG.ramp(lt, tk - 0.7, tk + 0.6);
      const b = P.scratch('vgKapalBase'), bg = b.getContext('2d');
      VG.fillV(bg, 0, HZ, [[0, '#0a1220'], [0.6, '#1e3644'], [1, '#3a5a5a']]);
      VG.swirls(bg, SW, lt, { cols: ['#2c4a56', '#5e7e80'], width: 28, speed: 0.9 });
      VG.ribbon(bg, lt, { y: 600, col: '#6a8a88', amp: 90, speed: 1.4, width: 40 });
      VG.fillV(bg, HZ - 10, H, [[0, '#2a5660'], [1, '#06141c']]);
      ['#2e6670', '#12343e', '#2a6068', '#0e2c36', '#245660', '#0a222c'].forEach((col, k) => {
        bg.fillStyle = col; bg.beginPath(); bg.moveTo(-20, H);
        for (let x = -20; x <= W + 20; x += 12) bg.lineTo(x, wave(x, lt, k)); bg.lineTo(W + 20, H); bg.closePath(); bg.fill();
        bg.strokeStyle = '#e4f2f0'; bg.lineWidth = 12; bg.lineCap = 'round'; bg.beginPath();
        for (let x = -20; x <= W + 20; x += 12) { const y = wave(x, lt, k) + 4; if (Math.sin(x * 0.009 + lt * 0.9 * 1.7 + k * 1.7) > 0.3) bg.lineTo(x, y); else bg.moveTo(x, y); }
        bg.stroke();
      });
      if (h > 0) {
        const top = besar(540, lt, h);
        bg.fillStyle = VG.vgrad(bg, top - 100, H, [[0, '#4a9a9a'], [0.25, '#2a6e74'], [1, '#08202a']]); bg.beginPath(); bg.moveTo(0, H);
        for (let x = 0; x <= W; x += 12) bg.lineTo(x, besar(x, lt, h)); bg.lineTo(W, H); bg.closePath(); bg.fill();
        bg.strokeStyle = '#f0f8f6'; bg.lineCap = 'round';
        for (const [dy, w] of [[4, 26], [40, 10], [80, 8]]) { bg.lineWidth = w; bg.beginPath(); for (let x = 0; x <= W; x += 12) bg.lineTo(x, besar(x, lt, h) + dy + Math.sin(x * 0.05 + dy) * 6); bg.stroke(); }
      }
      c.drawImage(b, 0, 0);
      VG.paint(c, b, { cell: 13, len: 50, width: 10, angle, t: lt, palette, outlineCol: [6, 14, 20], mask: (x, y) => y < HZ - 6 });
      VG.paint(c, b, { cell: 11, len: 40, width: 9, seed: 23, angle, t: lt, palette, outlineCol: [4, 14, 20], outlineMix: 0.5, mask: (x, y) => y >= HZ - 6 });
      VG.obj(c, 'vgKapalShip', g => ship(g, lt), { cell: 5, len: 13, width: 4, seed: 8, t: lt, boil: 8, outlineCol: [20, 12, 8],
        palette: (x, y, col, r) => (col[0] > 150 ? S.sail(col, r) : S.wood(col, r)), angle: () => shipR(lt) });
      // semprotan ombak di depan kapal ketika ombak raksasa naik
      if (h > 0) { c.save(); c.globalAlpha = 0.9 * h; P.strokes(c, b, { cell: 10, len: 34, width: 9, seed: 41, t: lt, boil: 12, outline: 0.6, outlineCol: [4, 20, 26], outlineMix: 0.5, palette, angle: (x, y) => seaA(x, y, lt) - 0.3, mask: (x, y) => y > besar(x, lt, h) - 30 }); c.restore(); }
      VG.rain(c, lt, { n: 300, a: 0.28 });
      // kilat
      K.forEach((tk2, i) => {
        const f = VG.flash(lt, tk2, 0.45);
        if (f <= 0) return;
        c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(190,210,235,${0.5 * f})`; c.fillRect(0, 0, W, H); c.restore();
        VG.bolt(c, i % 2 ? 260 : 820, -20, HZ - 120, 17 + i * 31, f);
      });
      VG.vignette(c, 0.45);
    },
  };
})();
