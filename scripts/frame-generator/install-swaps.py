#!/usr/bin/env python3
"""Install AI truck→van swaps from assets into public/frames as WebP."""

from pathlib import Path

from PIL import Image

ASSETS = Path("/Users/markopavicic/.cursor/projects/Users-markopavicic-mikimiki/assets")
OUT = Path(__file__).resolve().parents[2] / "public/frames"
W, H = 1920, 1080


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    done: list[int] = []
    for i in range(100):
        src = ASSETS / f"swap-{i:03d}.jpg"
        if not src.exists():
            src = ASSETS / f"swap-{i:03d}.png"
        if not src.exists():
            continue
        im = Image.open(src).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
        im.save(OUT / f"frame-{i:03d}.webp", "WEBP", quality=88, method=4)
        done.append(i)
    if done:
        Image.open(OUT / f"frame-{done[0]:03d}.webp").save(
            OUT / "poster.webp", "WEBP", quality=88, method=4
        )
        last = max(done)
        Image.open(OUT / f"frame-{last:03d}.webp").save(
            OUT / "poster-end.webp", "WEBP", quality=88, method=4
        )
    missing = [i for i in range(100) if i not in done]
    print(f"installed {len(done)}/100")
    if missing:
        print("missing:", missing)


if __name__ == "__main__":
    main()
