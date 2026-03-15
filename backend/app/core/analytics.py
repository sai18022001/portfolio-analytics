# analytics.py — calculates all portfolio risk and return metrics

import numpy as np
import pandas as pd
from typing import List, Dict

RISK_FREE_RATE = 0.04


def calculate_daily_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """
    Convert prices to daily percentage returns.

    Why? Because raw prices ($185, $186) aren't useful for math.
    Returns (0.54%) are — they tell you how much you gained/lost each day.

    Formula: return_today = (price_today - price_yesterday) / price_yesterday
    pandas .pct_change() does exactly this for every row automatically.

    """
    return prices.pct_change().dropna()


def calculate_portfolio_returns(
    daily_returns: pd.DataFrame,
    weights: Dict[str, float]
) -> pd.Series:
    """
    Combine individual stock returns into one portfolio return series.

    weights is like: {"AAPL": 0.5, "TSLA": 0.3, "GOOGL": 0.2}
    (must sum to 1.0)

    Each day's portfolio return = sum of (each stock's return × its weight)
    e.g. if AAPL returned 1% and has 50% weight it contributes 0.5% to portfolio
    """
    weight_array = np.array([weights[ticker] for ticker in daily_returns.columns])

    portfolio_returns = daily_returns.values @ weight_array

    return pd.Series(portfolio_returns, index=daily_returns.index)


def calculate_sharpe_ratio(portfolio_returns: pd.Series) -> float:
    """
    Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Portfolio Volatility

    This answers: "How much return am I getting per unit of risk?"
    - Sharpe > 1: good
    - Sharpe > 2: very good
    - Sharpe < 0: you'd be better off in Treasury bonds

    We annualize everything (multiply by sqrt(252)) because:
    - Daily returns × 252 trading days = annual return
    - Daily volatility × sqrt(252) = annual volatility
    """
    annual_return = portfolio_returns.mean() * 252

    annual_volatility = portfolio_returns.std() * np.sqrt(252)

    if annual_volatility == 0:
        return 0.0

    sharpe = (annual_return - RISK_FREE_RATE) / annual_volatility
    return round(float(sharpe), 4)


def calculate_volatility(portfolio_returns: pd.Series) -> float:
    """
    Volatility = annualized standard deviation of daily returns.

    This measures how much your portfolio value swings around.
    Higher volatility = more risk.
    e.g. 0.20 means the portfolio typically moves ±20% per year.
    """
    annual_vol = portfolio_returns.std() * np.sqrt(252)
    return round(float(annual_vol), 4)


def calculate_max_drawdown(portfolio_returns: pd.Series) -> float:
    """
    Max Drawdown = the biggest peak-to-trough loss in the period.

    e.g. -0.35 means at worst, the portfolio fell 35% from its peak.
    This is what investors actually feel — "I was up $100k, now I'm down to $65k."

    How it works:
    1. Build a cumulative return curve (portfolio value over time)
    2. Track the running peak (highest point so far)
    3. At each point, calculate how far below the peak you are
    4. The worst of those = max drawdown
    """
    cumulative = (1 + portfolio_returns).cumprod()

    running_peak = cumulative.cummax()

    drawdown = (cumulative - running_peak) / running_peak

    max_dd = drawdown.min()  # most negative value = worst drawdown
    return round(float(max_dd), 4)


def calculate_sector_exposure(
    tickers: List[str],
    weights: Dict[str, float]
) -> Dict[str, float]:
    """
    Groups holdings by sector and sums their weights.

    Returns something like:
    {"Technology": 0.60, "Healthcare": 0.25, "Energy": 0.15}

    We use a hardcoded map here for simplicity.
    In production you'd fetch this from a financial data API.
    """
    sector_map = {
        "AAPL": "Technology", "MSFT": "Technology", "GOOGL": "Technology",
        "AMZN": "Consumer Cyclical", "TSLA": "Consumer Cyclical",
        "JPM": "Financials", "BAC": "Financials", "GS": "Financials",
        "JNJ": "Healthcare", "PFE": "Healthcare", "UNH": "Healthcare",
        "XOM": "Energy", "CVX": "Energy",
        "META": "Technology", "NVDA": "Technology",
    }

    sector_weights: Dict[str, float] = {}
    for ticker in tickers:
        sector = sector_map.get(ticker, "Other")
        sector_weights[sector] = sector_weights.get(sector, 0) + weights.get(ticker, 0)

    return sector_weights


def calculate_correlation_matrix(daily_returns: pd.DataFrame) -> Dict:
    """
    Correlation matrix shows how stocks move relative to each other.
    Values range from -1 to +1:
    - +1: they always move together (bad for diversification)
    -  0: no relationship
    - -1: they always move opposite (great for hedging)

    Returns a dict that can be serialized to JSON for the frontend.
    """
    corr = daily_returns.corr().round(3)
    return corr.to_dict()


def run_full_analysis(
    prices: pd.DataFrame,
    weights: Dict[str, float]
) -> Dict:
    """
    Master function — runs everything and returns one big result dict.
    This is what the API route will call.
    """
    tickers = list(weights.keys())
    daily_returns = calculate_daily_returns(prices)
    portfolio_returns = calculate_portfolio_returns(daily_returns, weights)

    return {
        "sharpe_ratio": calculate_sharpe_ratio(portfolio_returns),
        "volatility": calculate_volatility(portfolio_returns),
        "max_drawdown": calculate_max_drawdown(portfolio_returns),
        "annual_return": round(float(portfolio_returns.mean() * 252), 4),
        "sector_exposure": calculate_sector_exposure(tickers, weights),
        "correlation_matrix": calculate_correlation_matrix(daily_returns),
    }