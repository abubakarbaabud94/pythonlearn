"""Pustaka SFX sintetis untuk seri kisah nabi.

Python standar saja: tanpa sampel, tanpa lisensi, hasil identik setiap kali dijalankan.
Sengaja TIDAK ada bunyi bernada (chime, pad, melodi): hanya tekstur dan sound design
(desir, hantaman rendah, gemuruh, angin) agar tidak terdengar sebagai musik.

Pemakaian: python3 scripts/buat-sfx.py   -> public/sfx/*.wav
"""

import math
import os
import random
import struct
import wave

SR = 48000
KELUAR = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")


def noise(n, seed):
    rnd = random.Random(seed)
    return [rnd.uniform(-1, 1) for _ in range(n)]


def brown(n, seed):
    rnd = random.Random(seed)
    out, v = [], 0.0
    for _ in range(n):
        v = (v + rnd.uniform(-1, 1) * 0.02) * 0.998
        out.append(v)
    peak = max(abs(x) for x in out) or 1
    return [x / peak for x in out]


def lowpass(x, fc):
    a = math.exp(-2 * math.pi * fc / SR)
    y, out = 0.0, []
    for s in x:
        y = (1 - a) * s + a * y
        out.append(y)
    return out


def highpass(x, fc):
    lp = lowpass(x, fc)
    return [a - b for a, b in zip(x, lp)]


def bandpass_sweep(x, f_of_t, q=1.2):
    """Bandpass biquad (RBJ) dengan frekuensi tengah yang berubah terhadap waktu."""
    out = []
    x1 = x2 = y1 = y2 = 0.0
    b0 = b2 = a1 = a2 = 0.0
    for i, s in enumerate(x):
        if i % 32 == 0:
            f = max(40.0, min(SR * 0.45, f_of_t(i / SR)))
            w = 2 * math.pi * f / SR
            alpha = math.sin(w) / (2 * q)
            a0 = 1 + alpha
            b0, b2 = alpha / a0, -alpha / a0
            a1, a2 = -2 * math.cos(w) / a0, (1 - alpha) / a0
        y = b0 * s + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, s, y1, y
        out.append(y)
    return out


def env(n, attack, release, curve=2.0):
    """Amplop naik (attack detik) lalu turun (release detik)."""
    out = []
    a, r = int(attack * SR), int(release * SR)
    for i in range(n):
        if i < a:
            v = (i / max(1, a)) ** curve
        else:
            v = max(0.0, 1 - (i - a) / max(1, r)) ** curve
        out.append(v)
    return out


def mul(x, e):
    return [a * b for a, b in zip(x, e)]


def mix(*tracks):
    n = max(len(t) for t in tracks)
    return [sum(t[i] for t in tracks if i < len(t)) for i in range(n)]


def normalize(x, peak_db=-3.0):
    peak = max(abs(s) for s in x) or 1
    g = 10 ** (peak_db / 20) / peak
    # fade 5 ms di ujung agar tidak ada klik
    f = int(0.005 * SR)
    out = [s * g for s in x]
    for i in range(min(f, len(out))):
        out[i] *= i / f
        out[-1 - i] *= i / f
    return out


def tulis(nama, x):
    os.makedirs(KELUAR, exist_ok=True)
    path = os.path.join(KELUAR, f"{nama}.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in x))
    print(f"  {nama}.wav  {len(x) / SR:.2f} dtk")


def sine_sweep(dur, f0, f1, decay):
    n = int(dur * SR)
    out, ph = [], 0.0
    for i in range(n):
        t = i / SR
        f = f1 + (f0 - f1) * math.exp(-t / 0.12)
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t / decay))
    return out


def desir(dur=0.9, f_awal=400, f_puncak=2600, seed=1):
    """Desir transisi: noise bandpass yang menyapu naik lalu turun."""
    n = int(dur * SR)
    puncak = dur * 0.6

    def f(t):
        if t < puncak:
            return f_awal + (f_puncak - f_awal) * (t / puncak) ** 1.5
        return f_puncak - (f_puncak - f_awal * 1.5) * ((t - puncak) / (dur - puncak))

    x = bandpass_sweep(noise(n, seed), f, q=0.9)
    return normalize(mul(x, env(n, puncak, dur - puncak, 1.6)))


def hantam(dur=2.6, seed=2):
    """Hantaman rendah sinematik: sub yang turun + transien + ekor gemuruh."""
    n = int(dur * SR)
    sub = sine_sweep(dur, 95, 36, 0.9)
    klik = mul(lowpass(noise(int(0.06 * SR), seed), 1800), env(int(0.06 * SR), 0.001, 0.059, 1.0))
    ekor = mul(lowpass(brown(n, seed + 1), 180), env(n, 0.02, dur - 0.02, 2.4))
    return normalize(mix([s * 0.9 for s in sub], [s * 0.5 for s in klik], [s * 0.6 for s in ekor]))


def gemuruh(dur=3.6, seed=3):
    """Guntur: retakan noise di awal lalu gemuruh rendah yang bergulung."""
    n = int(dur * SR)
    rnd = random.Random(seed)
    retak = [0.0] * n
    for _ in range(14):
        t0 = int(rnd.uniform(0, 0.5) * SR)
        ln = int(rnd.uniform(0.02, 0.09) * SR)
        burst = mul(bandpass_sweep(noise(ln, rnd.random()), lambda t: 1600, q=0.6), env(ln, 0.002, ln / SR, 1.2))
        for i, s in enumerate(burst):
            if t0 + i < n:
                retak[t0 + i] += s * rnd.uniform(0.4, 1)
    gulung = lowpass(brown(n, seed + 7), 260)
    mod = [0.6 + 0.4 * math.sin(2 * math.pi * 1.3 * i / SR + 1) * math.sin(2 * math.pi * 0.4 * i / SR) for i in range(n)]
    gulung = mul(mul(gulung, mod), env(n, 0.08, dur - 0.08, 1.8))
    return normalize(mix([s * 0.35 for s in retak], gulung))


def angin(dur=8.0, seed=4):
    """Angin/badai: noise bandpass yang mengalun pelan (latar scene)."""
    n = int(dur * SR)
    x = bandpass_sweep(noise(n, seed), lambda t: 520 + 300 * math.sin(t * 0.9) + 140 * math.sin(t * 2.3 + 1), q=0.7)
    amp = [0.55 + 0.45 * math.sin(2 * math.pi * i / SR * 0.21) ** 2 for i in range(n)]
    return normalize(mul(mul(x, amp), env(n, 1.2, dur - 1.2, 0.6)))


def udara(dur=2.6, seed=5):
    """Desir udara tinggi yang mengembang: penanda cahaya/kabar, tanpa nada."""
    n = int(dur * SR)
    x = highpass(noise(n, seed), 3500)
    x = bandpass_sweep(x, lambda t: 5200 + 1800 * t / dur, q=0.5)
    return normalize(mul(x, env(n, dur * 0.55, dur * 0.45, 1.8)), -6)


def tik(seed=6):
    """Ketukan kecil untuk label sumber yang muncul."""
    n = int(0.09 * SR)
    x = bandpass_sweep(noise(n, seed), lambda t: 2600, q=2.5)
    return normalize(mul(x, env(n, 0.001, 0.089, 3.0)), -6)


def telan(dur=2.0, seed=7):
    """Bunyi 'ditelan' di bawah air: whoomp rendah + gelembung noise."""
    n = int(dur * SR)
    whoomp = sine_sweep(dur, 170, 45, 0.6)
    air = mul(lowpass(brown(n, seed), 400), env(n, 0.15, dur - 0.15, 1.6))
    rnd = random.Random(seed)
    gel = [0.0] * n
    for _ in range(22):
        t0 = int(rnd.uniform(0.1, dur * 0.8) * SR)
        ln = int(rnd.uniform(0.015, 0.04) * SR)
        f = rnd.uniform(500, 1400)
        b = mul(bandpass_sweep(noise(ln, rnd.random()), lambda t, f=f: f * (1 + t * 8), q=6), env(ln, 0.003, ln / SR, 1.5))
        for i, s in enumerate(b):
            if t0 + i < n:
                gel[t0 + i] += s * rnd.uniform(0.3, 0.8)
    return normalize(mix([s * 0.8 for s in whoomp], [s * 0.6 for s in air], [s * 0.5 for s in gel]))


if __name__ == "__main__":
    print("Membuat SFX ->", os.path.normpath(KELUAR))
    tulis("desir", desir())
    tulis("desir-lembut", desir(1.6, 260, 1200, seed=11))
    tulis("hantam", hantam())
    tulis("gemuruh", gemuruh())
    tulis("angin", angin())
    tulis("udara", udara())
    tulis("tik", tik())
    tulis("telan", telan())
