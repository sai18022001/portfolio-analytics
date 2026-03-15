from app.core.market_data import fetch_prices
from app.core.analytics import run_full_analysis

# Test with a simple 3-stock portfolio
tickers = ["AAPL", "MSFT", "GOOGL"]
weights = {"AAPL": 0.5, "MSFT": 0.3, "GOOGL": 0.2}

print("Fetching prices...")
prices = fetch_prices(tickers, period="1y")
print(f"Got {len(prices)} days of data")
print(prices.tail(3))  # show last 3 rows

print("\nRunning analytics...")
results = run_full_analysis(prices, weights)

print(f"\nSharpe Ratio:  {results['sharpe_ratio']}")
print(f"Volatility:    {results['volatility']}")
print(f"Max Drawdown:  {results['max_drawdown']}")
print(f"Annual Return: {results['annual_return']}")
print(f"Sectors:       {results['sector_exposure']}")