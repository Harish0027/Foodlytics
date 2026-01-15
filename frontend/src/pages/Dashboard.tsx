import React, { useEffect, useMemo } from "react";
import {
  Grid,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { SummaryCards } from "../components/SummaryCards";
import { StoreList } from "../components/StoreList";
import { OrdersTable } from "../components/OrdersTable";
import { StatusChart } from "../components/StatusChart";
import { RevenueChart } from "../components/RevenueChart";
import { TimeRangeSelector } from "../components/TimeRangeSelector";
import { OrderStatusPie } from "../components/OrderStatusPie";
import { useDashboardStore } from "../store/dashboardStore";

const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];

export const Dashboard: React.FC = () => {
  const {
    stores,
    orders,
    summary,
    selectedStore,
    storeOrders,
    timeRange,
    loading,
    error,
    fetchDashboardSummary,
    fetchStoreData,
    fetchStoreOrders,
    setSelectedStore,
    setTimeRange,
    clearError,
  } = useDashboardStore();

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary, timeRange]);

  // Handle store selection
  const handleSelectStore = (store: any) => {
    setSelectedStore(store);
    fetchStoreOrders(store.id);
  };

  // Prepare chart data for order status breakdown
  const statusChartData = useMemo(() => {
    if (!summary) return [];
    const total = summary.total_orders;
    return [
      {
        name: "Completed",
        value: summary.completed_orders,
        percentage:
          total > 0 ? Math.round((summary.completed_orders / total) * 100) : 0,
      },
      {
        name: "Processing",
        value: summary.processing_orders,
        percentage:
          total > 0 ? Math.round((summary.processing_orders / total) * 100) : 0,
      },
      {
        name: "Failed",
        value: summary.failed_orders,
        percentage:
          total > 0 ? Math.round((summary.failed_orders / total) * 100) : 0,
      },
      {
        name: "Cancelled",
        value: summary.cancelled_orders,
        percentage:
          total > 0 ? Math.round((summary.cancelled_orders / total) * 100) : 0,
      },
    ];
  }, [summary]);

  // Prepare pie chart data for revenue distribution by status
  const revenuePieData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const revenueByStatus = {
      completed: 0,
      processing: 0,
      failed: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = (order.status || "processing").toLowerCase();
      if (status in revenueByStatus) {
        revenueByStatus[status as keyof typeof revenueByStatus] +=
          order.total_amount;
      }
    });

    const data: Array<{ name: string; value: number; fill: string }> = [
      { name: "Completed", value: revenueByStatus.completed, fill: "#10B981" },
      {
        name: "Processing",
        value: revenueByStatus.processing,
        fill: "#3B82F6",
      },
      { name: "Failed", value: revenueByStatus.failed, fill: "#EF4444" },
      { name: "Cancelled", value: revenueByStatus.cancelled, fill: "#F59E0B" },
    ];
    return data.filter((item) => item.value > 0);
  }, [orders]);

  // Prepare revenue line chart data
  const revenueLineData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Get last 7 days of dates
    const dates: { [key: string]: { revenue: number; count: number } } = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dates[dateStr] = { revenue: 0, count: 0 };
    }

    // Populate with order data
    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (dateStr in dates) {
        if (order.status === "completed") {
          const amount =
            typeof order.total_amount === "string"
              ? parseFloat(order.total_amount)
              : order.total_amount;
          if (!isNaN(amount)) {
            dates[dateStr].revenue += amount;
          }
        }
        dates[dateStr].count += 1;
      }
    });

    return Object.entries(dates).map(([date, data]) => ({
      name: date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.count,
    }));
  }, [orders]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mb: 2, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Time Range Selector */}
      <Box
        sx={{ mt: { xs: 2.5, sm: 3, md: 4 }, mb: { xs: 2.5, sm: 3, md: 4 } }}
      >
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </Box>

      {/* Analytics Section */}
      {summary && summary.total_orders > 0 && (
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            Analytics & Insights
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Order Status Pie Chart */}
            <Grid item xs={12} md={6}>
              <OrderStatusPie
                completed={summary.completed_orders}
                processing={summary.processing_orders}
                failed={summary.failed_orders}
                cancelled={summary.cancelled_orders}
              />
            </Grid>

            {/* Order Status Chart */}
            <Grid item xs={12} md={6}>
              <StatusChart data={statusChartData} />
            </Grid>

            {/* Revenue Distribution Pie Chart */}
            {revenuePieData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    height: "100%",
                    p: { xs: 2, sm: 3 },
                    transition: "all 0.3s ease-in-out",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    "&:hover": {
                      boxShadow:
                        "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box mb={{ xs: 2, sm: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        fontSize: { xs: "1.125rem", sm: "1.5rem" },
                        color: "primary.main",
                      }}
                    >
                      Revenue Distribution
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Revenue breakdown by order status
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenuePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: $${value.toFixed(2)}`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        {revenuePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "2px solid #E2E8F0",
                          borderRadius: "12px",
                          boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          padding: "12px",
                        }}
                        labelStyle={{ color: "#1C2434", fontWeight: 600 }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value: string) => {
                          return value.charAt(0).toUpperCase() + value.slice(1);
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Revenue Trend Chart */}
            <Grid item xs={12}>
              <RevenueChart data={revenueLineData} />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Main Grid */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Left Column - Store List */}
        <Grid item xs={12} lg={6}>
          <StoreList
            stores={stores}
            onSelectStore={handleSelectStore}
            selectedStoreId={selectedStore?.id}
          />
        </Grid>

        {/* Right Column - Orders Table */}
        <Grid item xs={12} lg={6}>
          {selectedStore ? (
            <OrdersTable
              orders={storeOrders}
              title={`Orders for ${selectedStore.name}`}
            />
          ) : (
            <OrdersTable orders={orders.slice(0, 10)} title="Recent Orders" />
          )}
        </Grid>
      </Grid>

      {/* Selected Store Details - Only show if store selected and there are orders */}
      {selectedStore && storeOrders.length > 0 && (
        <Box sx={{ mt: { xs: 3, sm: 4 } }}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                fontSize: { xs: "1.125rem", sm: "1.5rem" },
                color: "text.secondary",
              }}
            >
              Store: {selectedStore.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Orders: {storeOrders.length}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};
