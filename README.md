# Restaurant Dashboard Assessment - Starter Template

Welcome to the Restaurant Dashboard assessment! You have 3 hours to build a full-stack application.

## Your Task

Build a restaurant order monitoring dashboard that:
1. Displays store performance metrics
2. Shows real-time order feed
3. Calculates a "health score" for stores
4. Detects anomalies in operations

## Available Resources

### Mock API Server
The mock API is already running at `http://localhost:3001` with these endpoints:

- `GET /api/stores` - List of restaurant stores
- `GET /api/stores/:storeId` - Single store details
- `GET /api/stores/:storeId/orders` - Store's orders
- `GET /api/stores/:storeId/metrics` - Store metrics
- `GET /api/orders/history` - Historical orders
- `POST /api/orders/generate` - Generate test orders
- `WS ws://localhost:3001` - WebSocket for real-time orders

## Project Structure

```
starter-template/
├── backend/           # FastAPI backend (Python)
│   ├── app/
│   │   ├── main.py   # FastAPI application
│   │   ├── models.py # Pydantic models
│   │   └── services.py # Business logic
│   └── requirements.txt
├── frontend/          # React frontend (TypeScript)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── services/
│   └── package.json
└── docker-compose.yml # Optional
```

## Getting Started

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Requirements Checklist

### Must Complete (Core Features)
- [ ] Display store list with basic info
- [ ] Show store metrics (success rate, avg processing time, revenue)
- [ ] Implement health score algorithm (0-100)
- [ ] Display real-time order feed
- [ ] Basic anomaly detection (high failure rate, slow processing)

### Should Complete (Expected Features)
- [x] Store selector/filter
- [x] Visual health indicator (color-coded)
- [x] Time-based metrics (last hour, last 24h)
- [x] Order status breakdown

### Nice to Have (Bonus)
- [ ] WebSocket integration for real-time updates
- [ ] Charts/graphs for trends
- [ ] Advanced anomaly detection
- [ ] Clean, polished UI

## Time Management

Suggested time allocation:
- Setup & Planning: 15 min
- Backend API: 45 min
- Frontend UI: 60 min
- Health Score Algorithm: 30 min
- Integration & Testing: 30 min
- Documentation: 15 min

## Evaluation Criteria

You will be evaluated on:
1. **Core Functionality** (40%) - Does it work?
2. **Problem Solving** (30%) - How did you approach the health score?
3. **Code Quality** (20%) - Is the code clean and organized?
4. **Time Management** (10%) - Did you complete core features?

## Tips

1. Start simple, get basic functionality working first
2. Use the mock API - don't create your own data
3. Focus on functionality over aesthetics
4. Document your health score algorithm
5. Comment complex logic

## Submission

After 3 hours, submit:
1. Your complete code
2. Updated README with:
   - Setup instructions
   - Health score algorithm explanation
   - Any assumptions made
   - What you'd improve with more time

Good luck! Start your timer now.