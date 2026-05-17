#!/usr/bin/env bash
# Lädt die auf Higgsfield AI generierten Case-Bilder einmalig herunter,
# damit sie aus dem eigenen Webroot (./images) ausgeliefert werden können.
# Hintergrund: für DSGVO-konforme Auslieferung dürfen keine Bilder von
# Drittanbieter-CDNs (z. B. Cloudfront) live nachgeladen werden.

set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p images

declare -A IMAGES=(
  ["case-saas.webp"]="https://d8j0ntlcm91z4.cloudfront.net/user_39nYvHWaiwgae0RXSqiN7ODe4rK/hf_20260517_094847_c7540f4c-0da3-42ef-bcec-cbf271211ccb_min.webp"
  ["case-dtc.webp"]="https://d8j0ntlcm91z4.cloudfront.net/user_39nYvHWaiwgae0RXSqiN7ODe4rK/hf_20260517_094854_5bc4f8f0-eb5f-4855-b659-e1a654c8bbe5_min.webp"
  ["case-brand.webp"]="https://d8j0ntlcm91z4.cloudfront.net/user_39nYvHWaiwgae0RXSqiN7ODe4rK/hf_20260517_094901_3480a1d0-86ae-487b-a087-bfead12c024d_min.webp"
  ["case-fintech.webp"]="https://d8j0ntlcm91z4.cloudfront.net/user_39nYvHWaiwgae0RXSqiN7ODe4rK/hf_20260517_094908_77e6edb5-921a-4375-b3a2-7ee63e730fa3_min.webp"
)

echo "Lade Case-Bilder nach ./images/ …"
for name in "${!IMAGES[@]}"; do
  url="${IMAGES[$name]}"
  if [ -f "images/$name" ]; then
    echo "  ✓ images/$name bereits vorhanden — übersprungen"
    continue
  fi
  echo "  → images/$name"
  curl -fsSL -o "images/$name" "$url"
done

echo "Fertig."
