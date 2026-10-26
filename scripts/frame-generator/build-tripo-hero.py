#!/usr/bin/env python3
"""
Build 100 hero frames from Tripo van turntable:
  0–34  drive into tunnel (photoreal)
 35–69  texture → hologram structure
 70–99  hologram van → Miki & Miki logo
"""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
VIDEO = Path(__file__).resolve().parent / "tripo-van.mp4"
ASSETS = Path("/Users/markopavicic/.cursor/projects/Users-markopavicic-mikimiki/assets")
LOGO = ROOT / "public/images/logo-transparent.png"
OUT = ROOT / "public/frames"
CACHE = Path(__file__).resolve().parent / "tripo-cache"
W, H = 1920, 1080
N = 100
CYAN = np.array([255, 232, 97], dtype=np.float32)  # BGR cyan-ish


def smooth(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)


def load_rgb(path: Path, size: tuple[int, int] | None = (W, H)) -> np.ndarray:
    im = Image.open(path).convert("RGB")
    if size:
        im = im.resize(size, Image.Resampling.LANCZOS)
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)


def save_webp(bgr: np.ndarray, path: Path) -> None:
    rgb = cv2.cvtColor(np.clip(bgr, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)
    Image.fromarray(rgb).save(path, "WEBP", quality=88, method=4)


def extract_tripo() -> list[np.ndarray]:
    """Extract cleaned square van plates from video (watermark/QR removed)."""
    CACHE.mkdir(parents=True, exist_ok=True)
    marker = CACHE / "_ok"
    if marker.exists() and len(list(CACHE.glob("t-*.png"))) >= 100:
        frames = []
        for p in sorted(CACHE.glob("t-*.png")):
            frames.append(cv2.imread(str(p)))
        return frames

    cap = cv2.VideoCapture(str(VIDEO))
    raw: list[np.ndarray] = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        raw.append(f)
    cap.release()
    if not raw:
        raise RuntimeError("No frames from video")

    # sample ~120 → keep all, clean overlays
    cleaned: list[np.ndarray] = []
    for i, f in enumerate(raw):
        g = f.copy()
        h, w = g.shape[:2]
        # wipe Tripo banner, QR, watermark chrome
        g[0 : int(h * 0.12), :] = 0
        g[0 : int(h * 0.22), int(w * 0.72) :] = 0
        g[0 : int(h * 0.10), 0 : int(w * 0.28)] = 0
        cleaned.append(g)
        cv2.imwrite(str(CACHE / f"t-{i:03d}.png"), g)

    marker.write_text(str(len(cleaned)))
    return cleaned


def van_mask(bgr: np.ndarray) -> np.ndarray:
    """Soft alpha of van on near-black studio bg."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    # bright body + mid wheels/windows
    a = np.clip((gray - 12) / 40.0, 0, 1)
    a = cv2.GaussianBlur(a, (7, 7), 0)
    # kill residual floor reflection a bit softer below midline
    h = a.shape[0]
    fade = np.linspace(1.0, 0.35, h // 2, dtype=np.float32)
    a[h // 2 :] *= fade[:, None] if fade.shape[0] == a[h // 2 :].shape[0] else 1.0
    return a


def place_van_on_canvas(
    van_sq: np.ndarray,
    scale: float,
    cx: float,
    cy: float,
) -> tuple[np.ndarray, np.ndarray]:
    """Return BGR canvas + alpha of scaled van centered at (cx,cy) in 1920x1080."""
    sh = int(van_sq.shape[0] * scale)
    sw = int(van_sq.shape[1] * scale)
    van = cv2.resize(van_sq, (sw, sh), interpolation=cv2.INTER_LANCZOS4)
    alpha = van_mask(van)
    canvas = np.zeros((H, W, 3), np.float32)
    a_full = np.zeros((H, W), np.float32)
    x0 = int(cx - sw / 2)
    y0 = int(cy - sh / 2)
    x1, y1 = x0 + sw, y0 + sh
    xs0, ys0 = max(0, x0), max(0, y0)
    xs1, ys1 = min(W, x1), min(H, y1)
    if xs0 >= xs1 or ys0 >= ys1:
        return canvas, a_full
    vx0, vy0 = xs0 - x0, ys0 - y0
    patch = van[vy0 : vy0 + (ys1 - ys0), vx0 : vx0 + (xs1 - xs0)].astype(np.float32)
    ap = alpha[vy0 : vy0 + (ys1 - ys0), vx0 : vx0 + (xs1 - xs0)]
    canvas[ys0:ys1, xs0:xs1] = patch
    a_full[ys0:ys1, xs0:xs1] = ap
    return canvas, a_full


def composite(bg: np.ndarray, fg: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    a = alpha[..., None]
    return bg.astype(np.float32) * (1 - a) + fg.astype(np.float32) * a


def road_streak(bgr: np.ndarray, strength: float) -> np.ndarray:
    k = 31
    kernel = np.zeros((1, k), np.float32)
    kernel[0] = np.linspace(0.05, 1.0, k)
    kernel /= kernel.sum()
    src = bgr.astype(np.float32)
    streak = cv2.filter2D(src, -1, kernel)
    mask = np.linspace(0.15, 1.0, H, dtype=np.float32)[:, None, None]
    out = src * (1 - strength * mask) + streak * (strength * mask)
    return np.clip(out, 0, 255)


def hologramize(bgr: np.ndarray, alpha: np.ndarray, amount: float) -> np.ndarray:
    """amount 0=photoreal … 1=full cyan wireframe hologram."""
    amount = float(np.clip(amount, 0, 1))
    if amount < 0.01:
        return bgr
    gray = cv2.cvtColor(np.clip(bgr, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 40, 120)
    edges = cv2.dilate(edges, np.ones((2, 2), np.uint8), iterations=1)
    edges = cv2.GaussianBlur(edges.astype(np.float32), (3, 3), 0)

    # mesh / contour look
    wire = np.zeros_like(bgr, dtype=np.float32)
    for c in range(3):
        wire[..., c] = edges * (CYAN[c] / 255.0) * 255.0

    # dimmed body fill with cyan tint
    body = bgr.astype(np.float32) * 0.25
    tint = body * 0.35 + CYAN[None, None, :] * 0.55
    # scanlines
    scan = np.ones((H, 1), np.float32)
    scan[::3] = 0.55
    tint *= scan[:, :, None]

    # grid overlay
    grid = np.zeros((H, W), np.float32)
    grid[::28, :] = 0.35
    grid[:, ::28] = 0.35
    grid = cv2.GaussianBlur(grid, (3, 3), 0)
    tint = tint + grid[..., None] * CYAN[None, None, :] * 0.45

    holo = np.clip(tint * 0.55 + wire * 1.2, 0, 255)
    # only on van
    a = (alpha * amount)[..., None]
    out = bgr.astype(np.float32) * (1 - a) + holo * a
    # glow outside a bit
    glow = cv2.GaussianBlur(wire, (0, 0), 6) * amount * 0.35
    out = out + glow * alpha[..., None]
    return np.clip(out, 0, 255)


def dissolve_to_logo(
    scene: np.ndarray,
    alpha: np.ndarray,
    logo_rgba: np.ndarray,
    t: float,
) -> np.ndarray:
    """t: 0=holo van … 1=logo only."""
    t = smooth(t)
    # shrink van alpha / scale
    scale = 1.0 - 0.55 * t
    # logo fades in
    lh, lw = logo_rgba.shape[:2]
    target_w = int(W * (0.22 + 0.28 * t))
    sc = target_w / lw
    logo = cv2.resize(logo_rgba, (target_w, int(lh * sc)), interpolation=cv2.INTER_LANCZOS4)
    la = logo[:, :, 3].astype(np.float32) / 255.0 * t
    lrgb = logo[:, :, :3].astype(np.float32)

    canvas = scene.copy().astype(np.float32)
    # darken / dissolve van
    canvas = canvas * (1 - 0.85 * t * alpha[..., None])
    # cyan particle fade of van silhouette
    if t < 0.85:
        particles = (alpha * (1 - t) * 255).astype(np.uint8)
        particles = cv2.GaussianBlur(particles, (0, 0), 2 + 8 * t)
        canvas += particles[..., None].astype(np.float32) * (CYAN / 255.0) * (1 - t) * 0.8

    # paste logo centered
    ly0 = (H - logo.shape[0]) // 2
    lx0 = (W - logo.shape[1]) // 2
    ly1, lx1 = ly0 + logo.shape[0], lx0 + logo.shape[1]
    roi = canvas[ly0:ly1, lx0:lx1]
    a = la[..., None]
    canvas[ly0:ly1, lx0:lx1] = roi * (1 - a) + lrgb * a

    # final black behind logo
    if t > 0.7:
        fade = (t - 0.7) / 0.3
        canvas = canvas * (1 - 0.92 * fade) + 8 * fade  # near black
        # re-paste logo crisp
        a = (logo[:, :, 3].astype(np.float32) / 255.0 * min(1.0, fade * 1.4))[..., None]
        canvas[ly0:ly1, lx0:lx1] = canvas[ly0:ly1, lx0:lx1] * (1 - a) + lrgb * a

    return np.clip(canvas, 0, 255)


def pick_tripo(tripo: list[np.ndarray], i: int, n: int) -> np.ndarray:
    """Orbit through turntable as sequence advances."""
    # use ~full rotation across first 70 frames, then hold near side for morph
    t = i / max(1, n - 1)
    # preference: side/three-quarter angles look best — bias mid indices
    idx = int((0.08 + 0.84 * t) * (len(tripo) - 1))
    # slight oscillation so it feels alive
    idx = int(idx + 3 * np.sin(t * np.pi * 4)) % len(tripo)
    return tripo[idx]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Extracting Tripo frames…")
    tripo = extract_tripo()
    print(f"  {len(tripo)} source frames")

    entrance = load_rgb(ASSETS / "tunnel-entrance.jpg")
    interior = load_rgb(ASSETS / "tunnel-interior.jpg")
    logo_pil = Image.open(LOGO).convert("RGBA")
    # ensure logo readable on dark — keep as RGBA BGRA for cv2
    logo_rgba = cv2.cvtColor(np.array(logo_pil), cv2.COLOR_RGBA2BGRA)

    for i in range(N):
        t = i / (N - 1)

        # --- chapter progress ---
        if t < 0.35:
            # drive into tunnel
            u = smooth(t / 0.35)
            bg = cv2.addWeighted(entrance, 1 - u, interior, u, 0)
            # van moves right→center, grows slightly (approaching)
            scale = 0.72 + 0.18 * u
            cx = W * (0.38 + 0.12 * u)
            cy = H * 0.58
            van = pick_tripo(tripo, i, int(N * 0.35))
            fg, alpha = place_van_on_canvas(van, scale, cx, cy)
            scene = composite(bg, fg, alpha)
            scene = road_streak(scene, 0.12 + 0.25 * u)
            # tiny hologram hint at end of chapter
            scene = hologramize(scene, alpha, 0.08 * u)
        elif t < 0.70:
            # hologram transform inside tunnel
            u = smooth((t - 0.35) / 0.35)
            bg = interior.copy()
            # deepen tunnel / add cyan fog
            fog = np.zeros_like(bg, dtype=np.float32)
            fog[:] = CYAN * 0.15 * u
            bg = np.clip(bg.astype(np.float32) * (1 - 0.35 * u) + fog, 0, 255)
            scale = 0.90 - 0.08 * u
            cx, cy = W * 0.50, H * 0.56
            van = pick_tripo(tripo, i, N)
            fg, alpha = place_van_on_canvas(van, scale, cx, cy)
            scene = composite(bg, fg, alpha)
            scene = hologramize(scene, alpha, 0.15 + 0.85 * u)
            scene = road_streak(scene, 0.1 * (1 - u))
        else:
            # morph to logo
            u = smooth((t - 0.70) / 0.30)
            bg = interior.copy().astype(np.float32) * (1 - 0.9 * u)
            bg = np.clip(bg, 0, 255)
            scale = 0.82 - 0.35 * u
            cx, cy = W * 0.50, H * (0.56 - 0.06 * u)
            van = pick_tripo(tripo, min(i, int(N * 0.7)), N)
            fg, alpha = place_van_on_canvas(van, scale, cx, cy)
            scene = composite(bg, fg, alpha)
            scene = hologramize(scene, alpha, 1.0)
            scene = dissolve_to_logo(scene, alpha, logo_rgba, u)

        path = OUT / f"frame-{i:03d}.webp"
        save_webp(scene, path)
        if i % 10 == 0 or i == 99:
            print("wrote", path.name)

    save_webp(cv2.imread(str(OUT / "frame-000.webp")), OUT / "poster.webp")
    save_webp(cv2.imread(str(OUT / "frame-099.webp")), OUT / "poster-end.webp")
    total = sum(p.stat().st_size for p in OUT.glob("frame-*.webp"))
    print(f"Ukupno: {total/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
