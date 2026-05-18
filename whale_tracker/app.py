"""
Flask backend for the Polymarket Whale Tracker.

Endpoints:
  GET /               → dashboard HTML
  GET /api/state      → full JSON state (whales + trades + portfolio)
  GET /api/status     → scraper health info

Background threads:
  - whale_init_thread  : fetches top-5 whales once on startup
  - poll_thread        : polls trade history every POLL_INTERVAL seconds
"""

import logging
import random
import threading
import time
import webbrowser
from datetime import datetime, timezone

from flask import Flask, jsonify, render_template
from flask_cors import CORS

import portfolio
import scraper

# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s – %(message)s",
)
log = logging.getLogger(__name__)

POLL_INTERVAL = 60          # seconds between trade polls
PRICE_JITTER_INTERVAL = 15  # seconds between simulated price ticks

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Shared state (guarded by _state_lock)
# ---------------------------------------------------------------------------

_state_lock = threading.Lock()
_state = {
    "whales": [],            # list of whale dicts
    "trades": [],            # chronological list of all observed trades
    "scraper_status": "starting",   # starting | live | mock | error
    "last_poll": None,
    "next_poll": None,
}

_seen_trade_ids: set[str] = set()   # deduplicate trades across polls


# ---------------------------------------------------------------------------
# Background: initialise whale list
# ---------------------------------------------------------------------------

def _init_whales() -> None:
    log.info("Fetching top whales …")
    with _state_lock:
        _state["scraper_status"] = "starting"

    whales = scraper.get_top_whales()
    status = "mock" if _is_mock(whales) else "live"

    with _state_lock:
        _state["whales"] = whales
        _state["scraper_status"] = status

    log.info("Loaded %d whales (status=%s)", len(whales), status)

    # Seed initial trades immediately after whale list is known
    _poll_trades()


def _is_mock(whales: list[dict]) -> bool:
    mock_addresses = {w["address"] for w in scraper._mock_whales()}
    return any(w["address"] in mock_addresses for w in whales)


# ---------------------------------------------------------------------------
# Background: poll trades
# ---------------------------------------------------------------------------

def _poll_trades() -> None:
    with _state_lock:
        whales = list(_state["whales"])
        _state["last_poll"] = datetime.now(timezone.utc).isoformat()
        _state["next_poll"] = None  # will be set after sleep

    if not whales:
        log.info("No whales loaded yet, skipping poll.")
        return

    log.info("Polling trades for %d wallets …", len(whales))

    for whale in whales:
        addr = whale["address"]
        trades = scraper.get_wallet_trades(addr)

        for trade in trades:
            tid = f"{trade['wallet']}|{trade['market']}|{trade['timestamp']}"
            if tid in _seen_trade_ids:
                continue
            _seen_trade_ids.add(tid)

            # Record simulated position
            portfolio.record_trade(trade)

            with _state_lock:
                _state["trades"].insert(0, trade)
                # Keep last 200 trades in memory
                _state["trades"] = _state["trades"][:200]


def _poll_loop() -> None:
    # Wait until whales are initialised
    while True:
        with _state_lock:
            status = _state["scraper_status"]
        if status not in ("starting",):
            break
        time.sleep(1)

    while True:
        try:
            next_time = datetime.now(timezone.utc)
            next_time = next_time.replace(
                second=(next_time.second // POLL_INTERVAL + 1) * POLL_INTERVAL % 60
            )
            with _state_lock:
                _state["next_poll"] = (
                    datetime.now(timezone.utc).timestamp() + POLL_INTERVAL
                )
            time.sleep(POLL_INTERVAL)
            _poll_trades()
        except Exception:
            log.exception("Error in poll loop")
            time.sleep(10)


# ---------------------------------------------------------------------------
# Background: simulate live price movement for open positions
# ---------------------------------------------------------------------------

def _price_tick_loop() -> None:
    """Randomly drift open-position prices so the dashboard feels live."""
    while True:
        time.sleep(PRICE_JITTER_INTERVAL)
        try:
            snap = portfolio.get_snapshot()
            for pos in snap["positions"]:
                if pos["status"] != "open":
                    continue
                current = pos["current_price"]
                # Random walk clamped to [0.02, 0.98]
                delta = random.gauss(0, 0.015)
                new_price = max(0.02, min(0.98, current + delta))
                portfolio.update_price(pos["market"], round(new_price, 4))
        except Exception:
            log.exception("Error in price tick loop")


# ---------------------------------------------------------------------------
# Flask routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/state")
def api_state():
    with _state_lock:
        whales = list(_state["whales"])
        trades = list(_state["trades"])
        status = _state["scraper_status"]
        last_poll = _state["last_poll"]
        next_poll = _state["next_poll"]

    port_snapshot = portfolio.get_snapshot()

    return jsonify(
        {
            "whales": whales,
            "trades": trades[:50],  # last 50 for the feed
            "portfolio": port_snapshot,
            "scraper_status": status,
            "last_poll_utc": last_poll,
            "next_poll_in_s": (
                max(0, int(next_poll - datetime.now(timezone.utc).timestamp()))
                if next_poll
                else None
            ),
            "server_time_utc": datetime.now(timezone.utc).isoformat(),
        }
    )


@app.route("/api/status")
def api_status():
    with _state_lock:
        return jsonify(
            {
                "status": _state["scraper_status"],
                "whales_loaded": len(_state["whales"]),
                "trades_seen": len(_state["trades"]),
            }
        )


# ---------------------------------------------------------------------------
# Start-up
# ---------------------------------------------------------------------------

def _start_background_threads() -> None:
    threading.Thread(target=_init_whales, daemon=True, name="whale-init").start()
    threading.Thread(target=_poll_loop, daemon=True, name="poll-loop").start()
    threading.Thread(target=_price_tick_loop, daemon=True, name="price-tick").start()


if __name__ == "__main__":
    _start_background_threads()

    # Open browser after a short delay so Flask is ready
    def _open_browser():
        time.sleep(1.5)
        webbrowser.open("http://127.0.0.1:5000")

    threading.Thread(target=_open_browser, daemon=True).start()

    log.info("Starting Flask on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
