// api/client.ts — all communication with the FastAPI backend


import axios from "axios";
import type { AnalyticsResult, PortfolioRequest } from "../types";

// Base URL of your FastAPI backend
const BASE_URL = "http://127.0.0.1:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- API functions ---

export async function fetchAnalytics(
  request: PortfolioRequest
): Promise<AnalyticsResult> {
  // POST /api/analytics with the portfolio data
  // axios automatically serializes the JS object to JSON
  // and parses the JSON response back to a JS object
  const response = await api.post<AnalyticsResult>("/analytics", request);
  return response.data;
}

export async function fetchCurrentPrice(ticker: string): Promise<number> {
  const response = await api.get<{ ticker: string; price: number }>(
    `/price/${ticker}`
  );
  return response.data.price;
}

export async function fetchSamplePortfolio(): Promise<PortfolioRequest> {
  const response = await api.get<PortfolioRequest>("/portfolio/sample");
  return response.data;
}