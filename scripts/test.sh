#!/usr/bin/env bash
# Run the server and client test suites. Both run even if one fails,
# and the script exits non-zero if either suite failed.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

status=0

echo "── server tests ──"
(cd "$ROOT/server" && pnpm test) || status=1

echo
echo "── client tests ──"
(cd "$ROOT/client" && pnpm test) || status=1

echo
if [ "$status" -eq 0 ]; then
  echo "✓ all tests passed"
else
  echo "✗ some tests failed"
fi
exit "$status"
