// Pustaka bersama gaya Van Gogh (pasca-impresionisme) untuk latar episode kisah nabi.
// Resep tiap scene: gambar ALAS datar (gradien + pita warna tebal) -> sapu ulang dengan P.strokes mengikuti medan arah
// (langit mengikuti pusaran, laut mengikuti punggung ombak) -> objek di lapisan sendiri, disapu kuas lebih kecil.
// Tanpa figur manusia. Waktu event (kata di voiceover, kilat, telan) dibaca dari window.VG_T yang ditulis scripts/vangogh.mjs.
window.VG = (() => {
  const W = 1080, H = 1920, P = PAINT, TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  // 0 -> 1 antara detik a dan b (dihaluskan)
  const ramp = (t, a, b) => smooth((t - a) / (b - a));
  // kilatan: naik cepat lalu meluruh selama `len` detik sejak `at`
  const flash = (t, at, len = 0.35) => (t < at ? 0 : t < at + 0.04 ? (t - at) / 0.04 : Math.max(0, 1 - (t - at - 0.04) / len));
  const T = (id) => (window.VG_T && window.VG_T[id]) || { dur: 6, ev: {} };
  const ev = (id, nama, k = 0, cadangan = null) => { const a = T(id).ev[nama]; return a && a.length > k ? a[k] : cadangan; };

  // ---------- alas ----------
  const vgrad = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  const rgrad = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  const fillV = (g, y0, y1, stops) => { g.fillStyle = vgrad(g, y0, y1, stops); g.fillRect(0, y0, W, y1 - y0); };
  const glow = (g, x, y, r, stops) => { g.fillStyle = rgrad(g, x, y, 0, r, stops); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };

  // Pusaran: spiral tebal berlapis. list = [[x, y, r, arah(+1/-1)], ...]
  function swirls(g, list, t, { cols = ['#5d86d8', '#9cc0f0'], width = 22, speed = 0.55, rings = 4, squash = 0.82 } = {}) {
    g.lineCap = 'round';
    list.forEach(([x, y, r, dir], k) => {
      for (let ring = 0; ring < rings; ring++) {
        g.strokeStyle = cols[ring % cols.length]; g.lineWidth = Math.max(4, width - ring * 4); g.beginPath();
        for (let a = 0; a < Math.PI * 3.2; a += 0.12) {
          const rr = r * (0.2 + a / (Math.PI * 3.2)) * (1 - ring * 0.1), aa = (a + t * speed * (1 + k * 0.15)) * dir;
          const px = x + Math.cos(aa) * rr, py = y + Math.sin(aa) * rr * squash; a ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.stroke();
      }
    });
  }
  // Pita angin melintang (khas Starry Night)
  function ribbon(g, t, { y, amp = 70, col = '#a9c6ee', width = 34, speed = 0.6, freq = 0.006 }) {
    g.strokeStyle = col; g.lineWidth = width; g.lineCap = 'round'; g.beginPath();
    for (let x = -40; x <= W + 40; x += 20) { const yy = y + Math.sin(x * freq + t * speed) * amp + Math.sin(x * 0.017) * amp * 0.25; x > -40 ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke();
  }
  // Medan arah langit: tangen pusaran terdekat; konsentris di sekitar sumber cahaya; sisanya angin bergelombang.
  const skyAngle = (list, lights = [], { wind = 0.25, spin = 0 } = {}) => (x, y, t) => {
    for (const [lx, ly, lr] of lights) { if (Math.hypot(x - lx, y - ly) < lr) return Math.atan2(y - ly, x - lx) + Math.PI / 2; }
    let best = null, bd = 1e9; list.forEach(s => { const d = Math.hypot(x - s[0], y - s[1]) / s[2]; if (d < bd) { bd = d; best = s; } });
    if (best && bd < 1.5) return Math.atan2(y - best[1], x - best[0]) + Math.PI / 2 * best[3] + t * spin;
    return wind * Math.sin(x * 0.006 + t * 0.6) + 0.15 * P.noise(x * 0.005, y * 0.005 + t * 0.3);
  };
  // Ombak: k = indeks pita (0 dekat cakrawala)
  const waveFn = (HZ, { amp = 1, speed = 1, gap = 120 } = {}) => (x, t, k) =>
    HZ + 70 + k * gap + (Math.sin(x * 0.009 + t * 0.9 * speed + k * 1.7) * (22 + k * 6) + Math.sin(x * 0.021 - t * 1.3 * speed + k) * 9) * amp;
  function sea(g, t, wave, { HZ, stops, bands = 6, cols = ['#5a9ad0', '#3f7ab8'], foam = '#bfe0ee', crest = 0.55, width = 16 }) {
    fillV(g, HZ, H, stops);
    g.lineCap = 'round';
    for (let k = 0; k < bands; k++) {
      g.strokeStyle = cols[k % cols.length]; g.lineWidth = width - k; g.beginPath();
      for (let x = -20; x <= W + 20; x += 14) { const y = wave(x, t, k); x > -20 ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    if (foam) for (let k = 1; k < bands; k += 2) {
      g.strokeStyle = foam; g.lineWidth = 7; g.beginPath();
      for (let x = -20; x <= W + 20; x += 14) { const y = wave(x, t, k) - 8; if (Math.sin(x * 0.009 + t * 0.9 + k * 1.7) > crest) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
  }
  const seaAngle = (wave, k = 2) => (x, y, t) => Math.atan((wave(x + 6, t, k) - wave(x - 6, t, k)) / 12) + 0.35 * P.noise(x * 0.006 + t * 0.4, y * 0.01);

  // ---------- kuas ----------
  // Sapuan utama di atas alas (boil 0: posisi sapuan tetap, warna mengikuti alas yang bergerak -> tidak berkedip)
  const paint = (c, src, o) => P.strokes(c, src, { cell: 12, len: 44, width: 9, seed: 11, boil: 0, outline: 0.85, outlineCol: [16, 26, 74], outlineMix: 0.42, ...o });
  // Objek di lapisan sendiri: draw(g) menggambar bentuk datar, lalu disapu kuas kecil hanya di dalam bentuknya.
  function obj(c, key, draw, o = {}, alpha = 1) {
    const L = P.scratch(key), g = L.getContext('2d'); g.clearRect(0, 0, W, H); draw(g);
    g.save(); g.globalCompositeOperation = 'source-atop';
    P.strokes(g, L, { cell: 7, len: 20, width: 6, seed: 5, boil: 0, outline: 0.6, outlineCol: [10, 12, 30], outlineMix: 0.5, alphaMask: true, ...o });
    g.restore();
    c.save(); c.globalAlpha = alpha; c.drawImage(L, 0, 0); c.restore();
    return L;
  }

  // ---------- cahaya ----------
  // Cincin halo berdenyut keluar (impasto putus-putus)
  function halo(c, x, y, t, { r0 = 70, r1 = 220, n = 3, rgb = '255,236,140', a = 0.3, w = 20, speed = 0.6 } = {}) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let k = 0; k < n; k++) {
      const ph = (t * speed + k / n) % 1, r = r0 + ph * (r1 - r0);
      c.strokeStyle = `rgba(${rgb},${a * (1 - ph)})`; c.lineWidth = w; c.setLineDash([26, 16]); c.lineDashOffset = -t * 50;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
    }
    c.setLineDash([]); c.restore();
  }
  // Matahari/bintang besar: cakram + cincin konsentris tetap (gaya "The Sower")
  function sun(c, x, y, r, t, { core = '#fff3a8', mid = '#f6d84a', ring = '#f0b83a', rings = 4 } = {}) {
    c.save(); c.lineCap = 'round';
    for (let k = rings; k >= 1; k--) {
      c.strokeStyle = k % 2 ? ring : mid; c.lineWidth = 16; c.setLineDash([30, 12]); c.lineDashOffset = (k % 2 ? 1 : -1) * t * 30;
      c.beginPath(); c.arc(x, y, r + k * 34, 0, TAU); c.stroke();
    }
    c.setLineDash([]);
    c.fillStyle = mid; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = core; c.beginPath(); c.arc(x - r * 0.12, y - r * 0.1, r * 0.72, 0, TAU); c.fill();
    c.restore();
  }
  function moon(c, x, y, r = 58) {
    c.fillStyle = '#f6d84a'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = '#e6b83a'; c.beginPath(); c.arc(x - r * 0.38, y - r * 0.2, r * 0.86, 0, TAU); c.fill();
    c.fillStyle = '#f6d84a'; c.beginPath(); c.arc(x + r * 0.1, y + r * 0.07, r * 0.76, 0, TAU); c.fill();
  }
  function stars(c, list, t, a = 1) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    list.forEach(([x, y, r], k) => {
      const tw = 0.75 + 0.35 * Math.sin(t * 4 + k * 1.7);
      c.fillStyle = 'rgba(251,238,160,.5)'; c.beginPath(); c.arc(x, y, r * 2.1 * tw, 0, TAU); c.fill();
      c.fillStyle = '#f6d84a'; c.beginPath(); c.arc(x, y, r * 0.8 * tw, 0, TAU); c.fill();
    });
    c.restore();
  }
  // Berkas cahaya tebal dari atas (sapuan kuning sejajar)
  function rays(c, t, { x0 = 540, y0 = -80, n = 7, spread = 0.9, len = 1500, a = 0.5, rgb = '255,226,120', w = 70 } = {}) {
    if (a <= 0) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let k = 0; k < n; k++) {
      const ang = Math.PI / 2 + (k / (n - 1) - 0.5) * spread + Math.sin(t * 0.5 + k) * 0.02;
      const g = c.createLinearGradient(x0, y0, x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len);
      const al = a * (0.55 + 0.45 * Math.sin(t * 1.3 + k * 2.1));
      g.addColorStop(0, `rgba(${rgb},${al})`); g.addColorStop(1, `rgba(${rgb},0)`);
      c.strokeStyle = g; c.lineWidth = w * (0.7 + 0.3 * Math.sin(k * 3.3));
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len); c.stroke();
    }
    c.restore();
  }
  // Petir: garis zig-zag bercabang; titik dihitung sekali dari seed, lalu digambar dua kali (pendar + inti)
  function bolt(c, x, y0, y1, seed, a) {
    if (a <= 0) return;
    const r = U.rng(seed), paths = [];
    const walk = (x, y, yEnd, w) => {
      const pts = [[x, y]];
      while (y < yEnd) { x += (r() - 0.5) * 90; y += 40 + r() * 50; pts.push([x, y]); if (w > 4 && r() < 0.18) walk(x, y, y + 200 + r() * 200, w * 0.45); }
      paths.push({ pts, w });
    };
    walk(x, y0, y1, 9);
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [col, k] of [[`rgba(170,195,255,${0.3 * a})`, 4], [`rgba(255,255,240,${a})`, 1]]) {
      c.strokeStyle = col;
      for (const { pts, w } of paths) { c.lineWidth = w * k; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
    }
    c.restore();
  }
  // Hujan: sapuan miring pendek yang jatuh ke kiri bawah
  function rain(c, t, { n = 260, len = 60, a = 0.35, seed = 4, slant = 0.45 } = {}) {
    const r = U.rng(seed); c.save(); c.strokeStyle = `rgba(200,215,240,${a})`; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < n; i++) {
      const sp = 1500 + r() * 900, x0 = r() * (W + 600), y0 = r() * (H + 200);
      const d = t * sp, y = ((y0 + d) % (H + 200)) - 100, x = ((((x0 - d * slant) % (W + 600)) + W + 600) % (W + 600)) - 300;
      c.moveTo(x, y); c.lineTo(x - len * slant, y + len);
    }
    c.stroke(); c.restore();
  }
  // Burung gagak gaya "Wheatfield with Crows": goresan V
  function crows(c, list, t) {
    c.save(); c.strokeStyle = '#120c1e'; c.lineCap = 'round'; c.lineJoin = 'round';
    list.forEach(([x, y, s, ph]) => {
      const f = Math.sin(t * 7 + ph) * 0.5; c.lineWidth = 5 * s; c.beginPath();
      c.moveTo(x - 26 * s, y - 10 * s * (1 + f)); c.quadraticCurveTo(x - 10 * s, y - 4 * s, x, y + 4 * s);
      c.quadraticCurveTo(x + 10 * s, y - 4 * s, x + 26 * s, y - 10 * s * (1 + f)); c.stroke();
    });
    c.restore();
  }
  // Pita gelap untuk keterbacaan teks overlay (scrim): alpha a pada [y0, y1], memudar ke tepi
  function scrim(c, y0, y1, a, rgb = '5,8,13') {
    const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.3, `rgba(${rgb},${a})`); g.addColorStop(0.7, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0);
  }
  function vignette(c, a = 0.5, rgb = '4,6,14') {
    const g = c.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.72);
    g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  // Ikan besar (al-hut): siluet dengan punggung terang; (x, y) = pusat badan, s = skala, flip = menghadap kanan
  function fish(g, x, y, s, t, { flip = false, body = '#0a1830', back = '#2f6a8e', eye = '#9fd0e0', mouth = 0 } = {}) {
    const tail = Math.sin(t * 2.2) * 0.18;
    g.save(); g.translate(x, y); g.scale(flip ? -s : s, s);
    g.fillStyle = body;
    g.beginPath(); g.moveTo(-430, 20 - mouth * 60); g.bezierCurveTo(-400, -110, -150, -170, 80, -150); g.bezierCurveTo(250, -135, 340, -80, 390, -20);
    g.lineTo(390, 20); g.bezierCurveTo(330, 90, 160, 140, -60, 140); g.bezierCurveTo(-280, 140, -410, 100 + mouth * 40, -430, 40 + mouth * 60); g.closePath(); g.fill();
    g.save(); g.translate(385, 0); g.rotate(tail); g.beginPath(); g.moveTo(0, -18); g.lineTo(150, -130); g.quadraticCurveTo(110, 0, 150, 130); g.lineTo(0, 18); g.closePath(); g.fill(); g.restore();
    g.fillStyle = back; g.beginPath(); g.moveTo(-380, -30); g.bezierCurveTo(-300, -120, -60, -150, 120, -128); g.bezierCurveTo(-60, -110, -260, -70, -380, -30); g.fill();
    g.fillStyle = eye; g.beginPath(); g.arc(-330, -40, 11, 0, TAU); g.fill();
    g.fillStyle = '#050c1a'; g.beginPath(); g.moveTo(-20, 120); g.quadraticCurveTo(40, 230, 150, 236); g.quadraticCurveTo(90, 190, 70, 118); g.fill();
    g.restore();
  }
  // Kota Niniwe: rumah bata beratap datar, menara bertingkat, tembok kota; siluet hangat
  function city(g, t, { y = 1240, x0 = 0, col = '#2a1630', lit = '#ffcf5a', windows = true, s = 1 } = {}) {
    const r = U.rng(9);
    g.save(); g.translate(x0, y); g.scale(s, s);
    g.fillStyle = col;
    g.fillRect(-40, -70, 1180, 90);                                   // tembok kota
    for (let x = -40; x < 1140; x += 36) g.fillRect(x, -92, 20, 24);  // gerigi tembok
    const blocks = [[40, 150, 120], [170, 110, 90], [270, 190, 140], [420, 130, 100], [530, 90, 80], [620, 160, 120], [760, 120, 110], [880, 200, 130]];
    blocks.forEach(([bx, bh, bw]) => g.fillRect(bx, -70 - bh, bw, bh));
    // menara bertingkat (ziggurat)
    [[300, 0], [330, 70], [360, 130], [385, 180]].forEach(([w, dy], k) => g.fillRect(650 - w / 2 + 100, -260 - dy, w - k * 60, 70));
    if (windows) {
      g.fillStyle = lit;
      blocks.forEach(([bx, bh, bw]) => { for (let k = 0; k < 3; k++) { if (r() < 0.55) g.fillRect(bx + 12 + r() * (bw - 34), -70 - bh + 20 + r() * (bh - 50), 12, 18); } });
    }
    g.restore();
  }
  // Pohon kurma seperti nyala api (lengkung daun ke atas, gaya cemara Van Gogh)
  function palm(g, x, y, h, t, col = '#1d2a18') {
    g.save(); g.strokeStyle = col; g.lineCap = 'round';
    g.lineWidth = 14; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 18, y - h * 0.5, x + 6, y - h); g.stroke();
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k / 6 - 0.5) * 2.6 + Math.sin(t * 1.2 + k) * 0.06, L = h * 0.42;
      g.lineWidth = 12 - Math.abs(k - 3) * 1.5; g.beginPath(); g.moveTo(x + 6, y - h);
      g.quadraticCurveTo(x + 6 + Math.cos(a) * L * 0.6, y - h + Math.sin(a) * L * 0.6 - 30, x + 6 + Math.cos(a) * L, y - h + Math.sin(a) * L + 40);
      g.stroke();
    }
    g.restore();
  }

  return { W, H, P, TAU, clamp, lerp, smooth, ramp, flash, T, ev, vgrad, rgrad, fillV, glow, swirls, ribbon, skyAngle, waveFn, sea, seaAngle, paint, obj, halo, sun, moon, stars, rays, bolt, rain, crows, scrim, vignette, fish, city, palm };
})();
