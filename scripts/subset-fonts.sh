#!/usr/bin/env bash
# Downloads the brand fonts (full TTF) from Google Fonts and subsets them to
# Latin + the clinical symbols we use (≥ ≤ → ± ° ⁺ ² ′ ✓ ✕ ·), writing WOFF2
# files to static/assets/fonts. Self-hosting avoids a third-party request
# (faster LCP, no IP transfer to Google — relevant under GDPR).
# Requires: curl, python3 with fonttools + brotli (pip install fonttools brotli)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=static/assets/fonts
TMP=$(mktemp -d)
mkdir -p "$OUT"
UA="Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko)"
UNICODES="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2070-209F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+00B1,U+00B0,U+2713,U+2715,U+25CF,U+FEFF,U+FFFD"

fetch() { # family-css-spec weight outname
  local url
  url=$(curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=$1" | grep -o 'https://[^)]*\.ttf' | head -1)
  curl -sS -o "$TMP/$3.ttf" "$url"
  python3 -m fontTools.subset "$TMP/$3.ttf" --unicodes="$UNICODES" \
    --layout-features='kern,liga,calt,tnum,case,ss01,ss02' --flavor=woff2 \
    --output-file="$OUT/$3.woff2"
  echo "$3: $(wc -c < "$OUT/$3.woff2") bytes"
}

fetch "Space+Grotesk:wght@500" 500 space-grotesk-500
fetch "Space+Grotesk:wght@600" 600 space-grotesk-600
fetch "Inter:wght@400" 400 inter-400
fetch "Inter:wght@500" 500 inter-500
fetch "JetBrains+Mono:wght@400" 400 jetbrains-mono-400
fetch "JetBrains+Mono:wght@500" 500 jetbrains-mono-500
rm -rf "$TMP"
