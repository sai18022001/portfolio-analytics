// SectorChart.tsx — pie chart showing sector exposure

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface SectorChartProps {
  data: Record<string, number>; // e.g. { "Technology": 0.6, "Healthcare": 0.4 }
}

// Colors for each slice of the pie
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

export default function SectorChart({ data }: SectorChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: Math.round(value * 100), 
  }));

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#111827" }}>
        Sector Exposure
      </h3>
      {/* ResponsiveContainer makes the chart resize with the window */}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}