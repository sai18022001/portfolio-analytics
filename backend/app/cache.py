# cache.py — Redis helper functions

import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

try:
    redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
    redis_client.ping()  
    REDIS_AVAILABLE = True
    print("Redis connected")
except Exception:
    REDIS_AVAILABLE = False
    print("Redis not available — caching disabled")


def make_cache_key(tickers: list, period: str) -> str:
    """
    Build a unique string key for a given portfolio request.
    e.g. ["AAPL", "MSFT"] + "1y" → "analytics:AAPL-MSFT:1y"

    Sorting tickers ensures AAPL+MSFT and MSFT+AAPL use the same cache key.
    """
    ticker_str = "-".join(sorted(tickers))
    return f"analytics:{ticker_str}:{period}"


def get_cached(key: str):
    """Try to get a cached result. Returns None if not found."""
    if not REDIS_AVAILABLE:
        return None
    value = redis_client.get(key)
    if value:
        return json.loads(value)   # Redis stores strings, so we parse JSON back
    return None


def set_cache(key: str, value: dict, ttl_seconds: int = 3600):
    """
    Store a result in Redis.
    ttl_seconds=3600 means it expires after 1 hour automatically.
    After 1 hour Redis deletes it and the next request re-fetches fresh data.
    """
    if not REDIS_AVAILABLE:
        return
    redis_client.setex(key, ttl_seconds, json.dumps(value))