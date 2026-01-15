import axios from "axios";
import { Store, Order, StoreMetrics, HealthScore, Anomaly } from "../types";

// API endpoints
const BACKEND_API_URL = "http://localhost:8000";
const MOCK_API_URL = "http://localhost:3001";

class ApiService {
  // Fetch stores from mock API
  async getStores(): Promise<Store[]> {
    try {
      const response = await axios.get(`${MOCK_API_URL}/api/stores`);
      return response.data.stores;
    } catch (error) {
      console.error("Error fetching stores:", error);
      throw error;
    }
  }

  // Fetch store metrics from backend
  async getStoreMetrics(storeId: string): Promise<StoreMetrics> {
    try {
      // TODO: Implement this to call your backend
      const response = await axios.get(
        `${BACKEND_API_URL}/api/metrics/store/${storeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      // Return mock data for now
      return {
        store_id: storeId,
        total_orders_24h: 0,
        total_orders_1h: 0,
        success_rate: 0,
        failure_rate: 0,
        avg_processing_time_minutes: 0,
        total_revenue_24h: 0,
        avg_order_value: 0,
        orders_per_hour: 0,
        error_breakdown: {},
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Fetch health score from backend
  async getHealthScore(storeId: string): Promise<HealthScore> {
    try {
      // TODO: Implement this to call your backend
      const response = await axios.get(
        `${BACKEND_API_URL}/api/health-score/${storeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health score:", error);
      // Return mock data for now
      return {
        store_id: storeId,
        score: 75,
        status: "healthy",
        factors: {
          success_rate: 85,
          processing_time: 70,
          revenue_trend: 75,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Fetch orders from mock API
  async getOrders(storeId: string, limit: number = 20): Promise<Order[]> {
    try {
      const response = await axios.get(
        `${MOCK_API_URL}/api/stores/${storeId}/orders`,
        {
          params: { limit },
        }
      );
      return response.data.orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  // Fetch store orders from backend API
  async getStoreOrders(storeId: string): Promise<Order[]> {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/stores/${storeId}/orders`
      );
      return response.data.orders || response.data || [];
    } catch (error) {
      console.error("Error fetching store orders:", error);
      return [];
    }
  }

  // Detect anomalies
  async detectAnomalies(storeId?: string): Promise<Anomaly[]> {
    try {
      // TODO: Implement this to call your backend
      const response = await axios.get(
        `${BACKEND_API_URL}/api/anomalies/detect`,
        {
          params: { store_id: storeId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error detecting anomalies:", error);
      return [];
    }
  }

  // Connect to WebSocket for real-time orders
  connectToOrderStream(onMessage: (order: Order) => void): WebSocket {
    const ws = new WebSocket("ws://localhost:8000/ws/orders");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_order") {
          onMessage(data.data);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return ws;
  }
}

export const apiService = new ApiService();
