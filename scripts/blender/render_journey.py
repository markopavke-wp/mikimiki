"""
Blender skripta za ponovljivo renderovanje 100 frejmova hero animacije.

Pokretanje (kada je Blender instaliran):
  blender -b -P scripts/blender/render_journey.py

Očekuje:
  - public/images/logo-transparent.png kao decal teksturu
  - izlaz u public/frames/frame-XXX.webp (konvertujte PNG→WebP sharp skriptom)

Napomena: ovo je produkcijski predložak — dopunite modele kombija / mape u .blend fajlu
i povežite putanje pre pristojnog render farma.
"""

import math
import os

try:
    import bpy
except ImportError as exc:
    raise SystemExit("Pokrenite unutar Blender-a (blender -b -P ...)") from exc

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
OUT = os.path.join(ROOT, "public/frames_blender")
LOGO = os.path.join(ROOT, "public/images/logo-transparent.png")
FRAME_COUNT = 100

os.makedirs(OUT, exist_ok=True)

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 64
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = "PNG"
scene.frame_start = 0
scene.frame_end = FRAME_COUNT - 1

# Ground
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "Ground"

# Simple van proxy (replace with detailed asset)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.9))
van = bpy.context.active_object
van.name = "Van"
van.scale = (2.2, 4.6, 1.6)

# Camera
bpy.ops.object.camera_add(location=(6, -10, 3))
cam = bpy.context.active_object
scene.camera = cam

# Light
bpy.ops.object.light_add(type="SUN", location=(10, -5, 15))

# Animate van along path
for f in range(FRAME_COUNT):
    t = f / (FRAME_COUNT - 1)
    x = math.sin(t * math.pi * 1.35) * 1.8
    y = -3 + t * 28
    van.location = (x, y, 0.9)
    van.keyframe_insert(data_path="location", frame=f)
    cam.location = (x + 5, y - 8, 3 + t * 4)
    cam.keyframe_insert(data_path="location", frame=f)

scene.render.filepath = os.path.join(OUT, "frame-")
bpy.ops.render.render(animation=True)
print(f"Rendered frames to {OUT}. Convert to WebP via scripts/frame-generator/png-to-webp.mjs")
