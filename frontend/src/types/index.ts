// types/index.ts — TypeScript interfaces for all data in the app


// Matches the AnalyticsResponse model in your FastAPI backend exactly
export interface AnalyticsResult {
  sharpe_ratio: number;
  volatility: number;
  max_drawdown: number;
  annual_return: number;
  sector_exposure: Record<string, number>;   // { "Technology": 0.6, "Healthcare": 0.4 }
  correlation_matrix: Record<string, Record<string, number>>;
}

// What the user fills in on the portfolio form
export interface PortfolioRequest {
  tickers: string[];
  weights: Record<string, number>;
  period: string;
}

// A single holding row in the form
export interface Holding {
  ticker: string;
  weight: number;
}