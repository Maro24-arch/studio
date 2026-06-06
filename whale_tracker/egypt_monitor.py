"""
Egypt World Cup Odds Monitor
-----------------------------
Polls Polymarket every CHECK_INTERVAL seconds and sends a push notification
(via ntfy.sh) + optional email whenever Egypt's win percentage changes.

Setup:
  1. Copy .env.example → .env and fill in your values.
  2. pip install -r requirements.txt
  3. Subscribe to your NTFY_TOPIC on https://ntfy.sh or the ntfy mobile app.
  4. python egypt_monitor.py
"""

import json
import logging
import os
import smtplib
import time
from datetime import datetime, timezone
from email.mime.text import MIMEText

import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config (from .env or environment variables)
# ---------------------------------------------------------------------------

GAMMA_API = "https://gamma-api.polymarket.com"
EVENT_SLUG = os.getenv("POLYMARKET_EVENT_SLUG", "world-cup-winner")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL_SEC", "60"))

NTFY_TOPIC = os.getenv("NTFY_TOPIC", "egypt-wc-tracker")
NTFY_URL = f"https://ntfy.sh/{NTFY_TOPIC}"

EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
EMAIL_FROM = os.getenv("EMAIL_FROM", "")
EMAIL_TO = os.getenv("EMAIL_TO", "marwansalem24@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

MIN_CHANGE_PCT = float(os.getenv("MIN_CHANGE_PCT", "0.1"))  # notify if Δ ≥ 0.1 pp


# ---------------------------------------------------------------------------
# Polymarket fetch
# ---------------------------------------------------------------------------

def _find_egypt_in_single_market(market: dict) -> float | None:
    """
    Handles a multi-outcome market (e.g. 'Who wins the World Cup?')
    where outcomes list contains country names.
    """
    try:
        outcomes = json.loads(market.get("outcomes", "[]"))
        prices = json.loads(market.get("outcomePrices", "[]"))
        for i, outcome in enumerate(outcomes):
            if "egypt" in str(outcome).lower():
                return float(prices[i]) * 100
    except (json.JSONDecodeError, IndexError, ValueError):
        pass
    return None


def _find_yes_price(market: dict) -> float | None:
    """
    Handles a binary Yes/No market — returns the Yes price as a percentage.
    """
    try:
        outcomes = json.loads(market.get("outcomes", "[]"))
        prices = json.loads(market.get("outcomePrices", "[]"))
        for i, outcome in enumerate(outcomes):
            if str(outcome).lower() == "yes":
                return float(prices[i]) * 100
    except (json.JSONDecodeError, IndexError, ValueError):
        pass
    return None


def fetch_egypt_pct() -> float | None:
    """
    Returns Egypt's current win probability as a percentage (0–100),
    or None if not found.
    """
    try:
        resp = requests.get(
            f"{GAMMA_API}/events",
            params={"slug": EVENT_SLUG},
            headers={"Accept": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        events = resp.json()
    except requests.RequestException as exc:
        log.error("API request failed: %s", exc)
        return None

    if not events:
        log.warning("No events returned for slug '%s'", EVENT_SLUG)
        return None

    event = events[0] if isinstance(events, list) else events
    markets = event.get("markets", [])

    for market in markets:
        question = market.get("question", "").lower()
        title = market.get("groupItemTitle", "").lower()
        slug = market.get("marketMakerAddress", "").lower()

        # Binary market dedicated to Egypt
        if "egypt" in question or "egypt" in title:
            pct = _find_yes_price(market)
            if pct is not None:
                return round(pct, 3)

        # Multi-outcome market containing Egypt as one choice
        if "world cup" in question or not question:
            pct = _find_egypt_in_single_market(market)
            if pct is not None:
                return round(pct, 3)

    log.warning("Egypt not found in event markets. Markets available: %s",
                [m.get("question", "?")[:60] for m in markets[:10]])
    return None


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

def notify_ntfy(title: str, body: str, priority: str = "high") -> None:
    try:
        requests.post(
            NTFY_URL,
            data=body.encode("utf-8"),
            headers={
                "Title": title,
                "Priority": priority,
                "Tags": "egypt,soccer,polymarket,chart_with_upwards_trend",
            },
            timeout=10,
        )
        log.info("ntfy notification sent → %s", NTFY_URL)
    except requests.RequestException as exc:
        log.error("ntfy failed: %s", exc)


def notify_email(subject: str, body: str) -> None:
    if not EMAIL_ENABLED or not EMAIL_FROM or not EMAIL_PASSWORD:
        return
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = EMAIL_TO

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_FROM, EMAIL_PASSWORD)
            smtp.send_message(msg)
        log.info("Email sent to %s", EMAIL_TO)
    except Exception as exc:
        log.error("Email failed: %s", exc)


def notify(old_pct: float | None, new_pct: float) -> None:
    if old_pct is None:
        return

    delta = new_pct - old_pct
    if abs(delta) < MIN_CHANGE_PCT:
        return

    arrow = "📈" if delta > 0 else "📉"
    title = f"{arrow} Egypt World Cup odds changed"
    body = (
        f"{arrow} Egypt: {old_pct:.2f}% → {new_pct:.2f}%  "
        f"({'+'if delta>0 else ''}{delta:.2f} pp)\n"
        f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n"
        f"https://polymarket.com/event/{EVENT_SLUG}"
    )

    log.info("Change detected: %s", body.splitlines()[0])
    notify_ntfy(title, body)
    notify_email(title, body)


# ---------------------------------------------------------------------------
# Monitor loop
# ---------------------------------------------------------------------------

def run() -> None:
    log.info("Egypt World Cup monitor started")
    log.info("Polling every %ds  |  ntfy topic: %s", CHECK_INTERVAL, NTFY_TOPIC)
    log.info("Subscribe at: https://ntfy.sh/%s", NTFY_TOPIC)

    last_pct: float | None = None

    while True:
        pct = fetch_egypt_pct()

        if pct is not None:
            notify(last_pct, pct)
            log.info("Egypt: %.3f%%  (prev: %s)", pct,
                     f"{last_pct:.3f}%" if last_pct is not None else "—")
            last_pct = pct
        else:
            log.warning("Could not retrieve Egypt's percentage this round.")

        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    run()
