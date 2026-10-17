// Ditelan · bawah laut: air hijau-toska berpusar, berkas cahaya dari permukaan, gelembung naik.
// Pada "ditelan" ikan besar datang dari kiri dan membesar; mulutnya menutup layar tepat di SAAT_TELAN (bunyi "telan" di Remotion).
SCENES['vg_ditelan'] = (() => {
  const { W, H, P } = VG, ID = 'ditelan';
  const SW = [[300, 700, 260, 1], [820, 1100, 230, -1], [420, 1500, 200, 1], [900, 420, 160, -1]];
  const air = VG.skyAngle(SW, [], { wind: 0.4 });
  const S = { air: P.swatch(['#1a6a74', '#2a8a8a', '#0e4a5a', '#3aa09a', '#0a3040', '#5ab8a8'], 0.45), fish: P.swatch(['#06121e', '#0c2030', '#14303e', '#0a1a28', '#1e4450'], 0.3) };
  const BUB = Array.from({ length: 40 }, (_, k) => { const r = U.rng(k * 7 + 1); return [r() * W, r() * H, 4 + r() * 10, 120 + r() * 160]; });
  return {
    draw(c, lt) {
      const td = VG.ev(ID, 'ditelan', 0, 1.2), tt = VG.ev(ID, 'telan', 0, 4.07);
      const b = P.scratch('vgDitelanBase'), bg = b.getContext('2d');
      VG.fillV(bg, 0, H, [[0, '#3a9a9a'], [0.35, '#16606e'], [1, '#03121c']]);
      VG.swirls(bg, SW, lt, { cols: ['#2a7a80', '#5ab0a8'], width: 24, speed: 0.35 });
      c.drawImage(b, 0, 0);
      VG.paint(c, b, { cell: 12, len: 46, width: 9, angle: air, t: lt, palette: (x, y, col, r) => S.air(col, r), outlineCol: [4, 30, 40] });
      VG.rays(c, lt, { x0: 620, y0: -200, n: 7, spread: 0.7, len: 1700, a: 0.32, rgb: '200,255,220', w: 80 });
      // gelembung
      c.save(); c.strokeStyle = 'rgba(210,250,240,.7)'; c.lineWidth = 3;
      BUB.forEach(([x, y, r, sp]) => { const yy = ((y - lt * sp) % H + H) % H; c.beginPath(); c.arc(x + Math.sin(lt * 2 + y) * 8, yy, r, 0, Math.PI * 2); c.stroke(); });
      c.restore();
      // ikan: masuk utuh dari kiri (A), lalu kamera terdorong ke mulutnya (B); mulut gelap menelan layar tepat di "telan"
      const pa = VG.ramp(lt, td - 0.4, td + 1.3), pb = VG.ramp(lt, td + 1.3, tt);
      const s = 0.85 + pb * pb * 3.6;
      const hx = VG.lerp(VG.lerp(-120, 780, pa), 560, pb), hy = VG.lerp(1120, 960, pb);   // (hx, hy) = moncong ikan
      VG.obj(c, 'vgDitelanFish', g => VG.fish(g, hx - 430 * s, hy - 20 * s, s, lt * 1.5, { flip: true, body: '#10283a', back: '#3a7a86', eye: '#d8f4ec' }),
        { cell: 7 + pb * 5, len: 26 + pb * 24, width: 6 + pb * 5, seed: 6, t: lt, outlineCol: [2, 8, 14], angle: () => 0.08,
          palette: (x, y, col, r) => (col[2] > 100 ? P.mix([70, 140, 150], col, 0.6) : S.fish(col, r)) });
      const m = VG.ramp(lt, tt - 1.0, tt);
      if (m > 0) {
        const R = 30 * s + m * m * 2200, cx = hx - 40 * s * (1 - m) + m * (540 - hx), cy = hy + 10 * s * (1 - m) + m * (960 - hy);
        const g = c.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
        g.addColorStop(0, 'rgba(6,2,6,1)'); g.addColorStop(1, 'rgba(6,2,6,0)');
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
      }
      // setelah ditelan: gelap dengan pendar merah tua perut ikan
      const d = VG.ramp(lt, tt, tt + 0.35);
      if (d > 0) {
        c.fillStyle = `rgba(6,2,6,${d})`; c.fillRect(0, 0, W, H);
        const red = VG.ramp(lt, tt + 0.4, tt + 1.6) * 0.35;
        if (red > 0) VG.glow(c, 540, 1100, 900, [[0, `rgba(90,14,20,${red})`], [1, 'rgba(90,14,20,0)']]);
      }
      VG.vignette(c, 0.4);
    },
  };
})();
