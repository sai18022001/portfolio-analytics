// MetricsCard.tsx — displays a single analytics number (Sharpe, volatility, etc.)

interface MetricsCardProps {
  title: string;
  value: number;
  description: string;
  format?: "decimal" | "percent";
}

export default function MetricsCard({
  title,
  value,
  description,
  format = "decimal",
}: MetricsCardProps) {
  const displayValue =
    format === "percent"
      ? `${(value * 100).toFixed(2)}%`
      : value.toFixed(4);

  // Color the value green if positive, red if negative
  const valueColor = value >= 0 ? "#16a34a" : "#dc2626";

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
    }}>
      <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 6px 0" }}>
        {title}
      </p>
      <p style={{ fontSize: "28px", fontWeight: 600, color: valueColor, margin: "0 0 6px 0" }}>
        {displayValue}
      </p>
      <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
        {description}
      </p>
    </div>
  );
}