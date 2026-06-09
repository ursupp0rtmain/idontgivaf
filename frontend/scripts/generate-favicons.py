#!/usr/bin/env python3
"""Generate PNG favicon assets matching the site palette."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

BG = (8, 8, 8, 255)
FG = (224, 224, 224, 255)
OUT = Path(__file__).resolve().parent.parent / "public"


def write_png(path: Path, size: int, pixels: list[tuple[int, int, int, int]]) -> None:
    raw = b"".join(
        b"\x00" + bytes(pixel[:3]) for pixel in pixels  # RGB, no alpha in raw for simplicity
    )
    compressed = zlib.compress(raw, 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", compressed)
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def ring_pixels(size: int) -> list[tuple[int, int, int, int]]:
    cx = cy = (size - 1) / 2
    outer = size * 0.38
    inner = size * 0.22
    pixels: list[tuple[int, int, int, int]] = []
    for y in range(size):
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = (dx * dx + dy * dy) ** 0.5
            if inner <= dist <= outer:
                pixels.append(FG[:3])
            else:
                pixels.append(BG[:3])
    return pixels


def write_ico(path: Path, png_path: Path) -> None:
    png_data = png_path.read_bytes()
    # ICO with one 32x32 PNG image
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack(
        "<BBBBHHII",
        32,  # width
        32,  # height
        0,   # color count
        0,   # reserved
        1,   # planes
        32,  # bit count
        len(png_data),
        6 + 16,  # offset after header + directory
    )
    path.write_bytes(header + entry + png_data)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for size, name in ((32, "favicon-32.png"), (180, "apple-touch-icon.png")):
        write_png(OUT / name, size, ring_pixels(size))

    write_ico(OUT / "favicon.ico", OUT / "favicon-32.png")
    print("Wrote favicon assets to", OUT)


if __name__ == "__main__":
    main()
