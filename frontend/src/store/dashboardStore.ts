// @ts-nocheck
import { create } from "zustand";
import axios from "axios";
import { apiService } from "../services/api";

const API_URL = "http://localhost:8000";

// Types
export interface Store {
  id: string;
  name: string;
  chain: string;
  slug: string;
  platform: string;
  status: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  metrics: {
    avg_order_time: number;
    avg_order_value: number;
    daily_orders: number;
    success_rate: number;
  };
  created_at: string;
}

export interface Order {
  id: string;
  store_id: string;
  store_name?: string;
  platform: string;
  platform_order_id: string;
  status: "completed" | "failed" | "cancelled" | "processing";
  total_amount: number;
  platform_fee: number;
  tax: number;
  tip: number;
  items_count: number;
  customer: {
    name: string;
    phone: string;
  };
  delivery: {
    address: string;
    estimated_time: string;
  };
  has_error: boolean;
  error_type?: string;
  created_at: string;
  completed_at?: string;
  processing_time_seconds?: number;
}

export interface Summary {
  total_stores: number;
  total_orders: number;
  total_revenue: number;
  completed_orders: number;
  failed_orders: number;
  cancelled_orders: number;
  processing_orders: number;
  avg_order_value: number;
  success_rate: number;
}

interface DashboardState {
  // Data
  stores: Store[];
  orders: Order[];
  summary: Summary | null;
  selectedStore: Store | null;
  storeOrders: Order[];
  storeMetrics: any;

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  fetchDashboardSummary: () => Promise<void>;
  fetchStoreData: (storeId: string) => Promise<void>;
  fetchStoreOrders: (storeId: string) => Promise<void>;
  setSelectedStore: (store: Store | null) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  stores: [],
  orders: [],
  summary: null,
  selectedStore: null,
  storeOrders: [],
  storeMetrics: null,
  loading: false,
  error: null,

  // Actions
  fetchDashboardSummary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/summary`);
      const data = response.data;
      set({
        stores: data.stores || [],
        orders: data.orders || [],
        summary: data.summary || null,
        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch dashboard data",
      });
    }
  },

  fetchStoreData: async (storeId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/store/${storeId}`
      );
      const data = response.data;
      set({
        selectedStore: data.store || null,
        storeOrders: data.orders || [],
        storeMetrics: data.metrics || null,
        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch store data",
      });
    }
  },

  fetchStoreOrders: async (storeId: string) => {
    set({ loading: true, error: null });
    try {
      const orders = await apiService.getStoreOrders(storeId);
      set({
        storeOrders: orders || [],
        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch store orders",
      });
    }
  },

  setSelectedStore: (store: Store | null) => set({ selectedStore: store }),

  clearError: () => set({ error: null }),
}));
