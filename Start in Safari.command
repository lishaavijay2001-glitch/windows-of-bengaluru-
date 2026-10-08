#!/bin/bash
# Double-click to open The Windows of Bengaluru in Safari.
# It runs a tiny local web server, which browsers need for the webcam and the full audio effect.
# Leave this window open while you play; close it to stop.
cd "$(dirname "$0")"
PORT=5173
URL="http://localhost:$PORT/windows-of-bengaluru.html"
APP="Safari"

open_page() { if [ -n "$APP" ]; then open -a "$APP" "$URL"; else open "$URL"; fi; }

# Already running (e.g. from an earlier double-click)? Just open the page.
if curl -s -o /dev/null "http://localhost:$PORT/windows-of-bengaluru.html"; then open_page; exit 0; fi

echo ""
echo "  The Windows of Bengaluru"
echo "  $URL"
echo "  (keep this window open while you play; close it to stop)"
echo ""
( sleep 1.5; open_page ) &

# Use whatever the Mac already has, without triggering a developer-tools install prompt.
PY="$(command -v python3)"
if [ -n "$PY" ] && { [ "$PY" != "/usr/bin/python3" ] || xcode-select -p >/dev/null 2>&1; }; then
  exec "$PY" -m http.server $PORT --bind 127.0.0.1
elif /usr/bin/ruby -e 'require "webrick"' >/dev/null 2>&1; then
  exec /usr/bin/ruby -run -e httpd . -p $PORT -b 127.0.0.1
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l $PORT .
else
  echo "Couldn't start a local server on this Mac."
  echo "Install Python from python.org (or run: xcode-select --install), then double-click again."
  read -n 1 -s -r -p "Press any key to close."
fi
