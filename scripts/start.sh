#!/usr/bin/env bash
# Start both the API server (:3001) and the Vite client dev server together.
# Ctrl+C stops both.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$ROOT/server/.env" ]; then
  echo "⚠  server/.env not found — the AI summary needs OPENAI_API_KEY."
  echo "   Copy server/.env.example to server/.env and fill it in."
fi

pids=()
cleanup() {
  trap - INT TERM EXIT
  echo
  echo "Stopping servers..."
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

(cd "$ROOT/server" && exec pnpm dev) &
pids+=($!)

(cd "$ROOT/client" && exec pnpm dev) &
pids+=($!)

echo "API:    http://localhost:3001"
echo "Client: http://localhost:5173"
echo "Press Ctrl+C to stop both."
wait
