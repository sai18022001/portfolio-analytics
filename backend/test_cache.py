# test_cache.py — tests Redis caching through the actual API

import requests
import time
import json

API_URL = "http://127.0.0.1:8080/api/analytics"

# Same 489 tickers you already validated
raw_tickers = [
    "A", "AAPL", "ABBV", "ABNB", "ABT", "ACGL", "ACN", "ADBE", "ADI", "ADM", "ADP", "ADSK",
    "AEE", "AEP", "AES", "AFL", "AIG", "AIZ", "AJG", "AKAM", "ALB", "ALGN", "ALL", "ALLE",
    "AMAT", "AMD", "AME", "AMGN", "AMP", "AMT", "AMZN", "ANET", "AON", "AOS", "APA", "APD",
    "APH", "APP", "APTV", "ARE", "ATO", "AVB", "AVGO", "AVY", "AWK", "AXP", "AZO", "BA",
    "BAC", "BALL", "BAX", "BBWI", "BBY", "BDX", "BEN", "BG", "BIIB", "BIO", "BK",
    "BKNG", "BKR", "BLDR", "BLK", "BMY", "BR", "BRK-B", "BRO", "BSX", "BWA", "BX", "BXP",
    "C", "CAG", "CAH", "CARR", "CAT", "CB", "CBOE", "CBRE", "CCI", "CCL", "CDNS", "CDW",
    "CE", "CEG", "CF", "CFG", "CHD", "CHRW", "CHTR", "CI", "CINF", "CL", "CLX", "CMA",
    "CMCSA", "CME", "CMG", "CMI", "CMS", "CNC", "CNP", "COF", "COHR", "COO", "COP", "COR",
    "COST", "CPAY", "CPB", "CPRT", "CPT", "CRM", "CRL", "CRWD", "CSCO", "CSGP", "CSX",
    "CTAS", "CTRA", "CTSH", "CTVA", "CVS", "CVX", "CZR", "D", "DAL", "DASH", "DAY", "DD",
    "DE", "DECK", "DG", "DGX", "DHI", "DHR", "DIS", "DLR", "DLTR", "DOV", "DOW", "DPZ",
    "DRI", "DTE", "DUK", "DVA", "DVN", "DXCM", "EA", "EBAY", "ECL", "ED", "EFX", "EIX",
    "EL", "ELV", "EMN", "EMR", "ENPH", "EOG", "EPAM", "EQIX", "EQR", "EQT", "ES", "ESS",
    "ETN", "ETR", "EVRG", "EW", "EXC", "EXPD", "EXPE", "EXR", "F", "FANG", "FAST", "FCX",
    "FDS", "FDX", "FE", "FFIV", "FICO", "FIS", "FITB", "FMC", "FOX", "FOXA", "FRT",
    "FSLR", "FTNT", "FTV", "GD", "GE", "GEHC", "GEN", "GEV", "GILD", "GIS", "GL", "GLW",
    "GM", "GNRC", "GOOG", "GOOGL", "GPC", "GPN", "GRMN", "GS", "GWW", "HAL", "HAS", "HBAN",
    "HCA", "HD", "HIG", "HII", "HLT", "HOLX", "HON", "HPE", "HPQ", "HRL", "HSIC", "HST",
    "HSY", "HUM", "HWM", "IBM", "ICE", "IDXX", "IEX", "IFF", "ILMN", "INCY", "INTC", "INTU",
    "INVH", "IQV", "IR", "IRM", "ISRG", "IT", "ITW", "IVZ", "J", "JBHT", "JBL", "JCI",
    "JKHY", "JNJ", "JPM", "KDP", "KEY", "KEYS", "KHC", "KIM", "KKR", "KLAC", "KMB", "KMI",
    "KMX", "KO", "KR", "KVUE", "L", "LDOS", "LEN", "LH", "LHX", "LIN", "LITE", "LKQ", "LLY",
    "LMT", "LNT", "LOW", "LRCX", "LULU", "LUV", "LW", "LYB", "LYV", "MA", "MAA", "MAR",
    "MAS", "MCD", "MCHP", "MCK", "MCO", "MDLZ", "MDT", "MET", "META", "MGM", "MHK", "MKC",
    "MKTX", "MLM", "MMC", "MMM", "MNST", "MO", "MOH", "MOS", "MPC", "MPWR", "MRK", "MRNA",
    "MS", "MSCI", "MSFT", "MSI", "MTB", "MTCH", "MTD", "MU", "NDAQ", "NDSN", "NEE", "NEM",
    "NFLX", "NI", "NKE", "NOC", "NOW", "NRG", "NSC", "NTAP", "NTRS", "NUE", "NVDA", "NVR",
    "NWL", "NWS", "NWSA", "NXPI", "O", "ODFL", "OKE", "OMC", "ON", "ORCL", "ORLY", "OTIS",
    "OXY", "PANW", "PAYC", "PAYX", "PCAR", "PCG", "PEG", "PEP", "PFE", "PFG", "PG", "PGR",
    "PH", "PHM", "PKG", "PLD", "PLTR", "PM", "PNC", "PNR", "PNW", "PODD", "POOL", "PPG",
    "PPL", "PRU", "PSA", "PSX", "PTC", "PYPL", "QCOM", "QRVO", "RCL", "REG", "REGN", "RF",
    "RHI", "RJF", "RL", "RMD", "ROK", "ROL", "ROP", "ROST", "RSG", "RTX", "RVTY", "SATS",
    "SBAC", "SBUX", "SCHW", "SHW", "SJM", "SLB", "SNA", "SNPS", "SO", "SOLV", "SPG", "SPGI",
    "SRE", "STE", "STLD", "STT", "STX", "STZ", "SWK", "SWKS", "SYF", "SYK", "SYY", "T",
    "TAP", "TDG", "TDY", "TECH", "TEL", "TER", "TFC", "TFX", "TGT", "TJX", "TMO",
    "TMUS", "TPR", "TRGP", "TROW", "TRU", "TRV", "TSCO", "TSLA", "TSN", "TT", "TTWO", "TXN",
    "TXT", "TYL", "UAL", "UBER", "UDR", "UHS", "ULTA", "UNH", "UNP", "UPS", "URI", "USB",
    "V", "VFC", "VICI", "VLO", "VLTO", "VMC", "VRSK", "VRSN", "VRT", "VRTX", "VTR", "VZ",
    "WAB", "WAT", "WBD", "WDC", "WEC", "WELL", "WFC", "WHR", "WM", "WMB", "WMT", "WRB",
    "WST", "WTW", "WY", "WYNN", "XEL", "XOM", "XYL", "YUM", "ZBH", "ZBRA", "ZTS"
]

tickers = list(dict.fromkeys(raw_tickers))

# Equal weights
weight = round(1.0 / len(tickers), 6)
weights = {t: weight for t in tickers}
weights[tickers[-1]] = round(1.0 - weight * (len(tickers) - 1), 6)

payload = {
    "tickers": tickers,
    "weights": weights,
    "period": "1y"
}

print(f"Portfolio size: {len(tickers)} instruments")
print("=" * 50)

# --- Request 1: Cache MISS ---
print("\nRequest 1 — Cache MISS (fetching from Yahoo Finance)...")
start = time.time()
response = requests.post(API_URL, json=payload)
elapsed_1 = time.time() - start

if response.status_code == 200:
    print(f"Status: SUCCESS")
    print(f"Time:   {elapsed_1:.2f}s")
    data = response.json()
    print(f"Sharpe: {data['sharpe_ratio']}")
    print(f"Volatility: {data['volatility']}")
else:
    print(f"ERROR: {response.status_code} — {response.text}")
    exit()

# --- Request 2: Cache HIT ---
print("\nRequest 2 — Cache HIT (served from Redis)...")
start = time.time()
response = requests.post(API_URL, json=payload)
elapsed_2 = time.time() - start

if response.status_code == 200:
    print(f"Status: SUCCESS")
    print(f"Time:   {elapsed_2:.3f}s")
    data = response.json()
    print(f"Sharpe: {data['sharpe_ratio']}")
else:
    print(f"ERROR: {response.status_code}")

# --- Request 3: Cache HIT again ---
print("\nRequest 3 — Cache HIT again...")
start = time.time()
response = requests.post(API_URL, json=payload)
elapsed_3 = time.time() - start
print(f"Time: {elapsed_3:.3f}s")

# --- Summary ---
print("\n" + "=" * 50)
print("RESULTS SUMMARY")
print("=" * 50)
print(f"Cache MISS (first request):  {elapsed_1:.2f}s")
print(f"Cache HIT  (second request): {elapsed_2:.3f}s")
print(f"Cache HIT  (third request):  {elapsed_3:.3f}s")
improvement = ((elapsed_1 - elapsed_2) / elapsed_1) * 100
print(f"Speed improvement:           {improvement:.1f}%")
print(f"\nResume bullet proof:")
print(f"  First fetch:  {elapsed_1:.1f}s (489 instruments, Yahoo Finance)")
print(f"  Cached fetch: {elapsed_2*1000:.0f}ms (Redis)")
print(f"  Improvement:  {improvement:.0f}%")