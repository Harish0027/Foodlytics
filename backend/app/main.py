import os
import json
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Any
import httpx
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import redis

# Load environment variables from the correct path
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Configuration from environment
MOCK_API_URL = os.getenv("MOCK_API_URL", "https://assessment-6xdhr.ondigitalocean.app")
REDIS_URL = os.getenv("REDIS_URL")
CACHE_TTL = int(os.getenv("CACHE_TTL", 300))
CACHE_TTL_SHORT = 60  # Short TTL for frequently changing data
CACHE_TTL_LONG = 600  # Long TTL for stable data

# Cache key constants
CACHE_KEYS = {
    "STORES": "foodlytics:stores:all",
    "DASHBOARD_SUMMARY": "foodlytics:dashboard:summary",
    "PRELOAD_STATUS": "foodlytics:preload:status",
}

# Redis client instance
redis_client: Optional[redis.Redis] = None

# HTTP client for connection pooling (reused across requests)
http_client: Optional[httpx.AsyncClient] = None


def get_redis_client() -> Optional[redis.Redis]:
    """Get or create Redis client connection"""
    global redis_client
    
    if redis_client is not None:
        try:
            redis_client.ping()
            return redis_client
        except:
            redis_client = None
    
    if not REDIS_URL:
        print(" REDIS_URL not set, running without cache")
        return None
    
    try:
        redis_client = redis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True
        )
        # Test connection
        redis_client.ping()
        print(" Connected to Upstash Redis")
        return redis_client
    except Exception as e:
        print(f" Failed to connect to Redis: {e}")
        return None


async def get_http_client() -> httpx.AsyncClient:
    """Get or create HTTP client with connection pooling"""
    global http_client
    if http_client is None or http_client.is_closed:
        http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=10.0),
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
        )
    return http_client


async def cache_get(key: str) -> Optional[Any]:
    """Get value from cache"""
    client = get_redis_client()
    if not client:
        return None
    
    try:
        data = client.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        print(f" Cache get error: {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = None) -> bool:
    """Set value in cache with TTL"""
    client = get_redis_client()
    if not client:
        return False
    
    try:
        ttl = ttl or CACHE_TTL
        serialized = json.dumps(value, default=str)
        client.setex(key, ttl, serialized)
        return True
    except Exception as e:
        print(f" Cache set error: {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Delete key from cache"""
    client = get_redis_client()
    if not client:
        return False
    
    try:
        client.delete(key)
        return True
    except Exception as e:
        print(f" Cache delete error: {e}")
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """Delete all keys matching pattern"""
    client = get_redis_client()
    if not client:
        return 0
    
    try:
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
        return 0
    except Exception as e:
        print(f" Cache delete pattern error: {e}")
        return 0


def is_cache_connected() -> bool:
    """Check if Redis is connected"""
    client = get_redis_client()
    if not client:
        return False
    try:
        client.ping()
        return True
    except:
        return False


# ============== OPTIMIZED DATA FETCHING ==============

async def fetch_all_stores() -> List[Dict]:
    """Fetch all stores from mock API"""
    client = await get_http_client()
    response = await client.get(f"{MOCK_API_URL}/api/stores")
    response.raise_for_status()
    return response.json().get("stores", [])


async def fetch_store_orders(store_id: str) -> List[Dict]:
    """Fetch store orders from mock API"""
    client = await get_http_client()
    response = await client.get(f"{MOCK_API_URL}/api/stores/{store_id}/orders")
    response.raise_for_status()
    return response.json().get("orders", [])


async def fetch_store_data_parallel(store_id: str) -> Dict:
    """Fetch store details and orders in parallel for faster loading"""
    client = await get_http_client()
    
    # Create parallel tasks
    store_task = asyncio.create_task(
        client.get(f"{MOCK_API_URL}/api/stores/{store_id}")
    )
    orders_task = asyncio.create_task(
        client.get(f"{MOCK_API_URL}/api/stores/{store_id}/orders")
    )
    
    # Wait for both to complete
    store_response, orders_response = await asyncio.gather(store_task, orders_task)
    
    store_response.raise_for_status()
    orders_response.raise_for_status()
    
    return {
        "store": store_response.json().get("store"),
        "orders": orders_response.json().get("orders", [])
    }


async def fetch_all_stores_with_orders() -> Dict:
    """Fetch all stores and their orders in parallel - optimized"""
    stores = await fetch_all_stores()
    
    # Fetch orders for all stores in parallel with concurrency limit
    semaphore = asyncio.Semaphore(10)  # Limit concurrent requests
    
    async def fetch_with_semaphore(store: Dict) -> tuple:
        async with semaphore:
            try:
                orders = await fetch_store_orders(store["id"])
                return store["id"], orders
            except Exception as e:
                print(f" Failed to fetch orders for {store['id']}: {e}")
                return store["id"], []
    
    tasks = [fetch_with_semaphore(store) for store in stores]
    results = await asyncio.gather(*tasks)
    
    # Build orders map
    orders_map = dict(results)
    
    # Aggregate all data
    all_orders = []
    total_revenue = 0.0
    completed_orders = 0
    failed_orders = 0
    cancelled_orders = 0
    processing_orders = 0
    
    # Helper to safely convert to float
    def safe_float(value, default=0):
        if value is None:
            return default
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            try:
                return float(value)
            except:
                return default
        return default
    
    for store in stores:
        store_orders = orders_map.get(store["id"], [])
        for order in store_orders:
            order["store_name"] = store.get("name", "Unknown")
            all_orders.append(order)
            
            status = order.get("status")
            if status == "completed":
                completed_orders += 1
                total_revenue += safe_float(order.get("total_amount"))
            elif status == "failed":
                failed_orders += 1
            elif status == "cancelled":
                cancelled_orders += 1
            elif status == "processing":
                processing_orders += 1
    
    total_orders_count = len(all_orders)
    avg_order_value = total_revenue / completed_orders if completed_orders > 0 else 0
    success_rate = (completed_orders / total_orders_count * 100) if total_orders_count > 0 else 0
    
    return {
        "stores": stores,
        "orders": all_orders,
        "summary": {
            "total_stores": len(stores),
            "total_orders": total_orders_count,
            "total_revenue": round(total_revenue, 2),
            "completed_orders": completed_orders,
            "failed_orders": failed_orders,
            "cancelled_orders": cancelled_orders,
            "processing_orders": processing_orders,
            "avg_order_value": round(avg_order_value, 2),
            "success_rate": round(success_rate, 1)
        }
    }


def calculate_store_metrics(orders: List[Dict]) -> Dict:
    """Calculate metrics from orders list"""
    total_orders = len(orders)
    completed = [o for o in orders if o.get("status") == "completed"]
    failed = [o for o in orders if o.get("status") == "failed"]
    cancelled = [o for o in orders if o.get("status") == "cancelled"]
    processing = [o for o in orders if o.get("status") == "processing"]
    
    # Helper to safely convert to float
    def safe_float(value, default=0):
        if value is None:
            return default
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            try:
                return float(value)
            except:
                return default
        return default
    
    total_revenue = sum(safe_float(o.get("total_amount")) for o in completed)
    success_rate = (len(completed) / total_orders * 100) if total_orders > 0 else 0
    
    processing_times = [safe_float(o.get("processing_time_seconds")) for o in completed 
                       if o.get("processing_time_seconds") is not None]
    avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
    avg_order_value = total_revenue / len(completed) if completed else 0
    
    return {
        "total_orders": total_orders,
        "completed_orders": len(completed),
        "failed_orders": len(failed),
        "cancelled_orders": len(cancelled),
        "processing_orders": len(processing),
        "total_revenue": round(total_revenue, 2),
        "success_rate": round(success_rate, 1),
        "avg_processing_time_seconds": round(avg_processing_time, 0),
        "avg_order_value": round(avg_order_value, 2)
    }


# ============== CACHE PRELOADING ==============

async def preload_cache():
    """Preload cache with all data on startup for instant responses"""
    print("🔄 Preloading cache...")
    start_time = datetime.now()
    
    try:
        # Fetch and cache dashboard summary
        summary_data = await fetch_all_stores_with_orders()
        await cache_set(CACHE_KEYS["DASHBOARD_SUMMARY"], summary_data, CACHE_TTL)
        
        # Cache stores list
        stores = summary_data.get("stores", [])
        await cache_set(CACHE_KEYS["STORES"], {"stores": stores}, CACHE_TTL_LONG)
        
        # Preload individual store dashboards
        for store in stores:
            store_id = store["id"]
            cache_key = f"foodlytics:store:dashboard:{store_id}"
            
            # Filter orders for this store
            store_orders = [o for o in summary_data.get("orders", []) 
                          if o.get("store_id") == store_id]
            metrics = calculate_store_metrics(store_orders)
            
            store_data = {
                "store": store,
                "orders": store_orders,
                "metrics": metrics
            }
            await cache_set(cache_key, store_data, CACHE_TTL)
        
        elapsed = (datetime.now() - start_time).total_seconds()
        print(f" Cache preloaded in {elapsed:.2f}s ({len(stores)} stores)")
        
        await cache_set(CACHE_KEYS["PRELOAD_STATUS"], {
            "status": "completed",
            "timestamp": datetime.now().isoformat(),
            "stores_count": len(stores),
            "elapsed_seconds": elapsed
        }, CACHE_TTL_LONG)
        
    except Exception as e:
        print(f" Cache preload failed: {e}")
        await cache_set(CACHE_KEYS["PRELOAD_STATUS"], {
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }, 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    global http_client
    
    # Startup
    print(" Starting application...")
    
    # Initialize HTTP client with connection pooling
    http_client = await get_http_client()
    
    # Initialize Redis
    client = get_redis_client()
    if client and is_cache_connected():
        print(" Cache system connected")
        # Preload cache in background for instant responses
        asyncio.create_task(preload_cache())
    else:
        print(" Running without cache")
    
    yield
    
    # Shutdown
    print(" Shutting down...")
    global redis_client
    if redis_client:
        redis_client.close()
    if http_client:
        await http_client.aclose()
    print("Cleanup complete")


app = FastAPI(title="Restaurant Dashboard API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    preload_status = await cache_get(CACHE_KEYS["PRELOAD_STATUS"])
    return {
        "message": "Restaurant Dashboard API",
        "version": "1.0.0",
        "cache": "connected" if is_cache_connected() else "disconnected",
        "preload": preload_status
    }


@app.get("/api/dashboard/store/{store_id}")
async def get_store_dashboard(store_id: str):
    """
    GET /api/dashboard/store/{store_id}
    Fetch store details and orders with optimized parallel fetching
    Uses Redis caching for improved performance
    """
    cache_key = f"foodlytics:store:dashboard:{store_id}"
    
    # Try to get from cache first (instant response)
    cached_data = await cache_get(cache_key)
    if cached_data:
        print(f" Cache HIT for store {store_id}")
        return cached_data
    
    print(f" Cache MISS for store {store_id}, fetching from API...")
    
    try:
        # Fetch store and orders in parallel for faster loading
        data = await fetch_store_data_parallel(store_id)
        orders = data["orders"]
        
        # Calculate metrics
        metrics = calculate_store_metrics(orders)
        
        response_data = {
            "store": data["store"],
            "orders": orders,
            "metrics": metrics
        }
        
        # Cache the response
        await cache_set(cache_key, response_data)
        
        return response_data
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
    """
    GET /api/dashboard/summary
    Fetch all stores with parallel order fetching for faster loading
    Uses Redis caching for improved performance
    """
    cache_key = CACHE_KEYS["DASHBOARD_SUMMARY"]
    
    # Try to get from cache first (instant response)
    cached_data = await cache_get(cache_key)
    if cached_data:
        print(" Cache HIT for dashboard summary")
        return cached_data
    
    print("Cache MISS for dashboard summary, fetching from API...")
    
    try:
        # Use optimized parallel fetching
        response_data = await fetch_all_stores_with_orders()
        
        # Cache the response
        await cache_set(cache_key, response_data)
        
        return response_data
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/stores")
async def get_stores():
    """Get all stores with caching"""
    cache_key = CACHE_KEYS["STORES"]
    
    cached_data = await cache_get(cache_key)
    if cached_data:
        print(" Cache HIT for stores list")
        return cached_data
    
    print(" Cache MISS for stores list, fetching from API...")
    
    try:
        stores = await fetch_all_stores()
        data = {"stores": stores}
        await cache_set(cache_key, data, CACHE_TTL_LONG)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stores/{store_id}")
async def get_store(store_id: str):
    """Get store details with caching"""
    cache_key = f"foodlytics:store:details:{store_id}"
    
    cached_data = await cache_get(cache_key)
    if cached_data:
        print(f" Cache HIT for store details {store_id}")
        return cached_data
    
    print(f"Cache MISS for store details {store_id}, fetching from API...")
    
    try:
        client = await get_http_client()
        response = await client.get(f"{MOCK_API_URL}/api/stores/{store_id}")
        response.raise_for_status()
        data = response.json()
        await cache_set(cache_key, data, CACHE_TTL_LONG)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stores/{store_id}/orders")
async def get_store_orders(store_id: str):
    """Get store orders with caching"""
    cache_key = f"foodlytics:store:orders:{store_id}"
    
    cached_data = await cache_get(cache_key)
    if cached_data:
        print(f" Cache HIT for store orders {store_id}")
        return cached_data
    
    print(f"Cache MISS for store orders {store_id}, fetching from API...")
    
    try:
        orders = await fetch_store_orders(store_id)
        data = {"orders": orders}
        await cache_set(cache_key, data, CACHE_TTL_SHORT)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Cache Management Endpoints
@app.post("/api/cache/invalidate/{store_id}")
async def invalidate_store_cache(store_id: str):
    """Invalidate cache for a specific store"""
    await cache_delete(f"foodlytics:store:dashboard:{store_id}")
    await cache_delete(f"foodlytics:store:details:{store_id}")
    await cache_delete(f"foodlytics:store:orders:{store_id}")
    return {"status": "success", "message": f"Cache invalidated for store {store_id}"}


@app.post("/api/cache/invalidate-all")
async def invalidate_all_cache():
    """Invalidate all cache"""
    deleted = await cache_delete_pattern("foodlytics:*")
    return {"status": "success", "message": f"All cache invalidated ({deleted} keys)"}


@app.post("/api/cache/refresh")
async def refresh_cache(background_tasks: BackgroundTasks):
    """Trigger cache refresh in background"""
    background_tasks.add_task(preload_cache)
    return {"status": "success", "message": "Cache refresh started in background"}


@app.get("/api/cache/status")
async def cache_status():
    """Get cache connection status"""
    preload_status = await cache_get(CACHE_KEYS["PRELOAD_STATUS"])
    return {
        "connected": is_cache_connected(),
        "ttl_seconds": CACHE_TTL,
        "ttl_short": CACHE_TTL_SHORT,
        "ttl_long": CACHE_TTL_LONG,
        "redis_url_configured": bool(REDIS_URL),
        "preload": preload_status
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "cache": is_cache_connected(),
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
