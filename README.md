# VSL Media — Website

Minimalistische Single-Page-Website für eine Videoproduktion mit Fokus auf
Performance-Agenturen. Statisches HTML/CSS/JS, kein Build-Step, ohne
externe Tracker, CDNs oder Webfonts.

## Stack

- Statisches HTML/CSS/JS
- 3D-Hintergrund via [three.js](https://threejs.org/) (MIT, lokal in `vendor/`)
- System-Fonts (kein Google Fonts, kein Webfont-Download)
- Kundenlogo aus `brand/`

## Lokal starten

```bash
python3 -m http.server 8000
# oder
npx serve .
```

Dann `http://localhost:8000` öffnen. ES-Module mit Importmap funktionieren
nicht über `file://`, ein lokaler Server ist also erforderlich.

## Deployment

Die Site ist 100 % statisch und läuft auf jedem beliebigen Webhost.
Empfohlen werden Anbieter mit Sitz in der EU (z. B. Hetzner, IONOS,
Netcup) oder ein EU-Endpoint bei Cloudflare/Vercel/Netlify.

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
| Icons (SVG inline) | eigene Erstellung | eigene Erstellung |
| Logo (`brand/logo.*`) | vom Auftraggeber bereitgestellt | gemäß Auftraggeber |

Es werden keine externen CDNs, Google Fonts, Analytics-, Tracking- oder
Werbedienste eingebunden.

## DSGVO / Rechtliches

- Impressum: https://vsl-media.com/impressum
- Datenschutzerklärung: https://vsl-media.com/datenschutz

Die Footer-Links in `index.html` verweisen direkt auf diese externen
Pflichtseiten. Es werden beim Aufruf der Website **keine Cookies** und
keine vergleichbaren Browser-Storage-Technologien gesetzt; auch ein
Consent-Banner ist daher nicht erforderlich.

## Video Thumbnails einmal herunterladen

Damit die 4 Vimeo Vorschaubilder vom eigenen Webroot ausgeliefert werden
(keine Drittanbieter Requests vor Klick), liegt ein Helfer Skript bereit:

```bash
./scripts/download-thumbnails.py
```

Das speichert die JPGs in `brand/thumbs/`. Solange die Dateien fehlen,
fällt jedes Video Tile elegant auf den dunklen Gradient zurück.

## Pre Launch Checkliste (rechtliche Pflichten)

Diese Punkte muss der Auftraggeber **vor** dem Livegang prüfen oder
freigeben. Sie liegen außerhalb der technischen Umsetzung.

### Pflicht (sonst Abmahnrisiko)

- [ ] **Testimonials**: Für jede genannte Firma (DAMA Solutions GmbH,
  Pilcrow GmbH, Expertenangler) muss eine **schriftliche
  Freigabe** vorliegen, dass Name und Zitat öffentlich verwendet
  werden dürfen. Zitate müssen so oder sinngemäß gefallen sein.
  Werberecht: § 5 UWG (Irreführung), Markenrecht, Persönlichkeits-
  und Urheberrecht.
- [ ] **Founder Nennung „Joschua Dörr"**: Person muss mit Nennung
  einverstanden sein. Wenn er Inhaber ist, kein Problem; sonst
  schriftliches OK einholen.
- [ ] **Impressum und Datenschutz**: Die Footer Links zeigen aktuell auf
  `https://vsl-media.com/impressum` und `/datenschutz`. Diese Seiten
  müssen unter dieser Domain existieren, vollständig sein und auch
  nach Launch dort liegen bleiben (§ 5 DDG / § 18 MStV).
- [ ] **Preisangabe**: Im FAQ wurde die konkrete Preisspanne entfernt
  und durch „transparente Paketpreise" ersetzt. Sollten konkrete
  Preise zurück auf die Seite, muss die Preisangabenverordnung (PAngV)
  beachtet werden.
- [ ] **Erfolgsversprechen**: Aussagen wie „verdoppelt die Conversion"
  wurden zu vorsichtigeren Formulierungen entschärft. Werden konkrete
  Zahlen zurückgenommen, müssen sie nachweisbar belegt sein
  (§ 5 UWG).
- [ ] **Buchungslink**: Der Button „Kostenloses Erstgespräch anfragen"
  zeigt aktuell auf `mailto:hello@vsl-media.com`. Falls Calendly,
  Cal.com o. ä. genutzt werden soll: Tool einbinden und prüfen, ob
  ein Auftragsverarbeitungsvertrag (Art. 28 DSGVO) nötig ist.

### Vimeo Embed (Showreel)

Der Showreel auf der Startseite wird über das **Click to Load**
Prinzip eingebunden. Vor dem ersten Klick findet **kein** Request an
Vimeo statt; es werden keine Cookies gesetzt und keine IP an Vimeo
(USA) übertragen.

Sobald der Nutzer auf das Vorschaubild klickt:

- wird der Vimeo Player mit Parameter `dnt=1` (Do Not Track) geladen,
- erfolgt ein Datenfluss an Vimeo Inc. (Drittland USA),
- liegt darin die Einwilligung der Nutzer:in durch die aktive Handlung.

Vor dem Klick wird ein **Hinweistext direkt unter dem Play Button**
angezeigt, der über den Drittlandtransfer informiert und auf die
Datenschutzerklärung verlinkt. Stelle sicher, dass die
Datenschutzerklärung unter `vsl-media.com/datenschutz` einen Abschnitt
zu Vimeo Embeds enthält (Verantwortlicher, Drittlandtransfer,
Rechtsgrundlage Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO).

### Empfohlen (gute Praxis)

- [ ] AGB hinterlegen und im Footer verlinken (B2B; nicht zwingend,
  aber bei Dienstleistungsverkauf üblich).
- [ ] Cookie und Tracking Audit nach Livegang noch einmal mit einem
  Tool wie [Webbkoll](https://webbkoll.dataskydd.net/) prüfen.
- [ ] TLS Konfiguration mit [SSL Labs](https://www.ssllabs.com/ssltest/)
  prüfen (Ziel: Note A).
- [ ] Backup und Patch Strategie beim Hoster sicherstellen.

### Berufshaftpflicht

Bei der Übergabe an den Endkunden empfiehlt sich ein klarer
Werkvertrag mit Leistungsbeschreibung, Haftungsbegrenzung und
Übertragung der Nutzungsrechte (urheberrechtlich) am ausgelieferten
Code. So sind sowohl Du als auch der Endkunde sauber abgesichert.

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
└── brand/                      # Kundenlogo & Favicon (siehe brand/README.md)
```
