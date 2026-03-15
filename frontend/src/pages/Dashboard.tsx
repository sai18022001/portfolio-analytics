// Dashboard.tsx — the main analytics page

import { useState } from "react";
import { fetchAnalytics } from "../api/client";
import type { AnalyticsResult, Holding } from "../types";
import MetricsCard from "../components/MetricsCard";
import SectorChart from "../components/SectorChart";
import CorrelationMatrix from "../components/CorrelationMatrix";

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
            onClick={handleAnalyze}
            disabled={loading}
            style={{ padding: "10px 24px", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
          >
            {loading ? "Analyzing..." : "Analyze Portfolio"}
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