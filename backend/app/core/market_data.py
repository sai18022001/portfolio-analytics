# market_data.py — fetches historical stock prices from Yahoo Finance

import yfinance as yf
import pandas as pd
from typing import List

def fetch_prices(tickers: List[str], period: str = "1y") -> pd.DataFrame:
    """
    Fetch historical closing prices for a list of stock tickers.

    Args:
        tickers: e.g. ["AAPL", "TSLA", "GOOGL"]
        period:  how far back to go — "1y" = 1 year, "6mo", "2y", etc.

    Returns:
        A DataFrame where:
        - each ROW is a date
        - each COLUMN is a ticker
        - each VALUE is the closing price on that date
    """
    
    data = yf.download(tickers, period=period, auto_adjust=True, progress=False)

    prices = data["Close"]

    if isinstance(prices, pd.Series):
        prices = prices.to_frame(name=tickers[0])

    prices = prices.dropna(how="all")

    return prices


def fetch_current_price(ticker: str) -> float:
    """
    Fetch just the latest price for a single ticker.
    Used for displaying current portfolio value.
    """
    stock = yf.Ticker(ticker)

    return stock.fast_info["last_price"]