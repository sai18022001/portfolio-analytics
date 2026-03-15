# celery_worker.py — background task scheduler
#
# What is Celery? It's a task queue for Python.
# Instead of making the user wait while you fetch prices,
# you schedule a background job that runs every hour automatically.
#
# How it works:
# 1. Celery worker runs as a separate process
# 2. Every hour it wakes up and fetches fresh prices for all tracked tickers
# 3. It stores them in PostgreSQL so the API can read them quickly
# 4. Redis acts as the "broker" — the message queue between your app and Celery

from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Create the Celery app
# broker = where tasks are queued (Redis)
# backend = where task results are stored (also Redis)
celery_app = Celery(
    "portfolio_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

# Schedule: run refresh_prices every hour
celery_app.conf.beat_schedule = {
    "refresh-prices-every-hour": {
        "task": "app.tasks.celery_worker.refresh_prices",
        "schedule": crontab(minute=0),  # top of every hour
    }
}


@celery_app.task
def refresh_prices():
    """
    Background task — fetches latest prices for common tickers
    and stores them in PostgreSQL.
    Runs automatically every hour via Celery Beat.
    """
    from app.core.market_data import fetch_prices

    # Tickers to keep fresh — in production this would come from the DB
    tickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "JPM", "JNJ", "NVDA", "AMZN"]

    try:
        prices = fetch_prices(tickers, period="5d")  # last 5 days
        print(f"Refreshed prices for {tickers} — {len(prices)} rows")
        return {"status": "success", "tickers": tickers}
    except Exception as e:
        print(f"Price refresh failed: {e}")
        return {"status": "error", "message": str(e)}