# market_data.py — fetches historical stock prices from Yahoo Finance

import yfinance as yf
import pandas as pd
from typing import List
import time

def fetch_prices(tickers: list, period: str = "1y") -> pd.DataFrame:
    """
    Fetch prices in batches of 50 to avoid Yahoo Finance rate limiting.
    Supports 500+ tickers by splitting into multiple requests.
    """
    BATCH_SIZE = 50
    all_prices = []

    # Split tickers into chunks of 50
    batches = [tickers[i:i+BATCH_SIZE] for i in range(0, len(tickers), BATCH_SIZE)]

    for batch in batches:
        data = yf.download(batch, period=period, auto_adjust=True, progress=False)
        prices = data["Close"]
        if isinstance(prices, pd.Series):
            prices = prices.to_frame(name=batch[0])
        all_prices.append(prices)

        # Be polite to Yahoo Finance — pause between batches
        if len(batches) > 1:
            time.sleep(0.5)

    # Merge all batches into one DataFrame by date
    combined = pd.concat(all_prices, axis=1)
    return combined.dropna(how="all")


def fetch_current_price(ticker: str) -> float:
    """
    Fetch just the latest price for a single ticker.
    Used for displaying current portfolio value.
    """
    stock = yf.Ticker(ticker)

    return stock.fast_info["last_price"]