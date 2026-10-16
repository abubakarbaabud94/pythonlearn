# Kisah Nabi — template motion graphic (Remotion)

Template video 9:16 (1080×1920, 30 fps) untuk seri kisah nabi di TikTok/Reels.

| Komposisi | Episode | Durasi | Render |
|---|---|---|---|
| `Yunus` | Nabi Yunus · Part 1 — doa dari perut ikan | 82 dtk | `npm run render` |
| `Yunus2` | Nabi Yunus · Part 2 — kaum yang azabnya diangkat | 91 dtk | `npm run render-2` |
| `Zakariya` | #22 Nabi Zakariya — doa di usia senja | 110 dtk | `npm run render-zakariya` |

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
  components/mihrab.tsx ← interior mihrab: dinding batu, ceruk, pelita, jendela, buah, sajadah
  components/overlay.tsx← kartu ayat, label sumber, judul hook, penutup
  components/Subtitle.tsx ← subtitle gaya TikTok (kata aktif menyala emas)
  lib/camera.tsx        ← kamera & parallax 2.5D (Layer depth 0–1.3)
  Episode.tsx           ← menyusun scene + transisi + audio
scripts/
  extract-ayat.mjs      ← ambil ayat dari sumber terverifikasi
  buat-ambience.sh      ← suara laut sintetis (placeholder)
  stills.mjs            ← render beberapa frame PNG untuk cek cepat
  sheet.mjs             ← contact sheet berlabel waktu di lebar HP (npm run sheet)
  buat-sfx.py           ← pustaka SFX sintetis tanpa nada (npm run sfx)
```

## Membuat episode baru

1. Tambahkan rujukan ayat di `REFS` pada `scripts/extract-ayat.mjs`, lalu `npm run ayat`.
2. Salin `src/episodes/yunus.ts` → mis. `src/episodes/nuh.ts`, ubah scene & narasi.
3. Kalau perlu latar baru, tambahkan di `src/scenes/Latar.tsx` dan tipe `Latar` di `src/types.ts`.
4. Daftarkan di `EPISODES` pada `src/Root.tsx`.

## Voiceover

Episode Yunus memakai voiceover ElevenLabs (suara **Arthur – Wise Indonesian Narrator**, model `eleven_v4`).
Naskah ditulis dengan penanda `[long pause]` di antara scene; penanda itu dipakai untuk memecah kata per scene.

```bash
npm run sinkron-vo     # Part 1: voiceover/yunus-raw.mp3 -> public/audio/vo-yunus.mp3 + src/data/vo-yunus.json
npm run sinkron-vo-2   # Part 2: voiceover/yunus-2-raw.mp3 -> public/audio/vo-yunus-2.mp3 + src/data/vo-yunus-2.json
npm run sinkron-vo-zakariya
```

Skrip `scripts/sinkron-vo.mjs`:
1. memecah timestamp per kata (ElevenLabs Scribe) menjadi scene di setiap `[long pause]`,
2. memadatkan jeda: maks 0,5 dtk di dalam scene, 0,8 dtk di scene doa (`--lambat 5`), 0,9 dtk antar-scene,
3. mempercepat tempo 1,08x tanpa mengubah nada, normalisasi loudness,
4. menulis durasi scene + timing kata. Durasi scene di video otomatis mengikuti file ini.

Field `cue` pada scene menyinkronkan animasi dengan kata yang diucapkan
(mis. `'^gelapnya'` untuk tiga kegelapan, `'.'` untuk kartu ayat yang terjemahannya menyala per kata).
Kartu ayat yang terjemahannya memuat kutipan `"..."` hanya menyalakan kutipan itu (Part 1, QS 21:87);
tanpa kutipan, seluruh terjemahan menyala mengikuti narasi (Part 2, QS 10:98). Untuk itu narator
harus membaca terjemahan kata per kata sama persis (tanda kurung boleh diabaikan).

Rekaman sendiri juga bisa: transkripsi dengan Whisper/Scribe, ubah ke format `{ words: [{ text, type: 'word', start, end }] }`,
dan sisipkan token `[long pause]` di batas scene.

Catatan render: hindari `box-shadow` berukuran ratusan piksel; Chromium memotongnya menjadi kotak.
Pakai komponen `Glow` (radial-gradient) di `components/alam.tsx`.

## Sound design (SFX)

`npm run sfx` membuat pustaka SFX di `public/sfx/` dengan Python standar (tanpa sampel, tanpa lisensi, hasil identik).
**Sengaja tanpa bunyi bernada** (chime, pad, melodi): hanya desir, hantaman rendah, guntur, angin, desir udara, ketukan,
dan bunyi "telan" bawah air, agar tidak terdengar sebagai musik.

Penempatannya otomatis dari struktur episode (`JalurSfx` di `src/Episode.tsx`):

| Kejadian | SFX |
|---|---|
| Pergantian scene | `desir` (puncaknya tepat di awal scene), `desir-lembut` sebelum kartu ayat & penutup |
| Judul hook (frame 0), kartu ayat, penutup | `hantam` |
| Label sumber muncul | `tik` |
| Kilat (`KILAT` di `Latar.tsx`) | `gemuruh` di frame kilat yang sama |
| Scene badai / kota di ambang azab | `angin` (loop sepanjang scene) |
| Ikan menelan | `telan` |
| Tiga kegelapan | `hantam` lembut di tiap kata "gelapnya" |
| `momen` dengan `sfx` | SFX di kata pemicunya |

## Momen: event di tengah scene yang dipicu kata

Aturan "ada hal baru setiap 2–4 detik": scene panjang diberi `momen`, yaitu kata di voiceover yang memicu event visual
(dibaca latar lewat `useMomen`) dan SFX opsional:

```ts
momen: [
  { nama: 'buah', kata: '^makanan', sfx: 'udara', gain: 0.35 },   // buah muncul di mihrab
  { nama: 'pendar', kata: '^Allah', sfx: 'udara', gain: 0.5 },    // buah berpendar + berkas cahaya
],
```

Nama yang dikenali latar: `buah`, `pendar`, `nyala`, `kabar` (mihrab), `inti`, `ledak` (kosmos), `keluar` (kota-taubat),
`meteor` (langit-malam), `tiga` (overlay tiga kegelapan).

## Review: contact sheet

```bash
npm run sheet -- Zakariya 2.5   # satu frame tiap 2,5 dtk, dirender di lebar HP (360 px) -> out/sheets/Zakariya-NN.png
```

Periksa tiap lembar sebelum render final: subtitle tidak menabrak objek, teks di zona aman, tidak ada layar diam
lebih dari ±4 detik, frame 0 sudah berisi judul (thumbnail).

## Placeholder yang masih perlu diganti sebelum upload

| Placeholder | Ganti dengan |
|---|---|
| Ilustrasi prosedural (SVG) | Ilustrasi berlapis PNG (langit / tengah / depan) di `public/`, tetap dibungkus `<Layer depth>` agar parallax bekerja |
| Ambience laut & SFX sintetis | Boleh dipakai; ganti dengan rekaman asli bila ingin lebih kaya |
| — | Naskah ditinjau ustadz sebelum publikasi |
