// Tiga kegelapan · tiga lapis dari atas ke bawah: langit malam (bintang), laut, perut ikan (pendar merah tua).
// Muncul dari gelap setelah "tiga"; setiap kata "gelapnya" memadamkan satu lapis, berurutan seperti narasi
// (malam -> lautan -> perut ikan). Teks overlay TigaKegelapan dari Remotion tampil di tengah.
SCENES['vg_tiga_kegelapan'] = (() => {
  const { W, H, P } = VG, ID = 'tiga-kegelapan', Y1 = 640, Y2 = 1260;
  const SW = [[300, 300, 180, 1], [800, 220, 140, -1], [600, 520, 90, 1]];
  const STARS = [[120, 140, 12], [420, 90, 10], [700, 380, 13], [960, 120, 11], [220, 520, 9], [880, 560, 10], [560, 230, 8]];
  const wave = VG.waveFn(Y1 - 60, { amp: 1.2, gap: 100 });
  const sky = VG.skyAngle(SW), seaA = VG.seaAngle(wave);
  const rib = (x, y) => Math.atan2(y - 1700, x - 540) + Math.PI / 2;            // rusuk perut ikan: lengkung konsentris
  const angle = (x, y, t) => (y < Y1 ? sky(x, y, t) : y < Y2 ? seaA(x, y, t) : rib(x, y));
  const S = {
    sky: P.swatch(['#0e1a50', '#1c2e80', '#34509c', '#5a78c0'], 0.45),
    sea: P.swatch(['#0c2a4c', '#143a60', '#0a1e38', '#1e4a6e'], 0.45),
    perut: P.swatch(['#3a0c14', '#5a1820', '#2a060c', '#6a2228', '#20040a'], 0.4),
  };
  const palette = (x, y, col, r) => (y < Y1 ? S.sky(col, r) : y < Y2 ? S.sea(col, r) : S.perut(col, r));
  return {
    draw(c, lt) {
      const G = VG.T(ID).ev.gelap || [5.4, 6.8, 8.5], t3 = VG.ev(ID, 'tiga', 0, 3.4);
      const b = P.scratch('vgTigaBase'), bg = b.getContext('2d');
      VG.fillV(bg, 0, Y1, [[0, '#08103a'], [1, '#22388a']]);
      VG.swirls(bg, SW, lt, { cols: ['#2a3e8a', '#5a74c0'], width: 18, speed: 0.4 });
      VG.sea(bg, lt, wave, { HZ: Y1 - 60, stops: [[0, '#1e4a72'], [1, '#081a30']], bands: 6, cols: ['#2a5a86', '#163a60'], foam: '#7aa8c8' });
      bg.fillStyle = '#0a1a30'; bg.fillRect(0, Y1 - 4, W, 8);
      VG.fillV(bg, Y2, H, [[0, '#4a1018'], [0.5, '#2a060c'], [1, '#100206']]);
      bg.lineCap = 'round';
      bg.save(); bg.beginPath(); bg.rect(0, Y2, W, H - Y2); bg.clip();
      for (let k = 0; k < 8; k++) { bg.strokeStyle = k % 2 ? '#6a2228' : '#3a0c14'; bg.lineWidth = 22; bg.beginPath(); bg.arc(540, 1700, 160 + k * 70, Math.PI * 1.08, Math.PI * 1.92); bg.stroke(); }
      bg.restore();
      // tepi perut ikan: lengkung gelap di batas laut
      bg.fillStyle = '#05080e'; bg.beginPath(); bg.moveTo(0, Y2 + 40); bg.quadraticCurveTo(540, Y2 - 90, W, Y2 + 40); bg.lineTo(W, Y2 + 70); bg.quadraticCurveTo(540, Y2 - 40, 0, Y2 + 70); bg.fill();
      c.fillStyle = '#05030a'; c.fillRect(0, 0, W, H);
      c.drawImage(b, 0, 0);
      VG.paint(c, b, { cell: 12, len: 42, width: 9, angle, t: lt, palette, outlineCol: [4, 6, 16], outlineMix: 0.5 });
      VG.stars(c, STARS, lt, 1 - VG.ramp(lt, G[0], G[0] + 0.5));
      // pendar perut ikan
      VG.glow(c, 540, 1640, 520, [[0, `rgba(160,40,40,${0.35 * (1 - VG.ramp(lt, G[2], G[2] + 0.6))})`], [1, 'rgba(160,40,40,0)']]);
      // padam per lapis
      const band = (y0, y1, a) => {
        if (a <= 0) return; const f = 70, g = c.createLinearGradient(0, y0 - f, 0, y1 + f), L = y1 - y0 + 2 * f;
        g.addColorStop(0, y0 <= 0 ? `rgba(3,3,8,${a})` : 'rgba(3,3,8,0)'); g.addColorStop((2 * f) / L, `rgba(3,3,8,${a})`);
        g.addColorStop(1 - (2 * f) / L, `rgba(3,3,8,${a})`); g.addColorStop(1, y1 >= H ? `rgba(3,3,8,${a})` : 'rgba(3,3,8,0)');
        c.fillStyle = g; c.fillRect(0, y0 - f, W, L);
      };
      band(0, Y1, 0.9 * VG.ramp(lt, G[0], G[0] + 0.45));
      band(Y1, Y2 + 60, 0.9 * VG.ramp(lt, G[1], G[1] + 0.45));
      band(Y2 + 60, H, 0.9 * VG.ramp(lt, G[2], G[2] + 0.45));
      // keluar dari gelap: tampak samar sejak awal, penuh menjelang "tiga"
      const muncul = 0.25 + 0.75 * VG.ramp(lt, t3 - 2.2, t3 + 0.3);
      c.fillStyle = `rgba(3,3,8,${1 - muncul})`; c.fillRect(0, 0, W, H);
      VG.vignette(c, 0.55);
    },
  };
})();
