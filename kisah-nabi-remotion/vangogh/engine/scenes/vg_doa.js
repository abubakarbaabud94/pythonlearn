// Doa · kegelapan biru-ungu yang berpusar mengelilingi satu cahaya; cahaya menguat saat "berseru" dan memuncak di "Tidak (ada tuhan)".
// Sengaja redup dan tenang: kartu ayat dari Remotion tampil di atasnya.
SCENES['vg_doa'] = (() => {
  const { W, H, P } = VG, ID = 'doa', C = [540, 300];   // di atas kartu ayat (±y 510–1440) agar teks Arab tetap terbaca
  const angle = (x, y, t) => { const d = Math.hypot(x - C[0], y - C[1]); return Math.atan2(y - C[1], x - C[0]) + Math.PI / 2 + 0.35 * Math.sin(d * 0.004 - t * 0.4); };
  const S = { dark: P.swatch(['#0a0c2a', '#14183e', '#1e2456', '#0c1a3a', '#262a60'], 0.45), gold: P.swatch(['#f6d84a', '#f0b83a', '#fff0a0', '#d8902a'], 0.35) };
  return {
    draw(c, lt) {
      const ts = VG.ev(ID, 'seru', 0, 2.9), tn = VG.ev(ID, 'tidak', 0, 4.1);
      const L = 0.25 + 0.4 * VG.ramp(lt, ts - 0.5, tn) + 0.12 * Math.sin(lt * 1.4);
      const b = P.scratch('vgDoaBase'), bg = b.getContext('2d');
      VG.fillV(bg, 0, H, [[0, '#06081e'], [0.4, '#121640'], [1, '#04050f']]);
      bg.lineCap = 'round';
      for (let k = 0; k < 9; k++) { bg.strokeStyle = k % 2 ? '#1e2660' : '#2c3474'; bg.lineWidth = 26; bg.beginPath(); bg.arc(C[0], C[1], 160 + k * 95 + Math.sin(lt * 0.8 + k) * 12, lt * 0.12 * (k % 2 ? 1 : -1), lt * 0.12 * (k % 2 ? 1 : -1) + Math.PI * 1.6); bg.stroke(); }
      VG.glow(bg, C[0], C[1], 260 + 160 * L, [[0, `rgba(255,236,150,${0.9 * L})`], [0.35, `rgba(240,184,58,${0.55 * L})`], [1, 'rgba(40,40,110,0)']]);
      c.drawImage(b, 0, 0);
      VG.paint(c, b, { cell: 13, len: 48, width: 9, angle, t: lt, outlineCol: [4, 4, 16], outlineMix: 0.5,
        palette: (x, y, col, r) => (col[0] > 120 && col[0] > col[2] ? S.gold(col, r) : S.dark(col, r)) });
      VG.halo(c, C[0], C[1], lt, { r0: 60, r1: 320 + 120 * L, a: 0.16 + 0.2 * L, speed: 0.35, rgb: '255,200,90' });
      c.save(); c.globalCompositeOperation = 'lighter';
      VG.glow(c, C[0], C[1], 120 + 60 * L, [[0, `rgba(255,244,200,${0.75 * L})`], [0.4, `rgba(255,200,90,${0.3 * L})`], [1, 'rgba(255,200,90,0)']]);
      c.restore();
      VG.vignette(c, 0.6);
    },
  };
})();
