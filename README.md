# 🍔 Foodlytics - Restaurant Analytics Dashboard

A comprehensive real-time restaurant analytics dashboard that provides insights into store performance, order metrics, and revenue analytics with blazing-fast data loading through Redis caching.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis)
![Material UI](https://img.shields.io/badge/MUI-5.x-007FFF?logo=mui)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation--setup)
- [Architecture](#-architecture--code-structure)
- [API Documentation](#-api-documentation)
- [Caching Strategy](#-caching-strategy)
- [Problem Understanding](#-problem-understanding)
- [Known Issues & Improvements](#-known-issues--future-improvements)

---

## ✨ Features

### Core Features

| Feature                       | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| 📊 **Real-time Dashboard**    | Live metrics for orders, revenue, and store performance |
| 🏪 **Multi-Store Management** | View and analyze data across 100+ restaurant stores     |
| 📈 **Interactive Charts**     | Beautiful visualizations using Recharts library         |
| 🔄 **Redis Caching**          | Sub-50ms response times with Upstash Redis              |
| 🎨 **Modern UI**              | Clean, responsive design with Material UI               |
| ⚡ **Parallel Data Fetching** | Optimized API calls with connection pooling             |

### Analytics Features

- ✅ Order status breakdown (Completed, Processing, Failed, Cancelled)
- ✅ Revenue trends over time with interactive line charts
- ✅ Store-by-store performance comparison
- ✅ Success rate calculations with visual indicators
- ✅ Average order value metrics
- ✅ Processing time analytics

---

## 🛠️ Tech Stack

### Frontend

| Technology            | Purpose                            |
| --------------------- | ---------------------------------- |
| **React 18**          | UI Component Library               |
| **TypeScript**        | Type Safety & Developer Experience |
| **Material UI (MUI)** | Component Framework                |
| **Recharts**          | Data Visualization & Charts        |
| **Zustand**           | Lightweight State Management       |
| **Axios**             | HTTP Client with Interceptors      |

### Backend

| Technology        | Purpose                                   |
| ----------------- | ----------------------------------------- |
| **FastAPI**       | Modern Python Web Framework               |
| **Upstash Redis** | Serverless Distributed Caching            |
| **httpx**         | Async HTTP Client with Connection Pooling |
| **Python-dotenv** | Environment Variable Management           |
| **Uvicorn**       | Lightning-fast ASGI Server                |

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Upstash Redis account ([Get free account](https://upstash.com/))

### Backend Setup

```bash
# Navigate to backend directory
cd Foodlytics/backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Redis Configuration (Upstash)
# Get these from your Upstash dashboard: https://console.upstash.com/
REDIS_URL=rediss://default:YOUR_TOKEN@YOUR_ENDPOINT.upstash.io:6379

# Cache Configuration (in seconds)
CACHE_TTL=300           # Default TTL: 5 minutes
CACHE_TTL_SHORT=60      # Short TTL: 1 minute (for orders)
CACHE_TTL_LONG=600      # Long TTL: 10 minutes (for stores)

# API Configuration
MOCK_API_URL=https://assessment-6xdhr.ondigitalocean.app
```

```bash
# Start the backend server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd Foodlytics/frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 🌐 Access the Application

| Service               | URL                              |
| --------------------- | -------------------------------- |
| **Frontend**          | http://localhost:3000            |
| **Backend API**       | http://localhost:8000            |
| **API Documentation** | http://localhost:8000/docs       |
| **Health Check**      | http://localhost:8000/api/health |

---

## 🏗️ Architecture & Code Structure

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Dashboard  │  │    Stores    │  │    Orders    │  │   Charts    │ │
│  │     Page     │  │     Page     │  │     Page     │  │  Components │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │         │
│         └────────────────┬┴─────────────────┴─────────────────┘         │
│                          │                                               │
│                  ┌───────▼───────┐                                       │
│                  │  Zustand Store │◄──── State Management                │
│                  └───────┬───────┘                                       │
│                          │                                               │
│                  ┌───────▼───────┐                                       │
│                  │  API Service  │◄──── Axios HTTP Client                │
│                  └───────┬───────┘                                       │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │
                           ▼ HTTP Requests
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI + Python)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      FastAPI Application                          │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  /api/dashboard/summary     │  /api/dashboard/store/{id}         │   │
│  │  /api/stores                │  /api/stores/{id}/orders           │   │
│  │  /api/cache/status          │  /api/cache/refresh                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                          │                                               │
│         ┌────────────────┼────────────────┐                             │
│         ▼                ▼                ▼                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │ Cache Layer │  │ HTTP Client │  │  Metrics    │                     │
│  │   (Redis)   │  │   (httpx)   │  │ Calculator  │                     │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘                     │
└─────────┼────────────────┼──────────────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────┐  ┌─────────────────┐
│  Upstash Redis  │  │   External API  │
│  (Cloud Cache)  │  │  (Data Source)  │
└─────────────────┘  └─────────────────┘
```

### Project Structure

```
Foodlytics/
├── 📁 backend/
│   ├── 📁 app/
│   │   ├── main.py          # FastAPI application, routes & caching
│   │   ├── models.py        # Pydantic data models
│   │   └── services.py      # Business logic layer
│   ├── .env                 # Environment variables (create this)
│   └── requirements.txt     # Python dependencies
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   └── index.html       # HTML template
│   ├── 📁 src/
│   │   ├── 📁 components/   # Reusable UI components
│   │   │   ├── AnomalyAlerts.tsx    # Alert notifications
│   │   │   ├── DataTable.tsx        # Generic data table
│   │   │   ├── HealthIndicator.tsx  # Store health display
│   │   │   ├── Layout.tsx           # App layout wrapper
│   │   │   ├── MetricsCards.tsx     # Metric card grid
│   │   │   ├── OrdersFeed.tsx       # Live orders feed
│   │   │   ├── OrdersTable.tsx      # Orders data table
│   │   │   ├── OrderStatusPie.tsx   # Pie chart component
│   │   │   ├── RevenueChart.tsx     # Revenue line chart
│   │   │   ├── StatCard.tsx         # Individual stat card
│   │   │   ├── StatusChart.tsx      # Status bar chart
│   │   │   ├── StoreList.tsx        # Store listing
│   │   │   ├── StoreSelector.tsx    # Store dropdown
│   │   │   └── SummaryCards.tsx     # Dashboard summary
│   │   ├── 📁 pages/        # Page components
│   │   │   ├── Dashboard.tsx        # Main dashboard
│   │   │   ├── Orders.tsx           # Orders page
│   │   │   └── Stores.tsx           # Stores page
│   │   ├── 📁 services/     # API communication
│   │   │   └── api.ts               # Axios API client
│   │   ├── 📁 store/        # State management
│   │   │   └── dashboardStore.ts    # Zustand store
│   │   ├── 📁 theme/        # Styling
│   │   │   └── theme.ts             # MUI theme config
│   │   ├── 📁 types/        # TypeScript types
│   │   │   └── types.ts             # Interface definitions
│   │   ├── App.tsx          # Root component
│   │   └── index.tsx        # Entry point
│   ├── package.json         # Node dependencies
│   └── tsconfig.json        # TypeScript config
│
└── README.md                # This file
```

---

## 📡 API Documentation

### Dashboard Endpoints

| Method | Endpoint                          | Description                              | Cache TTL |
| ------ | --------------------------------- | ---------------------------------------- | --------- |
| `GET`  | `/api/dashboard/summary`          | Aggregated dashboard data for all stores | 300s      |
| `GET`  | `/api/dashboard/store/{store_id}` | Detailed dashboard for specific store    | 300s      |

### Store Endpoints

| Method | Endpoint                        | Description       | Cache TTL |
| ------ | ------------------------------- | ----------------- | --------- |
| `GET`  | `/api/stores`                   | List all stores   | 600s      |
| `GET`  | `/api/stores/{store_id}`        | Get store details | 600s      |
| `GET`  | `/api/stores/{store_id}/orders` | Get store orders  | 60s       |

### Cache Management Endpoints

| Method | Endpoint                           | Description                             |
| ------ | ---------------------------------- | --------------------------------------- |
| `GET`  | `/api/cache/status`                | Check cache connection & preload status |
| `POST` | `/api/cache/refresh`               | Trigger background cache refresh        |
| `POST` | `/api/cache/invalidate/{store_id}` | Invalidate cache for specific store     |
| `POST` | `/api/cache/invalidate-all`        | Clear all cached data                   |

### Health & Monitoring

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| `GET`  | `/`           | API info and cache status |
| `GET`  | `/api/health` | Application health check  |

### Response Examples

#### Dashboard Summary Response

```json
{
  "stores": [
    {
      "id": "store_001",
      "name": "Downtown Burger Joint",
      "chain": "Burger Chain",
      "status": "active"
    }
  ],
  "orders": [...],
  "summary": {
    "total_stores": 100,
    "total_orders": 5000,
    "total_revenue": 125000.50,
    "completed_orders": 4200,
    "failed_orders": 300,
    "cancelled_orders": 200,
    "processing_orders": 300,
    "avg_order_value": 29.76,
    "success_rate": 84.0
  }
}
```

#### Cache Status Response

```json
{
  "connected": true,
  "ttl_seconds": 300,
  "ttl_short": 60,
  "ttl_long": 600,
  "redis_url_configured": true,
  "preload": {
    "status": "completed",
    "timestamp": "2026-01-16T10:30:00",
    "stores_count": 100,
    "elapsed_seconds": 23.45
  }
}
```

---

## 🚀 Caching Strategy

### Multi-Tier TTL System

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHE TTL STRATEGY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                            │
│  │  CACHE_TTL_LONG │  600 seconds (10 minutes)                 │
│  │  ─────────────  │  • Store details (rarely change)          │
│  │  Stable Data    │  • Store list                             │
│  └─────────────────┘                                            │
│                                                                 │
│  ┌─────────────────┐                                            │
│  │  CACHE_TTL      │  300 seconds (5 minutes)                  │
│  │  ─────────────  │  • Dashboard summary                      │
│  │  Default        │  • Store dashboards                       │
│  └─────────────────┘                                            │
│                                                                 │
│  ┌─────────────────┐                                            │
│  │  CACHE_TTL_SHORT│  60 seconds (1 minute)                    │
│  │  ─────────────  │  • Store orders (frequently change)       │
│  │  Dynamic Data   │  • Real-time metrics                      │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Preloading on Startup

When the application starts, it automatically preloads all data:

```
🚀 Starting application...
✓ Connected to Upstash Redis
✓ Cache system connected
🔄 Preloading cache...
✓ Cache preloaded in 23.45s (100 stores)
```

**What gets preloaded:**

1. ✅ Dashboard Summary - All stores with aggregated metrics
2. ✅ Store List - Complete list of all 100 stores
3. ✅ Individual Store Dashboards - Pre-computed for each store

### Performance Comparison

| Scenario                   | Response Time  | Improvement     |
| -------------------------- | -------------- | --------------- |
| 🔴 Cache MISS (sequential) | ~15-20 seconds | Baseline        |
| 🟡 Cache MISS (parallel)   | ~3-5 seconds   | **4x faster**   |
| 🟢 Cache HIT               | ~20-50ms       | **400x faster** |

### Parallel Fetching Optimization

```python
# ❌ Before: Sequential fetching (slow)
for store in stores:
    orders = await fetch_orders(store.id)  # 100 sequential requests

# ✅ After: Parallel fetching with semaphore (fast)
semaphore = asyncio.Semaphore(10)  # Limit to 10 concurrent
tasks = [fetch_with_semaphore(store) for store in stores]
results = await asyncio.gather(*tasks)  # All in parallel!
```

---

## 📋 Problem Understanding

### Core Requirements Implemented

| Requirement                       | Status | Implementation                        |
| --------------------------------- | ------ | ------------------------------------- |
| Display store performance metrics | ✅     | SummaryCards, MetricsCards components |
| Show order feed                   | ✅     | OrdersTable, OrdersFeed components    |
| Calculate store health score      | ✅     | Success rate calculation              |
| Detect anomalies                  | ✅     | AnomalyAlerts component               |
| Real-time updates                 | ✅     | Polling with cache refresh            |

### Assumptions Made

1. **Data Freshness**: 5-minute cache TTL provides good balance between freshness and performance
2. **Parallel Requests**: Limited to 10 concurrent to avoid overwhelming the API
3. **Error Handling**: Graceful degradation when cache is unavailable
4. **Type Safety**: All data properly typed with TypeScript interfaces

### Key Design Decisions

| Decision                | Rationale                                                   |
| ----------------------- | ----------------------------------------------------------- |
| **Upstash Redis**       | Serverless, no infrastructure management, works with Vercel |
| **Zustand over Redux**  | Simpler API, less boilerplate, sufficient for this scale    |
| **httpx over requests** | Native async support, connection pooling                    |
| **Material UI**         | Rich component library, consistent design system            |

---

## 📊 Data Visualization

### Charts Implemented

| Chart Type    | Component            | Purpose                  |
| ------------- | -------------------- | ------------------------ |
| 📊 Bar Chart  | `StatusChart.tsx`    | Order status breakdown   |
| 🥧 Pie Chart  | `OrderStatusPie.tsx` | Order distribution       |
| 📈 Line Chart | `RevenueChart.tsx`   | Revenue trends over time |
| 🃏 Stat Cards | `SummaryCards.tsx`   | Key metrics at a glance  |

### Metrics Calculated

```typescript
{
  total_orders: number; // Total order count
  completed_orders: number; // Successfully completed
  failed_orders: number; // Failed orders
  cancelled_orders: number; // Cancelled by user/system
  processing_orders: number; // Currently processing
  total_revenue: number; // Sum of completed order amounts
  success_rate: number; // (completed / total) × 100
  avg_order_value: number; // revenue / completed orders
  avg_processing_time: number; // Mean processing time
}
```

---

## 🎨 UI/UX Features

### Design Principles

- **Clean & Modern**: Material UI with custom theming
- **Data-Dense**: Maximum information without visual clutter
- **Responsive**: Desktop, tablet, and mobile layouts
- **Accessible**: Proper contrast ratios and semantic HTML

### Color Coding System

| Color     | Meaning    | Usage                              |
| --------- | ---------- | ---------------------------------- |
| 🟢 Green  | Success    | Completed orders, positive metrics |
| 🔵 Blue   | Processing | In-progress orders, neutral info   |
| 🔴 Red    | Error      | Failed orders, alerts              |
| 🟡 Yellow | Warning    | Cancelled orders, cautions         |

---

## 📱 Responsive Breakpoints

| Breakpoint  | Screen Size    | Layout                       |
| ----------- | -------------- | ---------------------------- |
| **Mobile**  | < 768px        | Single column, stacked cards |
| **Tablet**  | 768px - 1024px | Two column grid              |
| **Desktop** | > 1024px       | Full dashboard layout        |

---

## 🐛 Known Issues & Future Improvements

### Current Limitations

- [ ] No real-time WebSocket updates (uses polling)
- [ ] Limited to pre-defined time ranges
- [ ] No user authentication system
- [ ] No data export functionality (CSV/PDF)

### Planned Improvements

#### Phase 1: Enhanced Features

- [ ] WebSocket integration for real-time order updates
- [ ] Custom date range selector with calendar picker
- [ ] CSV/PDF export for reports
- [ ] Store comparison view (side-by-side)

#### Phase 2: Advanced Analytics

- [ ] Predictive analytics for order volume
- [ ] Anomaly detection using ML
- [ ] Heat maps for peak hours
- [ ] Revenue forecasting

#### Phase 3: Platform Features

- [ ] User authentication & role-based access
- [ ] Multi-tenant support
- [ ] Email/Slack notification integrations
- [ ] Mobile app (React Native)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests (if configured)
npm run test:e2e
```

---

## 📦 Deployment

### Backend Deployment

#### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Railway / Render

```bash
# Set environment variables in dashboard
REDIS_URL=rediss://...
MOCK_API_URL=https://...
```

### Frontend Deployment

#### Vercel

```bash
npm run build
vercel deploy
```

#### Netlify

```bash
npm run build
# Deploy the `build` folder
```

---

## 🔧 Environment Variables Reference

| Variable          | Required | Default | Description                     |
| ----------------- | -------- | ------- | ------------------------------- |
| `REDIS_URL`       | ✅ Yes   | -       | Upstash Redis connection string |
| `CACHE_TTL`       | No       | 300     | Default cache TTL (seconds)     |
| `CACHE_TTL_SHORT` | No       | 60      | Short TTL for dynamic data      |
| `CACHE_TTL_LONG`  | No       | 600     | Long TTL for stable data        |
| `MOCK_API_URL`    | ✅ Yes   | -       | External data API endpoint      |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Harish**

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Built with ❤️ using React, FastAPI, and Redis

**[Live Demo](#) • [Report Bug](../../issues) • [Request Feature](../../issues)**

</div>
