#!/usr/bin/env python3
"""
100-frame hero sequence with cleaner transitions.

- Parking: optical-flow morph between close door/drive keyframes
- Scene changes: zoom+blur wipe (no ghosting)
- Map travel: hold + Ken Burns per keyframe, short motion-blur dissolves
- Arrival: wipe then Ken Burns settle on final photo (no multi-van morph)
"""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = Path("/Users/markopavicic/.cursor/projects/Users-markopavicic-mikimiki/assets")
KEYFRAMES = Path(__file__).resolve().parent / "keyframes"
REFS = ROOT / "public/images/hero-refs"
OUT = ROOT / "public/frames"
W, H = 1280, 720
N = 100


def find(*names: str) -> Path:
    for name in names:
        for folder in (KEYFRAMES, ASSETS, REFS):
            p = folder / name
            if p.exists():
                return p
    raise FileNotFoundError(names)


def load(path: Path) -> np.ndarray:
    img = Image.open(path).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def save_pil(bgr: np.ndarray) -> Image.Image:
    return Image.fromarray(cv2.cvtColor(np.clip(bgr, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB))


def clamp01(t: float) -> float:
    return max(0.0, min(1.0, t))


def smooth(t: float) -> float:
    t = clamp01(t)
    return t * t * t * (t * (t * 6 - 15) + 10)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ken(
    img: np.ndarray,
    t: float,
    *,
    s0: float = 1.0,
    s1: float = 1.06,
    x0: float = 0.5,
    x1: float = 0.5,
    y0: float = 0.5,
    y1: float = 0.5,
) -> np.ndarray:
    t = smooth(t)
    scale = lerp(s0, s1, t)
    nh, nw = int(H * scale), int(W * scale)
    r = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LINEAR)
    cx, cy = lerp(x0, x1, t) * nw, lerp(y0, y1, t) * nh
    x = int(np.clip(cx - W / 2, 0, max(0, nw - W)))
    y = int(np.clip(cy - H / 2, 0, max(0, nh - H)))
    return r[y : y + H, x : x + W]


def flow_morph(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    t = smooth(t)
    if t <= 0.001:
        return a.copy()
    if t >= 0.999:
        return b.copy()
    ag = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
    bg = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    sc = 0.5
    flow_ab = cv2.calcOpticalFlowFarneback(
        cv2.resize(ag, (0, 0), fx=sc, fy=sc),
        cv2.resize(bg, (0, 0), fx=sc, fy=sc),
        None, 0.5, 3, 21, 3, 5, 1.2, 0,
    )
    flow_ba = cv2.calcOpticalFlowFarneback(
        cv2.resize(bg, (0, 0), fx=sc, fy=sc),
        cv2.resize(ag, (0, 0), fx=sc, fy=sc),
        None, 0.5, 3, 21, 3, 5, 1.2, 0,
    )
    flow_ab = cv2.resize(flow_ab, (W, H)) / sc
    flow_ba = cv2.resize(flow_ba, (W, H)) / sc
    gx, gy = np.meshgrid(np.arange(W), np.arange(H))
    ax = (gx + flow_ab[..., 0] * t).astype(np.float32)
    ay = (gy + flow_ab[..., 1] * t).astype(np.float32)
    bx = (gx + flow_ba[..., 0] * (1 - t)).astype(np.float32)
    by = (gy + flow_ba[..., 1] * (1 - t)).astype(np.float32)
    wa = cv2.remap(a, ax, ay, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    wb = cv2.remap(b, bx, by, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return cv2.addWeighted(wa, 1 - t, wb, t, 0)


def zoom_wipe(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    """Match-cut: blur/zoom OUT of A, then IN to B — never overlays both vans."""
    t = smooth(t)
    h, w = a.shape[:2]
    if t < 0.5:
        u = t / 0.5
        M = cv2.getRotationMatrix2D((w / 2, h / 2), 0, 1 + 0.2 * u)
        z = cv2.warpAffine(a, M, (w, h), borderMode=cv2.BORDER_REFLECT)
        k = int(1 + 28 * u) | 1
        z = cv2.GaussianBlur(z, (k, k), 0)
        return cv2.convertScaleAbs(z, alpha=1 - 0.15 * u, beta=0)
    u = (t - 0.5) / 0.5
    M = cv2.getRotationMatrix2D((w / 2, h / 2), 0, 1.2 - 0.2 * u)
    z = cv2.warpAffine(b, M, (w, h), borderMode=cv2.BORDER_REFLECT)
    k = int(1 + 28 * (1 - u)) | 1
    z = cv2.GaussianBlur(z, (k, k), 0)
    return cv2.convertScaleAbs(z, alpha=0.85 + 0.15 * u, beta=0)


def motion_dissolve(a: np.ndarray, b: np.ndarray, t: float, dx: float = 18, dy: float = 28) -> np.ndarray:
    """Short dissolve with directional smear — better for van jumping positions on map."""
    t = smooth(t)
    if t <= 0.001:
        return a.copy()
    if t >= 0.999:
        return b.copy()
    shift_a = np.float32([[1, 0, -dx * t], [0, 1, -dy * t]])
    shift_b = np.float32([[1, 0, dx * (1 - t)], [0, 1, dy * (1 - t)]])
    aa = cv2.warpAffine(a, shift_a, (W, H), borderMode=cv2.BORDER_REFLECT)
    bb = cv2.warpAffine(b, shift_b, (W, H), borderMode=cv2.BORDER_REFLECT)
    k = int(1 + 10 * (1 - abs(0.5 - t) * 2)) | 1
    aa = cv2.GaussianBlur(aa, (k, 1), 0)
    bb = cv2.GaussianBlur(bb, (k, 1), 0)
    return cv2.addWeighted(aa, 1 - t, bb, t, 0)


def append_flow(seq: list, a: np.ndarray, b: np.ndarray, n: int) -> None:
    for i in range(1, n + 1):
        seq.append(flow_morph(a, b, i / n))


def append_hold_ken(seq: list, img: np.ndarray, n: int, **ken_kwargs) -> None:
    for i in range(n):
        seq.append(ken(img, i / max(1, n - 1), **ken_kwargs))


def append_dissolve(seq: list, a: np.ndarray, b: np.ndarray, n: int, dx=14, dy=26) -> None:
    for i in range(1, n + 1):
        seq.append(motion_dissolve(a, b, i / n, dx=dx, dy=dy))


def append_wipe(seq: list, a: np.ndarray, b: np.ndarray, n: int) -> None:
    for i in range(1, n + 1):
        seq.append(zoom_wipe(a, b, i / n))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    KEYFRAMES.mkdir(parents=True, exist_ok=True)
    for pattern in ("hero-*.jpg", "kf-*.jpg", "map-v*.jpg"):
        for src in ASSETS.glob(pattern):
            dst = KEYFRAMES / src.name
            dst.write_bytes(src.read_bytes())

    start = load(find("start.png"))
    door_half = load(find("hero-door-half.jpg"))
    door_90 = load(find("kf-door-90.jpg"))
    door_closed = load(find("hero-door-closed.jpg"))
    driving = load(find("hero-driving.jpg"))
    drive2 = load(find("kf-drive-2.jpg"))
    to_map = load(find("hero-to-map.jpg"))
    map0 = load(find("map.png"))
    map_v1 = load(find("map-v1.jpg", "kf-map-nis.jpg"))
    map_v2 = load(find("map-v2.jpg", "hero-map-mid.jpg"))
    map_v3 = load(find("map-v3.jpg", "kf-map-south.jpg"))
    map_v4 = load(find("map-v4.jpg", "hero-map-end.jpg"))
    to_coast = load(find("hero-to-coast.jpg"))
    coast_arrive = load(find("hero-coast-arrive.jpg"))
    end = load(find("end.png"))

    seq: list[np.ndarray] = []

    # --- 0–19 parking: door closes, drives off (20 frames) ---
    k0 = ken(start, 0, s0=1.0, s1=1.0, x0=0.47, x1=0.47)
    k1 = ken(door_half, 0, s0=1.01, s1=1.01, x0=0.48, x1=0.48)
    k2 = ken(door_90, 0, s0=1.02, s1=1.02, x0=0.5, x1=0.5)
    k3 = ken(door_closed, 0, s0=1.03, s1=1.03, x0=0.52, x1=0.52)
    k4 = ken(driving, 0, s0=1.05, s1=1.05, x0=0.58, x1=0.58)
    k5 = ken(drive2, 0, s0=1.08, s1=1.08, x0=0.68, x1=0.68)

    # Door close: flow only while van pose stays nearly identical
    seq.append(k0)
    append_flow(seq, k0, k1, 4)
    append_flow(seq, k1, k2, 3)
    append_flow(seq, k2, k3, 4)
    # Depart: brief match-cut, then Ken Burns on drive plates (no ghost stacks)
    append_wipe(seq, k3, k4, 3)
    append_hold_ken(seq, drive2, 4, s0=1.06, s1=1.14, x0=0.62, x1=0.82, y0=0.5, y1=0.45)
    seq.append(ken(drive2, 1, s0=1.14, s1=1.18, x0=0.82, x1=0.88, y0=0.45, y1=0.42))
    # 1+4+3+4+3+4+1 = 20
    assert len(seq) == 20, len(seq)

    # --- 20–29 wipe to map intro (10) ---
    append_wipe(seq, seq[-1], ken(to_map, 0, s0=1.0, s1=1.0), 10)
    assert len(seq) == 30, len(seq)

    # --- 30–34 land on map (5) ---
    append_flow(seq, seq[-1], ken(map0, 0, s0=1.04, s1=1.0, x0=0.5, y0=0.4), 5)
    assert len(seq) == 35, len(seq)

    # --- 35–69 map journey (35): holds + short dissolves between van positions ---
    # stages: map0/v1 near Nis, v2 Skoplje, v3 approach Solun, v4 at Solun
    stages = [
        (map_v1, dict(s0=1.0, s1=1.05, x0=0.48, x1=0.49, y0=0.36, y1=0.42), 7),
        (map_v2, dict(s0=1.02, s1=1.06, x0=0.5, x1=0.52, y0=0.45, y1=0.55), 7),
        (map_v3, dict(s0=1.03, s1=1.07, x0=0.52, x1=0.55, y0=0.55, y1=0.65), 7),
        (map_v4, dict(s0=1.04, s1=1.08, x0=0.54, x1=0.56, y0=0.62, y1=0.7), 5),
    ]
    # 7+7+7+5 holds = 26, leave 9 for dissolves between 4 stages (3 gaps) ≈ 3 each
    prev = ken(map0, 1, s0=1.0, s1=1.0, x0=0.5, y0=0.4)
    # first dissolve from map0 into v1
    first = ken(stages[0][0], 0, **{k: stages[0][1][k] for k in ("s0", "x0", "y0")})
    # rebuild ken kwargs properly
    def plate(img, kw, t=0.0):
        return ken(
            img,
            t,
            s0=kw.get("s0", 1.0),
            s1=kw.get("s1", 1.0),
            x0=kw.get("x0", 0.5),
            x1=kw.get("x1", 0.5),
            y0=kw.get("y0", 0.5),
            y1=kw.get("y1", 0.5),
        )

    append_dissolve(seq, prev, plate(stages[0][0], stages[0][1], 0), 3, dx=8, dy=18)
    for idx, (img, kw, hold) in enumerate(stages):
        append_hold_ken(seq, img, hold, **kw)
        if idx < len(stages) - 1:
            a = plate(img, kw, 1)
            b = plate(stages[idx + 1][0], stages[idx + 1][1], 0)
            append_dissolve(seq, a, b, 3, dx=10, dy=22)

    # trim/pad map block to land on 70
    while len(seq) > 70:
        seq.pop(35 + (len(seq) - 70) // 2)  # rough — better truncate end of map
    # clean approach: rebuild if over
    if len(seq) != 70:
        # force truncate/pad
        if len(seq) > 70:
            seq = seq[:70]
        while len(seq) < 70:
            seq.append(seq[-1])
    assert len(seq) == 70, len(seq)

    # --- 70–79 wipe to coast (10) ---
    append_wipe(seq, seq[-1], ken(to_coast, 0), 10)
    assert len(seq) == 80, len(seq)

    # --- 80–89 arrive (10): wipe into coast, then Ken Burns into final still ---
    append_wipe(seq, seq[-1], ken(coast_arrive, 0, s0=1.04, s1=1.0, x0=0.38, x1=0.34), 5)
    append_dissolve(
        seq,
        seq[-1],
        ken(end, 0, s0=1.03, s1=1.0, x0=0.3, x1=0.26, y0=0.46, y1=0.44),
        5,
        dx=12,
        dy=4,
    )
    assert len(seq) == 90, len(seq)

    # --- 90–99 settle on final photo (10): Ken Burns only, no morph ghosts ---
    append_hold_ken(
        seq,
        end,
        10,
        s0=1.04,
        s1=1.0,
        x0=0.28,
        x1=0.22,
        y0=0.46,
        y1=0.42,
    )
    assert len(seq) == 100, len(seq)

    total = 0
    for i, frame in enumerate(seq):
        if i >= 94:
            blur = cv2.GaussianBlur(frame, (0, 0), 0.9)
            frame = cv2.addWeighted(frame, 1.2, blur, -0.2, 0)
        path = OUT / f"frame-{i:03d}.webp"
        save_pil(frame).save(path, "WEBP", quality=85, method=4)
        total += path.stat().st_size
        if i % 10 == 0 or i == 99:
            print(f"wrote frame-{i:03d}.webp")

    save_pil(seq[0]).save(OUT / "poster.webp", "WEBP", quality=85)
    save_pil(seq[-1]).save(OUT / "poster-end.webp", "WEBP", quality=85)
    print(f"\nGotovo: {N} frejmova")
    print(f"Ukupna veličina sekvence: {total / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
