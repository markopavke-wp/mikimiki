#!/usr/bin/env python3
"""Build 100 hero frames — real per-frame wheel spin + forward drive motion."""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = Path("/Users/markopavicic/.cursor/projects/Users-markopavicic-mikimiki/assets")
KF = Path(__file__).resolve().parent / "keyframes"
OUT = ROOT / "public/frames"
W, H = 1920, 1080
N = 100
DRIVE_N = 36


def load(name: str) -> np.ndarray:
    for base in (ASSETS, KF):
        for p in (
            base / name,
            base / name.replace(".png", ".jpg"),
            base / name.replace(".jpg", ".png"),
            base / name.replace("van-drive-motion-", "van-drive-"),
        ):
            if p.exists():
                img = Image.open(p).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
                return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    raise FileNotFoundError(name)


def save(bgr: np.ndarray, path: Path) -> None:
    rgb = cv2.cvtColor(np.clip(bgr, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)
    Image.fromarray(rgb).save(path, "WEBP", quality=86, method=4)


def smooth(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)


def match_cut(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    t = smooth(t)
    h, w = a.shape[:2]
    if t < 0.5:
        u = t / 0.5
        M = cv2.getRotationMatrix2D((w / 2, h / 2), 0, 1 + 0.06 * u)
        z = cv2.warpAffine(a, M, (w, h), borderMode=cv2.BORDER_REFLECT)
        k = int(1 + 16 * u) | 1
        return cv2.GaussianBlur(z, (k, k), 0)
    u = (t - 0.5) / 0.5
    M = cv2.getRotationMatrix2D((w / 2, h / 2), 0, 1.06 - 0.06 * u)
    z = cv2.warpAffine(b, M, (w, h), borderMode=cv2.BORDER_REFLECT)
    k = int(1 + 16 * (1 - u)) | 1
    return cv2.GaussianBlur(z, (k, k), 0)


def flow_morph(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    t = smooth(t)
    if t <= 0.001:
        return a.copy()
    if t >= 0.999:
        return b.copy()
    ag = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
    bg = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    sc = 0.5
    fab = cv2.calcOpticalFlowFarneback(
        cv2.resize(ag, (0, 0), fx=sc, fy=sc),
        cv2.resize(bg, (0, 0), fx=sc, fy=sc),
        None, 0.5, 3, 15, 3, 5, 1.1, 0,
    )
    fba = cv2.calcOpticalFlowFarneback(
        cv2.resize(bg, (0, 0), fx=sc, fy=sc),
        cv2.resize(ag, (0, 0), fx=sc, fy=sc),
        None, 0.5, 3, 15, 3, 5, 1.1, 0,
    )
    fab = cv2.resize(fab, (W, H)) / sc
    fba = cv2.resize(fba, (W, H)) / sc
    # clamp flow to reduce ghosting on big pose changes
    fab = np.clip(fab, -40, 40)
    fba = np.clip(fba, -40, 40)
    gx, gy = np.meshgrid(np.arange(W), np.arange(H))
    ax = (gx + fab[..., 0] * t).astype(np.float32)
    ay = (gy + fab[..., 1] * t).astype(np.float32)
    bx = (gx + fba[..., 0] * (1 - t)).astype(np.float32)
    by = (gy + fba[..., 1] * (1 - t)).astype(np.float32)
    wa = cv2.remap(a, ax, ay, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    wb = cv2.remap(b, bx, by, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    # prefer sharper plate near ends
    w_a = (1 - t) ** 1.5
    w_b = t ** 1.5
    s = w_a + w_b
    return cv2.addWeighted(wa, w_a / s, wb, w_b / s, 0)


def fill_segment(seq: list, a: np.ndarray, b: np.ndarray, n: int, mode: str) -> None:
    for i in range(1, n + 1):
        t = i / n
        seq.append(flow_morph(a, b, t) if mode == "flow" else match_cut(a, b, t))


def road_streak(bgr: np.ndarray, strength: float) -> np.ndarray:
    k = 41
    kernel = np.zeros((1, k), np.float32)
    kernel[0, :] = np.linspace(0.04, 1.0, k)
    kernel /= kernel.sum()
    src = bgr.astype(np.float32)
    streak = cv2.filter2D(src, -1, kernel)
    mask = np.linspace(0.08, 1.0, H, dtype=np.float32)[:, None, None]
    out = src * (1 - strength * mask) + streak * (strength * mask)
    return np.clip(out, 0, 255).astype(np.uint8)


def parallax_scroll(bgr: np.ndarray, px: float) -> np.ndarray:
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    weight = (gy / (H - 1)) ** 1.35
    # keep van band more stable than road/sky edges
    van_band = np.exp(-((gy - H * 0.55) / (H * 0.22)) ** 2)
    weight = weight * (1.0 - 0.55 * van_band)
    map_x = gx + px * weight
    map_y = gy
    return cv2.remap(
        bgr,
        map_x.astype(np.float32),
        map_y.astype(np.float32),
        cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT,
    )


def spin_wheel_roi(bgr: np.ndarray, cx: int, cy: int, r: int, angle_deg: float, blur_amt: int) -> np.ndarray:
    pad = 12
    x0, y0 = max(0, cx - r - pad), max(0, cy - r - pad)
    x1, y1 = min(W, cx + r + pad), min(H, cy + r + pad)
    roi = bgr[y0:y1, x0:x1].copy()
    if roi.size == 0:
        return bgr
    h, w = roi.shape[:2]
    lcx, lcy = cx - x0, cy - y0
    M = cv2.getRotationMatrix2D((lcx, lcy), angle_deg, 1.0)
    rot = cv2.warpAffine(roi, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    flags = cv2.INTER_LINEAR + cv2.WARP_FILL_OUTLIERS
    rad = float(r) * 1.05
    polar = cv2.warpPolar(rot, (w, h), (lcx, lcy), rad, flags)
    k = max(7, blur_amt | 1)
    polar = cv2.GaussianBlur(polar, (k, 1), 0)
    spun = cv2.warpPolar(polar, (w, h), (lcx, lcy), rad, flags + cv2.WARP_INVERSE_MAP)
    yy, xx = np.ogrid[:h, :w]
    # soft radial falloff — no hard circle edge
    dist = np.sqrt(((xx - lcx) / (r + 1e-6)) ** 2 + ((yy - lcy) / (r + 1e-6)) ** 2)
    mask = np.clip(1.0 - dist, 0, 1) ** 1.6
    mask = cv2.GaussianBlur(mask.astype(np.float32), (31, 31), 0)[..., None]
    blended = roi.astype(np.float32) * (1 - mask) + spun.astype(np.float32) * mask
    out = bgr.copy()
    out[y0:y1, x0:x1] = np.clip(blended, 0, 255).astype(np.uint8)
    return out


def wheel_anchors_for_plate(kind: str) -> list[tuple[int, int, int]]:
    # Tuned for our drive plates (side / 3-quarter)
    if kind == "side":
        return [(int(W * 0.36), int(H * 0.73), 82), (int(W * 0.60), int(H * 0.73), 82)]
    if kind == "front":
        return [(int(W * 0.40), int(H * 0.76), 70), (int(W * 0.62), int(H * 0.76), 78)]
    return [(int(W * 0.38), int(H * 0.74), 76), (int(W * 0.61), int(H * 0.74), 76)]


def animate_drive_from_plate(plate: np.ndarray, i: int, n: int, kind: str = "side") -> np.ndarray:
    """Single crisp plate → n frames of accelerating drive (no morph ghosts)."""
    t = i / max(1, n - 1)
    # ease-in speed
    speed = t * t
    # background/road scrolls left (van appears to drive right)
    px = 8 + speed * 120
    out = parallax_scroll(plate, px)

    # subtle forward push: zoom + pan right
    scale = 1.0 + 0.06 * speed
    M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, scale)
    M[0, 2] += -speed * 40  # crop drifts left → subject advances right
    M[1, 2] += np.sin(i * 0.55) * 2.5  # suspension bob
    out = cv2.warpAffine(out, M, (W, H), borderMode=cv2.BORDER_REFLECT)

    # wheel rotation advances every frame — clearly visible on scroll scrub
    angle = -(i * 28.0)  # ~28°/frame
    blur = 17 + int(14 * speed)
    for cx, cy, r in wheel_anchors_for_plate(kind):
        cx2 = int(W / 2 + (cx - W / 2) * scale - speed * 40)
        cy2 = int(H / 2 + (cy - H / 2) * scale + np.sin(i * 0.55) * 2.5)
        out = spin_wheel_roi(out, cx2, cy2, int(r * scale), angle, blur)

    out = road_streak(out, strength=0.16 + 0.28 * speed)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Best side-drive plates (crisp, already motion-looking)
    side_a = load("van-drive-motion-a.jpg")
    side_e = load("van-drive-motion-e.jpg")
    front_b = load("van-drive-motion-b.jpg")
    front_d = load("van-drive-motion-d.jpg")

    k30 = load("van-nolith-030.jpg")
    k45 = load("van-nolith-045.jpg")
    k55 = load("van-nolith-055.jpg")
    k70 = load("van-nolith-070.jpg")
    k85 = load("van-nolith-085.jpg")
    k99 = load("van-nolith-099.jpg")

    seq: list[np.ndarray] = []

    # Chapter 1: side drive accelerate (18 frames) — pure plate animation, no morph
    print("side drive A…")
    for i in range(18):
        seq.append(animate_drive_from_plate(side_a, i, 18, "side"))

    # Brief cut to alternate side angle, keep spinning
    print("side drive E…")
    for i in range(10):
        seq.append(animate_drive_from_plate(side_e, i, 10, "side"))

    # Front 3/4 surge
    print("front drive…")
    for i in range(8):
        seq.append(animate_drive_from_plate(front_b, i, 8, "front"))

    drive_end = len(seq)
    print(f"drive chapter: {drive_end} frames")

    # Into scan / wire / tunnel
    fill_segment(seq, seq[-1], front_d, 4, "cut")
    fill_segment(seq, front_d, k30, 8, "cut")
    fill_segment(seq, k30, k45, 12, "flow")
    fill_segment(seq, k45, k55, 10, "flow")
    fill_segment(seq, k55, k70, 12, "cut")
    fill_segment(seq, k70, k85, 10, "flow")
    fill_segment(seq, k85, k99, 8, "flow")

    print("frames before trim", len(seq))
    if len(seq) > N:
        seq = seq[:N]
    while len(seq) < N:
        # extend final hold with tiny tunnel drift rather than hard freeze
        last = seq[-1]
        j = len(seq) - (N - 10)
        M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, 1 + 0.002 * max(0, j))
        seq.append(cv2.warpAffine(last, M, (W, H), borderMode=cv2.BORDER_REFLECT))

    total = 0
    for i, fr in enumerate(seq):
        path = OUT / f"frame-{i:03d}.webp"
        save(fr, path)
        total += path.stat().st_size
        if i % 10 == 0 or i == 99:
            print("wrote", path.name)

    save(seq[0], OUT / "poster.webp")
    save(seq[-1], OUT / "poster-end.webp")
    print(f"Ukupno: {total/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
