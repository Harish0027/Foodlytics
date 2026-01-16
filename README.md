# Restaurant Order Monitoring Dashboard

## Overview

This project is a **full‑stack restaurant order monitoring dashboard** built as part of a time‑boxed technical assessment. The goal was to design and implement a production‑style dashboard that visualizes store performance, monitors real‑time orders, computes an operational **health score**, and detects basic anomalies using a provided **mock API and WebSocket server**.

The solution focuses on **clarity, correctness, scalability, and real‑world architecture**, prioritizing core functionality within the given time constraints.

---

## Key Features

### Core Features (Completed)

* Store list with basic information
* Store‑level performance metrics

  * Order success rate
  * Average processing time
  * Revenue
* **Health Score (0–100)** per store
* Real‑time order feed via WebSockets
* Basic anomaly detection

  * High failure rate
  * Slow order processing

### Expected Enhancements (Completed)

* Store selector & filtering
* Visual health indicators (color‑coded)
* Time‑based metrics (last hour / last 24 hours)
* Order status breakdown

### Bonus Considerations

* Real‑time WebSocket integration
* Modular, maintainable codebase
* Clear documentation and assumptions

---

## Available Resources

The assessment provides a **pre-built backend service** that exposes REST APIs and WebSocket endpoints required for the dashboard.

* **API Documentation:** [https://assessment-6xdhr.ondigitalocean.app/docs](https://assessment-6xdhr.ondigitalocean.app/docs)
* **Production Server:** [https://assessment-6xdhr.ondigitalocean.app](https://assessment-6xdhr.ondigitalocean.app)

These services act as the single source of truth for all stores, orders, metrics, and real-time updates. The application strictly consumes these endpoints without modifying or generating custom mock data.

---

## Tech Stack

### Frontend

* **React (TypeScript)**
* Component-based architecture
* Fetch API for REST integration
* WebSocket API for real-time updates

### Backend

* **FastAPI (Python)**
* Pydantic models for validation
* Service layer for business logic

## System Architecture

```
Mock API + WebSocket (Port 3001)
        │
        ▼
FastAPI Backend (Port 8000)
        │
        ▼
React Frontend (Port 3000)
```

* The backend acts as a **clean abstraction layer** over the mock API
* The frontend communicates **only with the backend**, not directly with the mock API
* Real‑time data flows from the WebSocket → backend → frontend state

---

## Health Score Algorithm

Each store is assigned a **health score between 0 and 100**, calculated using weighted operational metrics.

### Metrics Used

* **Order Success Rate** (weight: 40%)
* **Average Processing Time** (weight: 30%)
* **Failure Rate / Anomalies** (weight: 20%)
* **Order Volume Stability** (weight: 10%)

### Example Formula (Simplified)

```
healthScore =
  (successRate * 0.4) +
  (processingTimeScore * 0.3) +
  (anomalyScore * 0.2) +
  (volumeScore * 0.1)
```

The score is normalized to a **0–100 scale**.

### Visual Mapping

* 🟢 **80–100** → Healthy
* 🟡 **50–79** → Warning
* 🔴 **0–49** → Critical

---

## Anomaly Detection Logic

Basic, explainable rules were implemented:

* **High failure rate** → failure rate > threshold
* **Slow processing** → avg processing time exceeds baseline

Detected anomalies are:

* Highlighted visually
* Reflected in the health score

This approach prioritizes **interpretability over complexity**, suitable for a monitoring dashboard.

---

## Real‑Time Data Flow (WebSockets)

1. Mock server emits new orders via WebSocket (`ws://localhost:3001`)
2. Backend subscribes to the WebSocket
3. Incoming orders are:

   * Parsed
   * Validated
   * Added to in‑memory state
4. Backend pushes updates to frontend consumers
5. Frontend updates:

   * Order feed
   * Metrics
   * Health score (live recalculation)

This ensures the UI reflects **live operational state** without refresh.

---

## How Backend & Frontend Are Integrated

* Backend fetches data from mock API endpoints:

  * `/api/stores`
  * `/api/stores/{id}/orders`
  * `/api/stores/{id}/metrics`
* Backend exposes simplified endpoints for frontend consumption
* Frontend calls backend APIs only (single source of truth)

This separation mirrors **real production systems**.

---

## How to Run the Project

### Prerequisites

* Node.js (v18+ recommended)
* Python 3.10+
* npm / pip

---

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

Backend will run at:

```
http://localhost:8000
```

---

### Frontend Setup

```bash
# Navigate to frontend directory
cd Foodlytics/frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

### Data Source

The assessment provides a **production-like API and WebSocket service**, documented and hosted externally.

All store data, order history, metrics, and real-time events are fetched from this service as provided, without altering schemas or generating additional mock data.

This design choice ensures the implementation closely mirrors a real-world third-party integration scenario.

---

## Assumptions Made

* Mock API responses are reliable and well‑formed
* Health score prioritizes **operational stability** over revenue
* Real‑time updates are transient (no persistence required)
* Authentication is out of scope for this assessment

---

## What I Would Improve With More Time

* Persist historical metrics (database)
* Advanced anomaly detection (trend‑based / ML)
* Charts for time‑series visualization
* Unit & integration tests
* Role‑based views (admin vs operator)

---

## Time Management Summary

* Setup & Planning: ~15 min
* Backend API & Services: ~45 min
* Frontend UI & State: ~60 min
* Health Score Logic: ~30 min
* Integration & Testing: ~30 min
* Documentation: ~15 min

Focused on **delivering all core requirements first**, then polishing.

---

## Conclusion

This project demonstrates:

* Full‑stack ownership
* Real‑time system design
* Clean separation of concerns
* Practical problem‑solving under time constraints

The solution is **production‑minded**, easy to reason about, and extensible.

---

Thank you for reviewing this submission.
