#!/usr/bin/env bash
# Start the Polymarket Whale Tracker
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 1. Python virtual environment ──────────────────────────────
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment…"
  python3 -m venv .venv
fi

# shellcheck source=/dev/null
source .venv/bin/activate

# ── 2. Install / update dependencies ───────────────────────────
echo "Installing dependencies…"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# ── 3. Launch ──────────────────────────────────────────────────
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  🐋  Polymarket Whale Tracker            ║"
echo "  ║  http://127.0.0.1:5000                   ║"
echo "  ║  Ctrl-C to stop                          ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

python app.py
