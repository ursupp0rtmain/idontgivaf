#!/usr/bin/env python3
"""Generate favicon PNG/ICO assets matching the site palette.

Requires Pillow:  pip install pillow
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

BG = (8, 8, 8, 255)        # --bg
FG = (224, 224, 224, 255)  # --bright
OUT = Path(__file__).resolve().parent.parent / "public"

SUPERSAMPLE = 8


def draw_zero(size: int) -> Image.Image:
    """Draw a bold monospace-style '0' (tall ellipse ring) on dark background."""
    s = size * SUPERSAMPLE
    img = Image.new("RGBA", (s, s), BG)
    d = ImageDraw.Draw(img)

    rx = s * 0.26
    ry = s * 0.36
    cx = cy = s / 2
    stroke = max(1, round(s * 0.115))

    d.ellipse(
        (cx - rx, cy - ry, cx + rx, cy + ry),
        outline=FG,
        width=stroke,
    )

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    icon32 = draw_zero(32)
    icon32.save(OUT / "favicon-32.png")
    draw_zero(180).save(OUT / "apple-touch-icon.png")

    # ICO containing 16/32/48 px renditions
    draw_zero(48).save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    print("Wrote favicon assets to", OUT)


if __name__ == "__main__":
    main()
