// Dashboard.tsx — the main analytics page

import { useState } from "react";
import { fetchAnalytics } from "../api/client";
import type { AnalyticsResult, Holding } from "../types";
import MetricsCard from "../components/MetricsCard";
import SectorChart from "../components/SectorChart";
import CorrelationMatrix from "../components/CorrelationMatrix";

// Full 488 S&P 500 tickers
const SP500_TICKERS = [
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
];

export default function Dashboard() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: "AAPL", weight: 0.3 },
    { ticker: "MSFT", weight: 0.3 },
    { ticker: "GOOGL", weight: 0.2 },
    { ticker: "JPM", weight: 0.1 },
    { ticker: "JNJ", weight: 0.1 },
  ]);

  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called when user clicks "Analyze Portfolio"
  function loadSP500() {
    const weight = parseFloat((1.0 / SP500_TICKERS.length).toFixed(6));
    const newHoldings: Holding[] = SP500_TICKERS.map((ticker, index) => {
        // Fix floating point on last ticker so weights sum to exactly 1.0
        const isLast = index === SP500_TICKERS.length - 1;
        const adjustedWeight = isLast
            ? parseFloat((1.0 - weight * (SP500_TICKERS.length - 1)).toFixed(6))
            : weight;
        return { ticker, weight: adjustedWeight };
    });
    setHoldings(newHoldings);
  }

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    // Convert holdings array to the format the API expects
    const tickers = holdings.map(h => h.ticker);
    const weights: Record<string, number> = {};
    holdings.forEach(h => { weights[h.ticker] = h.weight; });

    // Check weights sum to 1
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 1.0) > 0.01) {
      setError(`Weights must sum to 1.0 — current sum: ${total.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchAnalytics({ tickers, weights, period: "1y" });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function updateHolding(index: number, field: keyof Holding, value: string) {
    const updated = [...holdings];
    if (field === "weight") {
      updated[index].weight = parseFloat(value) || 0;
    } else {
      updated[index].ticker = value.toUpperCase();
    }
    setHoldings(updated);
  }

  function addHolding() {
    setHoldings([...holdings, { ticker: "", weight: 0 }]);
  }

  function removeHolding(index: number) {
    setHoldings(holdings.filter((_, i) => i !== index));
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
        Portfolio Analytics
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Enter your holdings and get real-time risk metrics
      </p>

      {/* Portfolio input table */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
          Holdings
        </h2>

        {holdings.map((holding, index) => (
          <div key={index} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "center" }}>
            <input
              value={holding.ticker}
              onChange={e => updateHolding(index, "ticker", e.target.value)}
              placeholder="Ticker (e.g. AAPL)"
              style={{ flex: 2, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
            />
            <input
              type="number"
              value={holding.weight}
              onChange={e => updateHolding(index, "weight", e.target.value)}
              placeholder="Weight (e.g. 0.3)"
              step="0.05"
              min="0"
              max="1"
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
            />
            <button
              onClick={() => removeHolding(index)}
              style={{ padding: "8px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
            >
              Remove
            </button>
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={addHolding}
            style={{ padding: "10px 20px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
          >
            + Add Stock
          </button>
          <button
            onClick={loadSP500}
            style={{ padding: "10px 20px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#1d4ed8" }}
          >
            Load S&P 500 (488 stocks)
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{ padding: "10px 24px", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
          >
            Analyze Portfolio
            {loading && (
                <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "10px" }}>
                      First request fetches live data for all instruments (~20s). 
                      Repeat requests serve from Redis cache (~200ms).
                </p>
            )}
          </button>
        </div>

        {error && (
          <p style={{ color: "#dc2626", marginTop: "12px", fontSize: "14px" }}>{error}</p>
        )}
      </div>

      {/* Results — only shown after analysis */}
      {result && (
        <>
          {/* Metrics row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <MetricsCard title="Sharpe Ratio" value={result.sharpe_ratio} description="Return per unit of risk. >1 is good." />
            <MetricsCard title="Volatility" value={result.volatility} format="percent" description="Annualized standard deviation." />
            <MetricsCard title="Max Drawdown" value={result.max_drawdown} format="percent" description="Worst peak-to-trough loss." />
            <MetricsCard title="Annual Return" value={result.annual_return} format="percent" description="Projected yearly return." />
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <SectorChart data={result.sector_exposure} />
            <CorrelationMatrix data={result.correlation_matrix} />
          </div>
        </>
      )}
    </div>
  );
}