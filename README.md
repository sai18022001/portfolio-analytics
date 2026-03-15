# Portfolio Analytics Platform

A full-stack web application for real-time portfolio risk analytics. Input a stock portfolio and instantly get risk metrics, sector exposure, return attribution, and rebalancing insights — powered by live market data.

![Tech Stack](https://img.shields.io/badge/Python-3.13-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791) ![Redis](https://img.shields.io/badge/Redis-7-red) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ed)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Analytics Explained](#analytics-explained)
- [Caching Strategy](#caching-strategy)
- [CI/CD Pipeline](#cicd-pipeline)
- [Getting Started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)

---

<!-- ## Features

- **Live market data** — fetches real-time prices from Yahoo Finance
- **Risk metrics** — Sharpe ratio, volatility, max drawdown, annual return
- **Sector exposure** — pie chart breakdown of portfolio by industry
- **Correlation matrix** — color-coded table showing how holdings move together
- **Redis caching** — ~70% reduction in repeated query response time (sub-200ms)
- **Background refresh** — Celery worker refreshes prices every hour automatically
- **Interactive dashboard** — built with React + TypeScript + Recharts
- **Fully containerized** — runs with a single `docker-compose up` command
- **CI/CD pipeline** — automated testing and build on every GitHub push -->

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + TypeScript | Interactive dashboard and charts |
| Charts | Recharts | Pie charts, line charts, data visualization |
| Backend | Python 3.13 + FastAPI | REST API, request validation, business logic |
| Analytics | NumPy + Pandas | Financial math — Sharpe, volatility, drawdown |
| Market Data | yfinance | Free Yahoo Finance API wrapper |
| Database | PostgreSQL 15 | Persistent storage — portfolios, prices, users |
| Cache | Redis 7 | In-memory caching for fast repeated queries |
| Task Queue | Celery | Scheduled background jobs (hourly price refresh) |
| Containers | Docker + Docker Compose | Reproducible environments across all services |
| CI/CD | GitHub Actions | Automated testing and deployment pipeline |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User's Browser                     │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP / JSON
┌─────────────────────▼───────────────────────────────┐
│              React + TypeScript Frontend              │
│   Portfolio Form │ Metrics Cards │ Charts Dashboard  │
└─────────────────────┬───────────────────────────────┘
                      │ REST API calls (axios)
┌─────────────────────▼───────────────────────────────┐
│                 FastAPI Backend                       │
│   API Routes → Analytics Engine → Cache Layer        │
│                    ↓                                  │
│              Celery Worker                            │
│         (background price refresh)                    │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────────────┐
│ PostgreSQL  │ │   Redis    │ │  Yahoo Finance API │
│  (storage)  │ │  (cache)   │ │   (market data)   │
└─────────────┘ └────────────┘ └───────────────────┘
```

### How a request flows end to end

1. User fills in holdings (tickers + weights) and clicks **Analyze Portfolio**
2. React sends `POST /api/analytics` with JSON body to FastAPI
3. FastAPI validates the request — checks weights sum to 1.0, tickers are valid
4. FastAPI checks Redis: **cache hit** → return result in ~5ms
5. **Cache miss** → fetch prices from Yahoo Finance (~1-2 seconds)
6. Analytics engine runs all calculations (Sharpe, volatility, drawdown, sectors)
7. Result stored in Redis with 1-hour TTL for future requests
8. JSON response returned to React
9. React renders metrics cards, pie chart, and correlation matrix

---

## Project Structure

```
portfolio-analytics/
│
├── backend/                        # Python FastAPI server
│   ├── app/
│   │   ├── main.py                 # App entry point, CORS config, router registration
│   │   ├── cache.py                # Redis read/write helpers with graceful fallback
│   │   ├── api/
│   │   │   └── routes.py           # All HTTP endpoints (POST /analytics, GET /price)
│   │   ├── core/
│   │   │   ├── analytics.py        # Sharpe ratio, volatility, drawdown, correlation
│   │   │   └── market_data.py      # Yahoo Finance price fetcher
│   │   ├── db/
│   │   │   ├── database.py         # SQLAlchemy engine, session management
│   │   │   └── models.py           # ORM models → PostgreSQL tables
│   │   └── tasks/
│   │       └── celery_worker.py    # Background job: refresh prices every hour
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Backend container definition
│
├── frontend/                       # React + TypeScript app
│   ├── src/
│   │   ├── App.tsx                 # Root component
│   │   ├── main.tsx                # React DOM entry point
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces (AnalyticsResult, Holding)
│   │   ├── api/
│   │   │   └── client.ts           # All axios calls to backend (single source of truth)
│   │   ├── pages/
│   │   │   └── Dashboard.tsx       # Main analytics page — state management + layout
│   │   └── components/
│   │       ├── MetricsCard.tsx     # Single metric display (Sharpe, volatility, etc.)
│   │       ├── SectorChart.tsx     # Recharts pie chart for sector exposure
│   │       └── CorrelationMatrix.tsx # Color-coded correlation table
│   ├── Dockerfile                  # Two-stage build: Node (compile) → nginx (serve)
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: test backend + frontend on every push
│
├── docker-compose.yml              # Runs all 5 services together with one command
├── .gitignore                      # Excludes venv, node_modules, .env, etc.
└── README.md
```

---

## Database Schema

### Tables

#### `users`
Stores registered users.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| email | VARCHAR | Unique user email |
| hashed_password | VARCHAR | Bcrypt hashed password (never store plaintext) |
| created_at | TIMESTAMP | Account creation time |

#### `portfolios`
Each user can have multiple named portfolios.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| user_id | INTEGER FK | References `users.id` |
| name | VARCHAR | Portfolio name (e.g. "Growth Portfolio") |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last modified time |

#### `holdings`
Individual stocks inside a portfolio.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| portfolio_id | INTEGER FK | References `portfolios.id` |
| ticker | VARCHAR | Stock symbol (e.g. "AAPL") |
| weight | FLOAT | Allocation as decimal (e.g. 0.40 = 40%) |
| quantity | INTEGER | Number of shares (optional) |

#### `stock_prices`
Historical closing prices fetched from Yahoo Finance.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| ticker | VARCHAR | Stock symbol, indexed for fast lookup |
| close_price | FLOAT | Closing price on that date |
| price_date | DATE | Trading date |
| fetched_at | TIMESTAMP | When this record was inserted |

### Relationships

```
users (1) ──────< portfolios (many)
portfolios (1) ─────< holdings (many)
holdings >────── stock_prices (via ticker)
```

- One **user** owns many **portfolios**
- One **portfolio** contains many **holdings**
- Each **holding** references **stock_prices** by ticker symbol
- Foreign keys enforce data integrity at the database level

---

## API Reference

Base URL: `http://localhost:8080/api`

Interactive docs available at: `http://localhost:8080/docs`

### `POST /api/analytics`

Returns full risk analytics for a given portfolio.

**Request body:**
```json
{
  "tickers": ["AAPL", "MSFT", "GOOGL"],
  "weights": {
    "AAPL": 0.50,
    "MSFT": 0.30,
    "GOOGL": 0.20
  },
  "period": "1y"
}
```

**Validation rules:**
- `weights` must sum to exactly `1.0`
- Every ticker in `tickers` must appear in `weights`
- `period` options: `"1y"`, `"6mo"`, `"2y"` (default: `"1y"`)

**Response:**
```json
{
  "sharpe_ratio": 0.8998,
  "volatility": 0.2403,
  "max_drawdown": -0.1766,
  "annual_return": 0.2562,
  "sector_exposure": {
    "Technology": 1.0
  },
  "correlation_matrix": {
    "AAPL": { "AAPL": 1.0, "MSFT": 0.82, "GOOGL": 0.79 },
    "MSFT": { "AAPL": 0.82, "MSFT": 1.0, "GOOGL": 0.85 },
    "GOOGL": { "AAPL": 0.79, "MSFT": 0.85, "GOOGL": 1.0 }
  }
}
```

### `GET /api/price/{ticker}`

Returns the latest price for a single stock.

**Example:** `GET /api/price/AAPL`

```json
{ "ticker": "AAPL", "price": 260.81 }
```

### `GET /api/portfolio/sample`

Returns a sample portfolio for demo/testing purposes.

### `GET /health`

Health check endpoint.

```json
{ "status": "ok" }
```

---

<!-- ## Analytics Explained

### Sharpe Ratio
**Formula:** `(Annual Return − Risk Free Rate) / Annual Volatility`

Measures return earned per unit of risk taken. Uses 4% as the risk-free rate (US Treasury benchmark).
- `> 2.0` — excellent
- `1.0 – 2.0` — good
- `0.0 – 1.0` — acceptable
- `< 0.0` — underperforming risk-free assets

### Volatility
**Formula:** `Standard Deviation of Daily Returns × √252`

Annualized measure of how much the portfolio value fluctuates. Multiplied by √252 because there are 252 trading days per year.

### Max Drawdown
**Formula:** `min((Cumulative Return − Running Peak) / Running Peak)`

The worst peak-to-trough loss experienced in the period. A drawdown of `-0.35` means the portfolio fell 35% from its highest point before recovering.

### Annual Return
**Formula:** `Mean Daily Return × 252`

Projected yearly return based on average daily performance over the selected period.

### Correlation Matrix
Values range from `-1` to `+1`:
- `+1.0` — stocks always move together (low diversification benefit)
- `0.0` — no relationship
- `-1.0` — stocks move in opposite directions (ideal hedge)

A well-diversified portfolio has low correlations between holdings.

---

## Caching Strategy

Redis is used as a read-through cache in front of the analytics computation:

```
Request → Check Redis
              │
        ┌─────▼─────┐
        │ Cache HIT │ → Return in ~5ms
        └───────────┘
              │
        ┌─────▼──────┐
        │ Cache MISS │ → Fetch Yahoo Finance → Run analytics (~1-2s)
        └────────────┘         │
                               ▼
                     Store in Redis (TTL: 1 hour)
                               │
                               ▼
                         Return result
```

**Cache key format:** `analytics:AAPL-MSFT-GOOGL:1y` (tickers sorted alphabetically so order doesn't matter)

**TTL:** 1 hour — after which the next request fetches fresh market data automatically.

**Result:** Repeated queries for the same portfolio are served from memory, reducing response time by ~70% and eliminating redundant Yahoo Finance calls under concurrent load.

---

## CI/CD Pipeline

GitHub Actions runs automatically on every push to `main`:

```
git push → GitHub Actions triggered
               │
       ┌───────┴────────┐
       │                │
  test-backend     test-frontend
  (Python 3.13)    (Node 22)
  pytest + pip     npm build
       │                │
       └───────┬────────┘
               │ both pass?
               ▼
            deploy
      (echo ready — extend
       with AWS/GCP steps)
```

**Jobs:**
- `test-backend` — installs Python deps, runs pytest, spins up Redis as a service container
- `test-frontend` — installs npm deps, runs `npm run build` (TypeScript errors fail the build)
- `deploy` — runs only if both jobs pass and the branch is `main` -->

---

## Getting Started

### Prerequisites

- Python 3.13
- Node.js 22
- Docker Desktop
- Git

### Local development (without Docker)

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/portfolio-analytics.git
cd portfolio-analytics
```

**2. Start Redis via Docker**
```bash
docker run -d --name redis-cache -p 6379:6379 redis:alpine
```

**3. Start the backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

**4. Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8080/docs`

---

## Running with Docker

Run the entire stack — PostgreSQL, Redis, backend, Celery worker, and frontend — with a single command:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| API Docs | http://localhost:8080/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

To stop all services:
```bash
docker-compose down
```

To stop and delete all data (including the PostgreSQL volume):
```bash
docker-compose down -v
```

---

## Environment Variables

Create a `.env` file in the `backend/` folder. **Never commit this file to GitHub.**

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `SECRET_KEY` | Used for signing tokens — change in production |
| `DEBUG` | Set to `False` in production |