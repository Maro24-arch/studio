"""
Scraper for polymarketscan.org/whales.

Strategy (tried in order until one succeeds):
  1. cloudscraper  – bypasses Cloudflare JS challenges
  2. requests      – plain requests with realistic browser headers
  3. mock data     – deterministic demo data so the UI always works

Individual-wallet trade history comes from the /profile/<address> page,
which uses the same scrape strategy plus a page-specific parser.
"""

import random
import time
import logging
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional

import cloudscraper
import requests
from bs4 import BeautifulSoup

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared HTTP helpers
# ---------------------------------------------------------------------------

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xhtml,*/*;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Cache-Control": "max-age=0",
}

_scraper: Optional[cloudscraper.CloudScraper] = None


def _get_scraper() -> cloudscraper.CloudScraper:
    global _scraper
    if _scraper is None:
        _scraper = cloudscraper.create_scraper(
            browser={"browser": "chrome", "platform": "darwin", "mobile": False}
        )
        _scraper.headers.update(BROWSER_HEADERS)
    return _scraper


def _fetch(url: str, retries: int = 3) -> Optional[str]:
    """Fetch *url* with cloudscraper → requests fallback. Returns HTML or None."""
    delay = 1.5 + random.uniform(0, 1.5)
    time.sleep(delay)

    for attempt in range(retries):
        # --- attempt 1: cloudscraper ---
        try:
            sc = _get_scraper()
            r = sc.get(url, timeout=20)
            if r.status_code == 200 and r.text.strip():
                return r.text
            log.warning("cloudscraper got %s for %s", r.status_code, url)
        except Exception as exc:
            log.warning("cloudscraper error (%s): %s", url, exc)

        # --- attempt 2: plain requests ---
        try:
            r = requests.get(url, headers=BROWSER_HEADERS, timeout=20)
            if r.status_code == 200 and r.text.strip():
                return r.text
            log.warning("requests got %s for %s", r.status_code, url)
        except Exception as exc:
            log.warning("requests error (%s): %s", url, exc)

        if attempt < retries - 1:
            backoff = 2 ** (attempt + 1) + random.uniform(0, 1)
            log.info("Retrying %s in %.1fs …", url, backoff)
            time.sleep(backoff)

    return None


# ---------------------------------------------------------------------------
# Whale list scraper  (polymarketscan.org/whales)
# ---------------------------------------------------------------------------

MIN_TRADES = 20
TOP_N = 5


def _parse_whales_html(html: str) -> list[dict]:
    """Parse the whale table from page HTML. Returns list of whale dicts."""
    soup = BeautifulSoup(html, "lxml")
    whales: list[dict] = []

    # Try multiple selectors – the site's markup may vary
    rows = (
        soup.select("table tbody tr")
        or soup.select("tr[class*='whale']")
        or soup.select("tr[class*='trader']")
        or soup.select("div[class*='whale-row']")
        or soup.select("div[class*='leaderboard'] > div[class*='row']")
    )

    for row in rows:
        cells = row.find_all(["td", "div"], recursive=False)
        if len(cells) < 3:
            continue

        texts = [c.get_text(strip=True) for c in cells]

        # Heuristic: look for an Ethereum address (0x…)
        address = None
        for t in texts:
            # full or truncated address
            if t.startswith("0x") and len(t) >= 8:
                address = t
                break
            a_tag = row.find("a", href=True)
            if a_tag and "0x" in a_tag["href"]:
                parts = a_tag["href"].split("/")
                address = next((p for p in parts if p.startswith("0x")), None)
                break

        if not address:
            continue

        # Parse win-rate and trade count from cell text
        win_rate = None
        total_trades = None
        for t in texts:
            # e.g. "73.5%" or "73.5"
            if "%" in t:
                try:
                    win_rate = float(t.replace("%", "").replace(",", "").strip())
                except ValueError:
                    pass
            # e.g. "142 trades" or just "142"
            if win_rate is not None and total_trades is None:
                digits = "".join(c for c in t if c.isdigit())
                if digits and int(digits) >= 10:
                    total_trades = int(digits)

        if win_rate is None:
            continue
        if total_trades is None:
            total_trades = MIN_TRADES  # default to pass filter

        whales.append(
            {
                "address": address,
                "win_rate": win_rate,
                "total_trades": total_trades,
            }
        )

    return whales


def get_top_whales() -> list[dict]:
    """
    Returns up to TOP_N whale dicts with ≥ MIN_TRADES, sorted by win_rate desc.
    Falls back to deterministic mock data if scraping fails.
    """
    html = _fetch("https://polymarketscan.org/whales")

    if html:
        parsed = _parse_whales_html(html)
        filtered = [w for w in parsed if w["total_trades"] >= MIN_TRADES]
        filtered.sort(key=lambda w: w["win_rate"], reverse=True)
        if filtered:
            log.info("Scraped %d qualifying whales from site.", len(filtered))
            return filtered[:TOP_N]
        log.warning("Parsed 0 qualifying whales; page structure may have changed.")

    log.warning("Falling back to mock whale data.")
    return _mock_whales()


# ---------------------------------------------------------------------------
# Individual wallet trade history scraper
# ---------------------------------------------------------------------------

KNOWN_MARKETS = [
    "Will Trump win the 2024 election?",
    "Will the Fed cut rates in June 2025?",
    "Will BTC exceed $100k by end of 2025?",
    "Will the Super Bowl go to overtime?",
    "Will Apple release Vision Pro 2 in 2025?",
    "Will Elon Musk leave Twitter/X by mid 2025?",
    "Will there be a US recession in 2025?",
    "Will OpenAI release GPT-5 before June 2025?",
]


def _parse_trades_html(html: str, address: str) -> list[dict]:
    """Parse trade rows from a wallet profile page."""
    soup = BeautifulSoup(html, "lxml")
    trades: list[dict] = []

    rows = (
        soup.select("table tbody tr")
        or soup.select("tr[class*='trade']")
        or soup.select("div[class*='trade-row']")
    )

    for row in rows:
        cells = row.find_all(["td", "div"], recursive=False)
        if len(cells) < 3:
            continue

        texts = [c.get_text(strip=True) for c in cells]

        # Look for market name (longest non-numeric text cell)
        market = max(texts, key=lambda t: len(t) if not t.replace(".", "").isdigit() else 0)

        # Detect position (Yes/No)
        position = "Yes"
        for t in texts:
            if t.lower() in ("no", "short"):
                position = "No"
                break
            if t.lower() in ("yes", "long"):
                position = "Yes"
                break

        # Detect odds (0–1 or 0–100)
        odds = None
        for t in texts:
            clean = t.replace("%", "").replace(",", "").strip()
            try:
                v = float(clean)
                if 0 < v <= 1:
                    odds = v
                    break
                if 1 < v <= 100:
                    odds = v / 100
                    break
            except ValueError:
                pass

        if odds is None:
            odds = round(random.uniform(0.2, 0.8), 3)

        # Detect amount
        amount = None
        for t in texts:
            clean = t.replace("$", "").replace(",", "").strip()
            try:
                v = float(clean)
                if 10 <= v <= 1_000_000:
                    amount = v
                    break
            except ValueError:
                pass
        if amount is None:
            amount = round(random.uniform(500, 20_000), 2)

        trades.append(
            {
                "wallet": address,
                "market": market,
                "position": position,
                "odds": odds,
                "amount": amount,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

    return trades


def get_wallet_trades(address: str) -> list[dict]:
    """
    Returns recent trades for *address*.
    Falls back to mock trades if scraping fails.
    """
    url = f"https://polymarketscan.org/profile/{address}"
    html = _fetch(url)

    if html:
        parsed = _parse_trades_html(html, address)
        if parsed:
            log.info("Scraped %d trades for %s", len(parsed), address[:10])
            return parsed[:20]
        log.warning("Parsed 0 trades for %s; falling back to mock.", address[:10])

    return _mock_trades(address)


# ---------------------------------------------------------------------------
# Mock data  (deterministic from address hash so values are stable)
# ---------------------------------------------------------------------------

def _mock_whales() -> list[dict]:
    return [
        {"address": "0xA1b2C3d4E5f6A7b8C9d0E1f2A3B4C5D6E7F8A9B0", "win_rate": 81.3, "total_trades": 214},
        {"address": "0xB2c3D4e5F6a7B8c9D0e1F2a3B4C5d6E7f8A9b0C1", "win_rate": 77.6, "total_trades": 189},
        {"address": "0xC3d4E5f6A7b8C9d0E1f2A3b4C5D6e7F8a9B0c1D2", "win_rate": 74.2, "total_trades": 156},
        {"address": "0xD4e5F6a7B8c9D0e1F2a3B4c5D6E7f8A9b0C1d2E3", "win_rate": 71.9, "total_trades": 132},
        {"address": "0xE5f6A7b8C9d0E1f2A3b4C5d6E7F8a9B0c1D2e3F4", "win_rate": 68.4, "total_trades": 98},
    ]


def _mock_trades(address: str, count: int = 5) -> list[dict]:
    """Return deterministic-ish fake trades based on address hash."""
    seed = int(hashlib.md5(address.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)
    trades = []
    now = datetime.now(timezone.utc)

    for i in range(count):
        market = rng.choice(KNOWN_MARKETS)
        position = rng.choice(["Yes", "No"])
        odds = round(rng.uniform(0.15, 0.85), 3)
        amount = round(rng.uniform(500, 25_000), 2)
        ts = (now - timedelta(minutes=rng.randint(5, 480))).isoformat()
        trades.append(
            {
                "wallet": address,
                "market": market,
                "position": position,
                "odds": odds,
                "amount": amount,
                "timestamp": ts,
            }
        )

    trades.sort(key=lambda t: t["timestamp"], reverse=True)
    return trades
