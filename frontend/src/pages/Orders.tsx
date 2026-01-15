import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Schedule as Clock,
  AttachMoney as DollarSign,
  CheckCircle,
  Cancel as XCircle,
  ShoppingCart,
} from "@mui/icons-material";
import { OrdersTable } from "../components/OrdersTable";
import { TimeRangeSelector } from "../components/TimeRangeSelector";
import { useDashboardStore } from "../store/dashboardStore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: { xs: 2, sm: 3 }, overflow: "auto" }}>{children}</Box>
      )}
    </div>
  );
}

export const Orders: React.FC = () => {
  const {
    orders,
    summary,
    timeRange,
    loading,
    error,
    fetchDashboardSummary,
    setTimeRange,
    clearError,
  } = useDashboardStore();

  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  // Filter orders by status based on tab
  const filteredOrders = useMemo(() => {
    if (tabValue === 0) return orders;
    const statusMap: { [key: number]: string } = {
      1: "completed",
      2: "processing",
      3: "failed",
      4: "cancelled",
    };
    return orders.filter((order) => order.status === statusMap[tabValue]);
  }, [orders, tabValue]);

  // Calculate order statistics
  const orderStats = useMemo(
    () => ({
      total: summary?.total_orders || 0,
      completed: summary?.completed_orders || 0,
      processing: summary?.processing_orders || 0,
      failed: summary?.failed_orders || 0,
      cancelled: summary?.cancelled_orders || 0,
      avgValue: summary?.avg_order_value || 0,
      successRate: summary?.success_rate || 0,
      totalRevenue: summary?.total_revenue || 0,
    }),
    [summary]
  );

  // Generate time series data for chart
  const timeSeriesData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const hourly: { [key: string]: number } = {};
    const now = new Date();

    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(date.getHours() - i);
      const hour = date.toLocaleTimeString("en-US", { hour: "2-digit" });
      hourly[hour] = 0;
    }

    // Count orders per hour
    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const hour = date.toLocaleTimeString("en-US", { hour: "2-digit" });
      if (hour in hourly) hourly[hour]++;
    });

    return Object.entries(hourly).map(([time, count]) => ({
      time,
      orders: count,
    }));
  }, [orders]);

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedOrder(null);
  };

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { bg: "#10B981", color: "#fff" };
      case "failed":
        return { bg: "#EF4444", color: "#fff" };
      case "cancelled":
        return { bg: "#F59E0B", color: "#fff" };
      case "processing":
        return { bg: "#3B82F6", color: "#fff" };
      default:
        return { bg: "#64748B", color: "#fff" };
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Page Header */}
      <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "1.875rem", md: "2.25rem" },
            mb: 1,
            lineHeight: 1.2,
          }}
        >
          Orders Management
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
          }}
        >
          Track and manage all orders across your restaurant network
        </Typography>
      </Box>

      {/* Time Range Selector */}
      <Box sx={{ mb: { xs: 2.5, sm: 3 }, overflowX: "auto" }}>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </Box>

      {/* Statistics Cards */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "4px solid #3C50E0",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
              transition: "all 0.3s ease",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    Total Orders
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {orderStats.total}
                  </Typography>
                </Box>
                <ShoppingCart
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: "primary.main",
                    opacity: 0.2,
                    flexShrink: 0,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "4px solid #10B981",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
              transition: "all 0.3s ease",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    Completed
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#10B981",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {orderStats.completed}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <TrendingUp
                      sx={{
                        fontSize: { xs: 12, sm: 14 },
                        color: "#10B981",
                        mr: 0.5,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        color: "#10B981",
                      }}
                    >
                      {orderStats.successRate.toFixed(1)}% success
                    </Typography>
                  </Box>
                </Box>
                <CheckCircle
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: "#10B981",
                    opacity: 0.2,
                    flexShrink: 0,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "4px solid #EF4444",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
              transition: "all 0.3s ease",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    Failed Orders
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#EF4444",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {orderStats.failed}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <TrendingDown
                      sx={{
                        fontSize: { xs: 12, sm: 14 },
                        color: "#EF4444",
                        mr: 0.5,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        color: "#EF4444",
                      }}
                    >
                      {(
                        ((orderStats.failed + orderStats.cancelled) /
                          orderStats.total) *
                        100
                      ).toFixed(1)}
                      % error rate
                    </Typography>
                  </Box>
                </Box>
                <XCircle
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: "#EF4444",
                    opacity: 0.2,
                    flexShrink: 0,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "4px solid #F59E0B",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
              transition: "all 0.3s ease",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "text.secondary",
                      mb: 1,
                    }}
                  >
                    Total Revenue
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#F59E0B" }}
                  >
                    ${orderStats.totalRevenue.toFixed(0)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <DollarSign
                      sx={{ fontSize: 14, color: "#F59E0B", mr: 0.5 }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "#F59E0B" }}>
                      ${orderStats.avgValue.toFixed(2)} avg
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Trend Chart */}
      {timeSeriesData.length > 0 && (
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            mb: { xs: 3, sm: 4 },
            borderRadius: 2,
            overflow: "auto",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "1rem", sm: "1.125rem", md: "1.5rem" },
            }}
          >
            Orders Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData} margin={{ left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C2434",
                  border: "1px solid #3C50E0",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3C50E0"
                strokeWidth={2}
                dot={{ fill: "#3C50E0", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Orders Table with Tabs */}
      <Paper
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            overflowX: { xs: "auto", sm: "auto" },
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "0.95rem" },
                p: { xs: 1, sm: 1.5 },
              },
              "& .MuiTabs-indicator": {
                height: 3,
              },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${orders.length})`} />
            <Tab
              label={`Completed (${orderStats.completed})`}
              icon={<CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />}
              iconPosition="start"
            />
            <Tab
              label={`Processing (${orderStats.processing})`}
              icon={<Clock sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />}
              iconPosition="start"
            />
            <Tab
              label={`Failed (${orderStats.failed})`}
              icon={<XCircle sx={{ fontSize: 16, mr: 1 }} />}
              iconPosition="start"
            />
            <Tab label={`Cancelled (${orderStats.cancelled})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <OrdersTable orders={filteredOrders} title="All Orders" />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <OrdersTable orders={filteredOrders} title="Completed Orders" />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <OrdersTable orders={filteredOrders} title="Processing Orders" />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <OrdersTable orders={filteredOrders} title="Failed Orders" />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <OrdersTable orders={filteredOrders} title="Cancelled Orders" />
        </TabPanel>
      </Paper>
    </Box>
  );
};
