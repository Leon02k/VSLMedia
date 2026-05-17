# Brand Assets

Hier kommt das Kundenlogo rein. Die Website lädt die Dateien
automatisch — sobald sie hier liegen, ersetzt das Logo den Text-Schriftzug
in der Navigation und im Footer.

## Erwartete Dateien

Lege **eine** der folgenden Dateien hier ab. Die Website probiert sie
in dieser Reihenfolge:

| Datei | Verwendung | Empfehlung |
| --- | --- | --- |
| `logo.svg` | Header und Footer | **Bevorzugt** — skaliert verlustfrei |
| `logo.png` | Fallback, falls kein SVG vorliegt | Transparenter Hintergrund, mind. 512 × 128 px |
| `favicon.svg` | Browser-Tab-Icon | Quadratisch, einfache Form |
| `favicon.ico` | Fallback für ältere Browser | 32 × 32 px |

## Vorgaben

- **Format**: am liebsten SVG (skaliert, klein, scharf auf jedem Display)
- **Hintergrund**: transparent
- **Farbe**: helle Variante (das Logo erscheint auf dunklem Hintergrund).
  Falls nur eine dunkle Version existiert, einfach trotzdem als `logo.svg`
  ablegen — die CSS-Klasse `nav__logo-img` invertiert nicht automatisch,
  bei Bedarf kannst du in `styles.css` `filter: invert(1)` ergänzen.
- **Höhe**: Logo wird auf ca. 28 px Höhe skaliert. Breite proportional.

## Rechtliches

Bitte nur Logos hochladen, für die der Auftraggeber die Nutzungsrechte
hat. Logo-Dateien werden Teil des Repositories — vermeide also
proprietäre Schriftarten als Vektorpfade, wenn deren Lizenz das nicht
erlaubt. Im Idealfall liefert der Kunde eine bereits in Pfade
konvertierte SVG-Datei.
