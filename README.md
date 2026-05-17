# VSL Media — Website

Minimalistische Single-Page-Website für eine Videoproduktion mit Fokus auf
Performance-Agenturen. Statisches HTML/CSS/JS, kein Build-Step, ohne
externe Tracker, CDNs oder Webfonts.

## Stack

- Statisches HTML/CSS/JS
- 3D-Hintergrund via [three.js](https://threejs.org/) (MIT, lokal in `vendor/`)
- System-Fonts (kein Google Fonts, kein Webfont-Download)
- Hero-/Case-Bilder generiert mit [Higgsfield AI](https://higgsfield.ai/)

## Lokal starten

```bash
python3 -m http.server 8000
# oder
npx serve .
```

Dann `http://localhost:8000` öffnen. ES-Module mit Importmap funktionieren
nicht über `file://`, ein lokaler Server ist also erforderlich.

## Erst-Setup (Bilder herunterladen)

Die Case-Bilder sind aus DSGVO-Gründen nicht auf einem Drittanbieter-CDN
verlinkt, sondern werden vom eigenen Webroot ausgeliefert. Beim ersten
Setup müssen sie einmal heruntergeladen werden:

```bash
./scripts/download-assets.sh
```

Das Script legt die vier WebP-Dateien unter `images/` ab. Solange die
Dateien fehlen, fallen die Case-Karten elegant auf einen CSS-Gradient
zurück — die Seite bleibt also auch ohne Bilder funktional.

## Deployment

Die Site ist 100 % statisch und läuft auf jedem beliebigen Webhost.
Empfohlen werden Anbieter mit Sitz in der EU (z. B. Hetzner, IONOS,
Netcup) oder ein EU-Endpoint bei Cloudflare/Vercel/Netlify. Vor dem
Deployment einmal `./scripts/download-assets.sh` ausführen, damit die
Bilder mit ausgeliefert werden.

Wichtige Server-Konfiguration:

- HTTPS / TLS verpflichtend (Let's-Encrypt-Zertifikat genügt)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`

## Drittanbieter-Ressourcen & Lizenzen

| Asset | Quelle | Lizenz |
| --- | --- | --- |
| three.js (`vendor/three.module.js`) | mrdoob / three.js r160 | MIT (siehe `vendor/three.LICENSE.txt`) |
| Schriftarten | System-Font-Stack (kein externer Webfont) | n/a |
| Icons (Pfeil-SVG) | inline, im Repo erstellt | eigene Erstellung |
| Case-Bilder (`images/*.webp`) | Higgsfield AI (Marketing Studio) | gemäß Higgsfield-Nutzungsbedingungen |

Es werden keine externen CDNs, Google Fonts, Analytics-, Tracking- oder
Werbedienste eingebunden.

## DSGVO / Rechtliches

- Impressum: https://vsl-media.com/impressum
- Datenschutzerklärung: https://vsl-media.com/datenschutz

Die Footer-Links in `index.html` verweisen direkt auf diese externen
Pflichtseiten. Es werden beim Aufruf der Website **keine Cookies** und
keine vergleichbaren Browser-Storage-Technologien gesetzt; auch ein
Consent-Banner ist daher nicht erforderlich.

## Dateistruktur

```
.
├── index.html                  # Hauptseite
├── styles.css                  # Styles (System-Fonts, keine externen Calls)
├── scene.js                    # Three.js-Szene (Torus-Knot + Partikel)
├── main.js                     # Reveal-Animationen, Card-Spotlight
├── vendor/
│   ├── three.module.js         # three.js r160, MIT
│   └── three.LICENSE.txt
├── images/                     # nach Setup: Case-Bilder (WebP)
└── scripts/
    └── download-assets.sh      # einmaliger Bild-Download
```
