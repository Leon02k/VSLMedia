#!/usr/bin/env python3
"""Lädt die Vimeo Vorschaubilder (Poster) der 4 Videos in brand/thumbs/.

Wird einmal nach dem Setup oder vor jedem Deployment ausgeführt.
Damit liegen die Thumbnails auf dem eigenen Webroot und es entsteht
beim Aufruf der Seite keinerlei Request an vimeocdn.com.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request

VIDEOS = [
    # (Vimeo Video ID, Vimeo Privacy Hash oder None)
    ("1177367913", None),          # Vorstellung Joschua
    ("1175101240", "69da69b8b2"),  # DAMA Solutions GmbH
    ("1175101953", "6bdff6732d"),  # Pilcrow GmbH
    ("1175101616", "3b816c67f6"),  # Expertenangler
]

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "brand", "thumbs")


def build_oembed_url(vid: str, hash_: str | None) -> str:
    if hash_:
        video_url = f"https://vimeo.com/{vid}/{hash_}"
    else:
        video_url = f"https://vimeo.com/{vid}"
    return "https://vimeo.com/api/oembed.json?" + urllib.parse.urlencode(
        {"url": video_url, "width": 1280}
    )


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "vsl-media-thumb-script"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Speichere Thumbnails nach {OUT_DIR}")

    for vid, hash_ in VIDEOS:
        out_path = os.path.join(OUT_DIR, f"{vid}.jpg")
        try:
            oembed = json.loads(fetch(build_oembed_url(vid, hash_)).decode("utf-8"))
            thumb_url = oembed.get("thumbnail_url")
            if not thumb_url:
                print(f"  ! {vid}: kein thumbnail_url in oEmbed Antwort")
                continue
            # Vimeo liefert die Originalgröße über _640.jpg / _1280.jpg im Pfad
            thumb_url = thumb_url.split("?")[0]
            if "_640" in thumb_url:
                thumb_url = thumb_url.replace("_640", "_1280")
            data = fetch(thumb_url)
            with open(out_path, "wb") as f:
                f.write(data)
            print(f"  ✓ {vid}.jpg ({len(data)//1024} KB)")
        except Exception as exc:  # noqa: BLE001
            print(f"  ✗ {vid}: {exc}")
            return 1

    print("Fertig.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
