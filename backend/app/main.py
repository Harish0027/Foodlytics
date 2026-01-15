from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import httpx
from datetime import datetime, timedelta, timezone

app = FastAPI(title="Restaurant Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock API base URL
MOCK_API_URL = "https://assessment-6xdhr.ondigitalocean.app"


@app.get("/")
async def root():
    return {"message": "Restaurant Dashboard API", "version": "1.0.0"}


@app.get("/api/dashboard/store/{store_id}")
async def get_store_dashboard(
    store_id: str,
    time_range: Optional[str] = Query("24h", description="Time range: 1h, 24h, 7d")
):
    """
    GET /api/dashboard/store/{store_id}
    Fetch store details and orders, combine and return both datasets
    Supports time_range parameter: 1h, 24h, 7d
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Fetch store details
            store_response = await client.get(f"{MOCK_API_URL}/api/stores/{store_id}")
            store_response.raise_for_status()
            store_data = store_response.json()
            
            # Fetch store orders
            orders_response = await client.get(f"{MOCK_API_URL}/api/stores/{store_id}/orders")
            orders_response.raise_for_status()
            orders_data = orders_response.json()
            
            # Filter orders by time range
            all_orders = orders_data.get("orders", [])
            cutoff_time = _get_cutoff_time(time_range)
            orders = []
            for o in all_orders:
                try:
                    order_time_str = o.get("created_at", "")
                    if order_time_str:
                        # Parse ISO format datetime, handling both Z and +00:00 formats
                        order_time_str = order_time_str.replace("Z", "+00:00")
                        order_time = datetime.fromisoformat(order_time_str)
                        # Make naive datetimes timezone-aware (UTC)
                        if order_time.tzinfo is None:
                            order_time = order_time.replace(tzinfo=timezone.utc)
                        if order_time >= cutoff_time:
                            orders.append(o)
                except (ValueError, AttributeError):
                    orders.append(o)  # Include orders with parsing issues
            
            # Calculate metrics from orders
            total_orders = len(orders)
            completed_orders = [o for o in orders if o.get("status") == "completed"]
            failed_orders = [o for o in orders if o.get("status") == "failed"]
            cancelled_orders = [o for o in orders if o.get("status") == "cancelled"]
            processing_orders = [o for o in orders if o.get("status") == "processing"]
            
            # Calculate revenue
            total_revenue = sum(o.get("total_amount", 0) for o in completed_orders)
            
            # Calculate success rate
            success_rate = (len(completed_orders) / total_orders * 100) if total_orders > 0 else 0
            
            # Calculate average processing time
            processing_times = [o.get("processing_time_seconds", 0) for o in completed_orders if o.get("processing_time_seconds")]
            avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
            
            # Calculate average order value
            avg_order_value = total_revenue / len(completed_orders) if completed_orders else 0
            
            return {
                "store": store_data.get("store"),
                "orders": orders,
                "time_range": time_range,
                "metrics": {
                    "total_orders": total_orders,
                    "completed_orders": len(completed_orders),
                    "failed_orders": len(failed_orders),
                    "cancelled_orders": len(cancelled_orders),
                    "processing_orders": len(processing_orders),
                    "total_revenue": round(total_revenue, 2),
                    "success_rate": round(success_rate, 1),
                    "avg_processing_time_seconds": round(avg_processing_time, 0),
                    "avg_order_value": round(avg_order_value, 2),
                    "time_range": time_range
                }
            }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/dashboard/summary")
async def get_dashboard_summary(
    time_range: Optional[str] = Query("24h", description="Time range: 1h, 24h, 7d")
):
    """
    GET /api/dashboard/summary
    Fetch all stores, calculate total counts and revenue, return summary statistics
    Supports time_range parameter: 1h, 24h, 7d
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Fetch all stores
            stores_response = await client.get(f"{MOCK_API_URL}/api/stores")
            stores_response.raise_for_status()
            stores_data = stores_response.json()
            
            stores = stores_data.get("stores", [])
            
            # Initialize summary
            total_stores = len(stores)
            total_orders = 0
            completed_orders = 0
            failed_orders = 0
            cancelled_orders = 0
            processing_orders = 0
            total_revenue = 0.0
            all_orders = []
            cutoff_time = _get_cutoff_time(time_range)
            
            # Fetch orders for each store and aggregate
            for store in stores:
                store_id = store.get("id")
                try:
                    orders_response = await client.get(f"{MOCK_API_URL}/api/stores/{store_id}/orders")
                    if orders_response.status_code == 200:
                        orders_data = orders_response.json()
                        orders = orders_data.get("orders", [])
                        
                        for order in orders:
                            order["store_name"] = store.get("name", "Unknown")
                            all_orders.append(order)
                            
                            total_orders += 1
                            status = order.get("status")
                            if status == "completed":
                                completed_orders += 1
                                total_revenue += order.get("total_amount", 0)
                            elif status == "failed":
                                failed_orders += 1
                            elif status == "cancelled":
                                cancelled_orders += 1
                            elif status == "processing":
                                processing_orders += 1
                except Exception:
                    continue
            
            # Calculate averages
            avg_order_value = total_revenue / completed_orders if completed_orders > 0 else 0
            success_rate = (completed_orders / total_orders * 100) if total_orders > 0 else 0
            
            return {
                "stores": stores,
                "orders": all_orders,
                "time_range": time_range,
                "summary": {
                    "total_stores": total_stores,
                    "total_orders": total_orders,
                    "total_revenue": round(total_revenue, 2),
                    "completed_orders": completed_orders,
                    "failed_orders": failed_orders,
                    "cancelled_orders": cancelled_orders,
                    "processing_orders": processing_orders,
                    "avg_order_value": round(avg_order_value, 2),
                    "success_rate": round(success_rate, 1)
                }
            }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/stores")
async def get_stores():
    """Proxy endpoint to get all stores"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{MOCK_API_URL}/api/stores")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stores/{store_id}")
async def get_store(store_id: str):
    """Proxy endpoint to get store details"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{MOCK_API_URL}/api/stores/{store_id}")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stores/{store_id}/orders")
async def get_store_orders(store_id: str):
    """Proxy endpoint to get store orders"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{MOCK_API_URL}/api/stores/{store_id}/orders")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _get_cutoff_time(time_range: str) -> datetime:
    """
    Calculate cutoff datetime based on time_range parameter.
    Supported ranges: 1h, 24h, 7d
    Returns timezone-aware datetime in UTC
    """
    now = datetime.now(timezone.utc)
    if time_range == "1h":
        return now - timedelta(hours=1)
    elif time_range == "7d":
        return now - timedelta(days=7)
    else:  # Default to 24h
        return now - timedelta(hours=24)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
