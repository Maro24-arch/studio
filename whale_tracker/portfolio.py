"""
Portfolio simulator.

Every time one of the tracked whales places a trade we 'copy' it
by opening a €100 simulated position at the same odds.
P&L is computed as:
  - Open position:  (current_price / entry_odds - 1) * stake
  - Resolved win:   (1 / entry_odds - 1) * stake   (i.e. we got paid 1/odds per €)
  - Resolved loss:  -stake
"""

from __future__ import annotations

import hashlib
import threading
from datetime import datetime, timezone
from typing import Optional

_lock = threading.Lock()
_positions: list[dict] = []          # all simulated bets
_market_prices: dict[str, float] = {}  # market -> latest price (0-1)

STAKE_EUR = 100.0


def _position_id(trade: dict) -> str:
    key = f"{trade['wallet']}|{trade['market']}|{trade['position']}|{trade['timestamp']}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def record_trade(trade: dict) -> Optional[dict]:
    """
    Open a €100 simulated position mirroring *trade*.
    Returns the new position dict, or None if already recorded.
    """
    pid = _position_id(trade)
    with _lock:
        if any(p["id"] == pid for p in _positions):
            return None

        position = {
            "id": pid,
            "wallet": trade["wallet"],
            "market": trade["market"],
            "position": trade["position"],
            "entry_odds": trade["odds"],        # probability (0-1)
            "current_price": trade["odds"],     # updated by update_prices()
            "stake_eur": STAKE_EUR,
            "status": "open",                   # open | won | lost
            "pnl_eur": 0.0,
            "opened_at": trade["timestamp"],
            "resolved_at": None,
        }
        _positions.append(position)
        return position


def update_price(market: str, new_price: float) -> None:
    """Update the live market price and recalculate P&L for open positions."""
    with _lock:
        _market_prices[market] = new_price
        for p in _positions:
            if p["market"] == market and p["status"] == "open":
                p["current_price"] = new_price
                _recalc_pnl(p)


def resolve_position(market: str, winning_side: str) -> None:
    """Mark all open positions in *market* as won or lost."""
    with _lock:
        for p in _positions:
            if p["market"] == market and p["status"] == "open":
                if p["position"] == winning_side:
                    p["status"] = "won"
                    p["pnl_eur"] = p["stake_eur"] * (1 / p["entry_odds"] - 1)
                else:
                    p["status"] = "lost"
                    p["pnl_eur"] = -p["stake_eur"]
                p["resolved_at"] = datetime.now(timezone.utc).isoformat()


def _recalc_pnl(p: dict) -> None:
    """In-place P&L for an open position (call under _lock)."""
    if p["status"] != "open":
        return
    # Fractional P&L: if the market moved in our favour we're in profit.
    # pnl = stake * (current_price / entry_price - 1)
    entry = p["entry_odds"]
    current = p["current_price"]
    if entry <= 0:
        return
    p["pnl_eur"] = round(p["stake_eur"] * (current / entry - 1), 2)


def get_snapshot() -> dict:
    """Return a snapshot safe to serialise as JSON."""
    with _lock:
        positions = [dict(p) for p in _positions]

    total_pnl = sum(p["pnl_eur"] for p in positions)
    total_staked = sum(p["stake_eur"] for p in positions)
    open_count = sum(1 for p in positions if p["status"] == "open")
    won_count = sum(1 for p in positions if p["status"] == "won")
    lost_count = sum(1 for p in positions if p["status"] == "lost")

    return {
        "positions": positions,
        "summary": {
            "total_pnl_eur": round(total_pnl, 2),
            "total_staked_eur": round(total_staked, 2),
            "open": open_count,
            "won": won_count,
            "lost": lost_count,
            "roi_pct": round(total_pnl / total_staked * 100, 2) if total_staked else 0,
        },
    }
