#!/usr/bin/env python3
"""Build white Miki & Miki TRAVEL van GLB with logo on side doors."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/models/miki-van.glb"
TEX_DIR = Path(__file__).resolve().parent / "textures"
LOGO_SRC = ROOT / "public/images/logo-transparent.png"


def brand_logo_rgba(max_w: int = 900) -> Image.Image:
    """Prefer site logo; fall back to drawn text."""
    if LOGO_SRC.exists():
        logo = Image.open(LOGO_SRC).convert("RGBA")
        # If circular badge — keep full badge for rear; for side doors rebuild text
        # Draw crisp side logo matching brand
        pass

    w, h = 1100, 420
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    try:
        font_big = ImageFont.truetype(
            "/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf", 140
        )
        font_small = ImageFont.truetype(
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf", 52
        )
    except OSError:
        font_big = ImageFont.load_default()
        font_small = font_big

    black, red = (18, 18, 18, 255), (227, 28, 35, 255)
    x, y = 40, 40
    draw.text((x, y), "Miki", font=font_big, fill=black)
    m1 = draw.textlength("Miki", font=font_big)
    draw.text((x + m1 + 16, y + 6), "&", font=font_big, fill=red)
    amp = draw.textlength("&", font=font_big)
    x2 = x + m1 + amp + 32
    draw.text((x2, y + 40), "Miki", font=font_big, fill=black)
    draw.text((x2 + 8, y + 190), "TRAVEL", font=font_small, fill=black)

    # red dots on i
    try:
        # approximate i-dot positions
        draw.ellipse([x + m1 * 0.72, y + 8, x + m1 * 0.72 + 22, y + 30], fill=red)
        draw.ellipse([x2 + m1 * 0.72, y + 48, x2 + m1 * 0.72 + 22, y + 70], fill=red)
    except Exception:
        pass

    bbox = canvas.getbbox()
    logo = canvas.crop(bbox) if bbox else canvas
    scale = max_w / logo.width
    logo = logo.resize((max_w, int(logo.height * scale)), Image.Resampling.LANCZOS)
    return logo


def make_side_texture(w: int = 2048, h: int = 1024) -> Path:
    TEX_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (w, h), (248, 248, 250))
    draw = ImageDraw.Draw(img)

    # continuous tinted window band
    wy0, wy1 = int(h * 0.16), int(h * 0.46)
    draw.rounded_rectangle(
        [int(w * 0.06), wy0, int(w * 0.94), wy1], radius=18, fill=(32, 34, 38)
    )
    # pillars
    for xf in (0.30, 0.50, 0.70):
        px = int(w * xf)
        draw.rectangle([px - 14, wy0, px + 14, wy1], fill=(248, 248, 250))

    # door handle hint
    draw.rounded_rectangle(
        [int(w * 0.46), int(h * 0.52), int(w * 0.50), int(h * 0.56)],
        radius=4,
        fill=(200, 200, 205),
    )

    # logo on doors (below windows)
    logo = brand_logo_rgba(int(w * 0.46))
    lx = int(w * 0.27)
    ly = int(h * 0.54)
    # soft drop shadow
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shadow.paste(
        Image.new("RGBA", logo.size, (0, 0, 0, 40)),
        (lx + 4, ly + 6),
        logo.split()[-1],
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(4))
    base = img.convert("RGBA")
    base = Image.alpha_composite(base, shadow)
    base.paste(logo, (lx, ly), logo)

    path = TEX_DIR / "van-side.png"
    base.convert("RGB").save(path, "PNG")
    return path


def box(extents, translation=None, color=None) -> trimesh.Trimesh:
    m = trimesh.creation.box(extents=extents)
    if translation is not None:
        m.apply_translation(translation)
    if color is not None:
        m.visual.face_colors = color
    return m


def wheel(radius=0.38, width=0.26) -> trimesh.Trimesh:
    wh = trimesh.creation.cylinder(radius=radius, height=width, sections=28)
    wh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0]))
    wh.visual.face_colors = [35, 35, 40, 255]
    return wh


def textured_side_panel(side_tex: Path, y_sign: float) -> trimesh.Trimesh:
    side_img = Image.open(side_tex).convert("RGB")
    xs = np.array([-2.15, 2.35, 2.35, -2.15], dtype=np.float64)
    zs = np.array([0.32, 0.32, 1.78, 1.78], dtype=np.float64)
    ys = np.full(4, y_sign * 1.02)
    verts = np.column_stack([xs, ys, zs])
    if y_sign > 0:
        faces = np.array([[0, 1, 2], [0, 2, 3]])
        uvs = np.array([[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]])
    else:
        faces = np.array([[0, 2, 1], [0, 3, 2]])
        uvs = np.array([[1.0, 0.0], [0.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
    panel = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    material = trimesh.visual.material.SimpleMaterial(
        image=side_img, diffuse=[255, 255, 255, 255]
    )
    panel.visual = trimesh.visual.TextureVisuals(uv=uvs, material=material)
    return panel


def build_van() -> trimesh.Scene:
    side_tex = make_side_texture()
    white = [248, 248, 250, 255]
    dark = [32, 34, 38, 255]
    chrome = [190, 195, 200, 255]
    red = [210, 35, 45, 255]

    parts: list[trimesh.Trimesh] = []

    parts.append(box([4.65, 1.92, 1.52], [0.12, 0, 0.94], white))
    parts.append(box([4.55, 1.82, 0.32], [0.12, 0, 1.84], white))
    parts.append(box([1.0, 1.82, 0.52], [-2.58, 0, 0.54], white))
    parts.append(box([0.38, 1.88, 0.32], [-3.1, 0, 0.28], white))

    # windshield
    glass = box([0.1, 1.65, 0.82], color=[28, 30, 34, 230])
    glass.apply_transform(trimesh.transformations.rotation_matrix(np.deg2rad(-26), [0, 1, 0]))
    glass.apply_translation([-2.08, 0, 1.22])
    parts.append(glass)

    # rear hatch + window + lights
    parts.append(box([0.12, 1.82, 1.48], [2.48, 0, 0.98], white))
    parts.append(box([0.06, 1.5, 0.68], [2.55, 0, 1.32], dark))
    for y in (-0.82, 0.82):
        parts.append(box([0.08, 0.16, 0.52], [2.55, y, 0.82], red))

    parts.append(box([0.08, 1.15, 0.1], [-3.18, 0, 0.52], chrome))

    # mirrors
    for y in (-1.05, 1.05):
        parts.append(box([0.22, 0.12, 0.18], [-2.15, y, 1.15], white))

    # wheels + hubs
    for x, y in [(-1.9, -0.95), (-1.9, 0.95), (1.55, -0.95), (1.55, 0.95)]:
        wh = wheel()
        wh.apply_translation([x, y, 0.38])
        parts.append(wh)
        hub = trimesh.creation.cylinder(radius=0.15, height=0.28, sections=18)
        hub.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0]))
        hub.apply_translation([x, y, 0.38])
        hub.visual.face_colors = chrome
        parts.append(hub)

    # textured door sides with logo
    parts.append(textured_side_panel(side_tex, 1.0))
    parts.append(textured_side_panel(side_tex, -1.0))

    # rear logo badge (small)
    if LOGO_SRC.exists():
        badge = Image.open(LOGO_SRC).convert("RGBA")
        badge = badge.resize((512, 512), Image.Resampling.LANCZOS)
        # flat on rear
        verts = np.array(
            [
                [2.56, -0.55, 0.45],
                [2.56, 0.55, 0.45],
                [2.56, 0.55, 0.95],
                [2.56, -0.55, 0.95],
            ],
            dtype=np.float64,
        )
        faces = np.array([[0, 1, 2], [0, 2, 3]])
        uvs = np.array([[0, 0], [1, 0], [1, 1], [0, 1]], dtype=np.float64)
        plate = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
        mat = trimesh.visual.material.SimpleMaterial(
            image=badge.convert("RGB"), diffuse=[255, 255, 255, 255]
        )
        plate.visual = trimesh.visual.TextureVisuals(uv=uvs, material=mat)
        parts.append(plate)

    scene = trimesh.Scene()
    for i, p in enumerate(parts):
        scene.add_geometry(p, node_name=f"part_{i}")
    scene.metadata["name"] = "Miki & Miki TRAVEL Van"
    return scene


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    scene = build_van()
    OUT.write_bytes(scene.export(file_type="glb"))
    print(f"Wrote {OUT} ({OUT.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
