// CorrelationMatrix.tsx — color-coded table showing how stocks move together
// Green = low correlation (good diversification), Red = high correlation (bad)

interface CorrelationMatrixProps {
  data: Record<string, Record<string, number>>;
}

function getColor(value: number): string {
  if (value >= 0.8) return "#fca5a5";  // high correlation — red
  if (value >= 0.5) return "#fde68a";  // medium — yellow
  if (value >= 0.2) return "#bbf7d0";  // low — light green
  return "#86efac";                     // very low — green
}

// One reusable table component — used for both full and preview renders
function CorrelationTable({
  tickers,
  data,
}: {
  tickers: string[];
  data: Record<string, Record<string, number>>;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "6px", color: "#6b7280", fontSize: "12px" }}></th>
            {tickers.map((t) => (
              <th key={t} style={{ padding: "6px", color: "#6b7280", fontSize: "12px" }}>
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickers.map((row) => (
            <tr key={row}>
              <td style={{ padding: "6px", fontWeight: 600, fontSize: "12px", color: "#374151" }}>
                {row}
              </td>
              {tickers.map((col) => (
                <td
                  key={col}
                  style={{
                    padding: "6px",
                    textAlign: "center",
                    fontSize: "12px",
                    background: getColor(data[row][col]),
                    borderRadius: "4px",
                  }}
                >
                  {data[row][col].toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const tickers = Object.keys(data);
  const isLarge = tickers.length > 20;
  // For large portfolios show first 10 as preview, otherwise show all
  const displayTickers = isLarge ? tickers.slice(0, 10) : tickers;

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
    }}>
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#111827" }}>
        Correlation Matrix
      </h3>

      {/* Warning banner for large portfolios */}
      {isLarge && (
        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "12px" }}>
          {tickers.length}×{tickers.length} matrix — showing first 10 of {tickers.length} instruments
        </p>
      )}

      {/* The table — works for both 5 stocks and 488 stocks */}
      <CorrelationTable tickers={displayTickers} data={data} />

      {isLarge && (
        <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>
          Full {tickers.length}×{tickers.length} matrix computed on backend and cached in Redis
        </p>
      )}
    </div>
  );
}