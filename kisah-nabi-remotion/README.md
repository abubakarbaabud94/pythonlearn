# Kisah Nabi — template motion graphic (Remotion)

Template video 9:16 (1080×1920, 30 fps) untuk seri kisah nabi di TikTok/Reels.
Episode contoh: **Nabi Yunus** (78 detik).

## Prinsip konten (tidak boleh dilanggar)

1. **Para nabi tidak divisualisasikan.** Kisah diceritakan lewat lingkungan, objek, cahaya, dan teks.
2. **Teks ayat tidak pernah diketik manual.** Selalu lewat `npm run ayat` (sumber: teks Uthmani QuranEnc + terjemahan Kemenag, dari paket `quran-json`).
3. **Setiap scene punya `sumber`.** Ayat → `tipe: 'quran'`. Penjelasan ulama → `tipe: 'tafsir'` (label & warna berbeda).
4. Naskah ditinjau ustadz/orang yang kompeten sebelum dirender final.

## Menjalankan

```bash
npm install
npm run studio        # preview interaktif di browser
npm run render        # hasil: out/yunus.mp4
```

Butuh Node.js 18+. Remotion akan mengunduh Chromium sendiri saat render pertama.
Kalau ingin memakai Chromium yang sudah ada: `REMOTION_BROWSER=/path/ke/chrome npm run render`.

## Struktur

```
src/
  episodes/yunus.ts     ← DATA episode: scene, narasi, sumber, kamera
  data/ayat.json        ← dihasilkan oleh `npm run ayat` (jangan edit manual)
  scenes/Latar.tsx      ← latar per scene (laut, badai, kota, pantai, ...)
  components/alam.tsx   ← elemen prosedural: gelombang, kapal, ikan, cahaya, partikel
  components/overlay.tsx← kartu ayat, label sumber, judul hook, penutup
  components/Subtitle.tsx ← subtitle gaya TikTok (kata aktif menyala emas)
  lib/camera.tsx        ← kamera & parallax 2.5D (Layer depth 0–1.3)
  Episode.tsx           ← menyusun scene + transisi + audio
scripts/
  extract-ayat.mjs      ← ambil ayat dari sumber terverifikasi
  buat-ambience.sh      ← suara laut sintetis (placeholder)
  stills.mjs            ← render beberapa frame PNG untuk cek cepat
```

## Membuat episode baru

1. Tambahkan rujukan ayat di `REFS` pada `scripts/extract-ayat.mjs`, lalu `npm run ayat`.
2. Salin `src/episodes/yunus.ts` → mis. `src/episodes/nuh.ts`, ubah scene & narasi.
3. Kalau perlu latar baru, tambahkan di `src/scenes/Latar.tsx` dan tipe `Latar` di `src/types.ts`.
4. Daftarkan di `EPISODES` pada `src/Root.tsx`.

## Mengganti placeholder sebelum upload

| Placeholder | Ganti dengan |
|---|---|
| Tanpa voiceover | Rekam narasi → `public/audio/vo-yunus.mp3`, isi `audio.voiceover` di file episode |
| Timing subtitle diperkirakan rata | Transkripsi voiceover dengan Whisper (`@remotion/install-whisper-cpp`) dan pakai hasilnya sebagai `captions` |
| Ilustrasi prosedural (SVG) | Ilustrasi berlapis PNG (langit / tengah / depan) di `public/`, tetap dibungkus `<Layer depth>` agar parallax bekerja |
| Ambience sintetis | Sound design asli (ombak, angin, gemuruh) berlisensi jelas |
