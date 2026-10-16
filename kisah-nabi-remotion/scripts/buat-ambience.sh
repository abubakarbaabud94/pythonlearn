#!/usr/bin/env bash
# Suara laut sintetis (brown noise + gelombang pelan) sebagai placeholder ambience.
# Bebas hak cipta karena dibuat dari nol. Ganti dengan sound design asli saat produksi.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/audio
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=brown:amplitude=0.6:duration=90:seed=7" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.15:duration=90:seed=3" \
  -filter_complex "[0]lowpass=f=420,volume='0.55+0.45*sin(2*PI*t/7)':eval=frame[a];[1]highpass=f=1800,lowpass=f=5000,volume='0.3+0.3*sin(2*PI*t/7+1.2)':eval=frame[b];[a][b]amix=inputs=2:normalize=0,afade=t=in:d=2,afade=t=out:st=86:d=4" \
  -ac 2 -ar 44100 -b:a 160k public/audio/ambience-laut.mp3
echo "Tersimpan: public/audio/ambience-laut.mp3"
