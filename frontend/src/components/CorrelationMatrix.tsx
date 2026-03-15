// CorrelationMatrix.tsx — color-coded table showing how stocks move together
// Green = low correlation (good diversification), Red = high correlation (bad)

interface CorrelationMatrixProps {
  data: Record<string, Record<string, number>>;
}

// Map a correlation value (-1 to +1) to a background color
function getColor(value: number): string {
  if (value >= 0.8) return "#fca5a5";  // high correlation — red
  if (value >= 0.5) return "#fde68a";  // medium — yellow
  if (value >= 0.2) return "#bbf7d0";  // low — light green
  return "#86efac";                     // very low — green
}

export default function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const tickers = Object.keys(data);

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#111827" }}>
        Correlation Matrix
      </h3>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px", color: "#6b7280", fontSize: "13px" }}></th>
            {tickers.map(t => (
              <th key={t} style={{ padding: "8px", color: "#6b7280", fontSize: "13px" }}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickers.map(row => (
            <tr key={row}>
              <td style={{ padding: "8px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
                {row}
              </td>
              {tickers.map(col => (
                <td key={col} style={{
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "13px",
                  background: getColor(data[row][col]),
                  borderRadius: "4px",
                }}>
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