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
  CardActions,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Store as StoreIcon,
  LocationOn as MapLocation,
  Phone as PhoneIcon,
  Visibility,
  Edit,
  Delete,
  FiberManualRecord as Online,
  RadioButtonUnchecked as Offline,
  Search,
  FilterList,
  AccessTime as ClockIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as SuccessIcon,
  Storefront as PlatformIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useDashboardStore } from "../store/dashboardStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

export const Stores: React.FC = () => {
  const { stores, loading, error, fetchDashboardSummary, clearError } =
    useDashboardStore();

  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  // Filter stores based on search and status
  const filteredStores = useMemo(() => {
    let filtered = stores;

    if (searchQuery) {
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.location?.city
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          store.platform.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (store) => store.status.toLowerCase() === statusFilter
      );
    }

    return filtered;
  }, [stores, searchQuery, statusFilter]);

  const paginatedStores = useMemo(() => {
    return filteredStores.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredStores, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate store statistics
  const storeStats = useMemo(() => {
    const onlineCount = stores.filter(
      (s) => s.status?.toLowerCase() === "online"
    ).length;
    const offlineCount = stores.filter(
      (s) => s.status?.toLowerCase() === "offline"
    ).length;
    const busyCount = stores.filter(
      (s) => s.status?.toLowerCase() === "busy"
    ).length;

    const avgOrderValue =
      stores.reduce(
        (acc, store) => acc + (store.metrics?.avg_order_value || 0),
        0
      ) / (stores.length || 1);

    const avgOrderTime =
      stores.reduce(
        (acc, store) => acc + (store.metrics?.avg_order_time || 0),
        0
      ) / (stores.length || 1);

    const avgSuccessRate =
      stores.reduce(
        (acc, store) => acc + (store.metrics?.success_rate || 0),
        0
      ) / (stores.length || 1);

    return {
      total: stores.length,
      online: onlineCount,
      offline: offlineCount,
      busy: busyCount,
      avgOrderValue,
      avgOrderTime,
      avgSuccessRate,
    };
  }, [stores]);

  // Prepare platform distribution data
  const platformData = useMemo(() => {
    if (!stores || stores.length === 0) return [];
    const platforms: { [key: string]: number } = {};

    stores.forEach((store) => {
      const platform = store.platform || "Unknown";
      platforms[platform] = (platforms[platform] || 0) + 1;
    });

    return Object.entries(platforms).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [stores]);

  // Prepare store performance data
  const performanceData = useMemo(() => {
    return stores.slice(0, 8).map((store) => ({
      name: store.name.substring(0, 10),
      orders: store.metrics?.daily_orders || 0,
      revenue: store.metrics?.avg_order_value || 0,
      successRate: store.metrics?.success_rate || 0,
    }));
  }, [stores]);

  const handleOpenDetails = (store: any) => {
    setSelectedStore(store);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedStore(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online":
        return { bg: "#10B981", text: "Online" };
      case "offline":
        return { bg: "#EF4444", text: "Offline" };
      case "busy":
        return { bg: "#F59E0B", text: "Busy" };
      default:
        return { bg: "#64748B", text: "Unknown" };
    }
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
          Stores Management
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
          }}
        >
          Monitor and manage all your restaurant locations
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        <Grid item xs={6} sm={6} md={3}>
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
                    Total Stores
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {storeStats.total}
                  </Typography>
                </Box>
                <StoreIcon
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
                    Online
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#10B981",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {storeStats.online}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      color: "#10B981",
                      mt: 0.5,
                    }}
                  >
                    {((storeStats.online / storeStats.total) * 100).toFixed(1)}%
                    operational
                  </Typography>
                </Box>
                <Online
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
                    Busy Stores
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#F59E0B",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {storeStats.busy}
                  </Typography>
                </Box>
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
                    Offline
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#EF4444",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {storeStats.offline}
                  </Typography>
                </Box>
                <Offline
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
      </Grid>

      {/* Charts Row */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        {/* Platform Distribution */}
        {platformData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
                Stores by Platform
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${((percent as number) * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Performance Chart */}
        {performanceData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
                Store Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748B"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    wrapperStyle={{
                      backgroundColor: "#1C2434",
                      border: "1px solid #3C50E0",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#3C50E0" />
                  <Bar dataKey="successRate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Search and Filter */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          mb: { xs: 3, sm: 4 },
          borderRadius: 2,
          overflow: "auto",
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 1.5, sm: 2 }}
          alignItems={{ xs: "stretch", sm: "flex-end" }}
        >
          <TextField
            placeholder="Search by store name, city, or platform..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 200, md: 250 } }}
            size="small"
          />
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: 120, md: 150 },
            }}
          >
            <FilterList
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem" },
                color: "text.secondary",
                display: { xs: "none", sm: "block" },
                flexShrink: 0,
              }}
            />
            <FormControl
              size="small"
              fullWidth
              sx={{ minWidth: { xs: "100%", sm: 120 } }}
            >
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                displayEmpty
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Stores Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <StoreIcon sx={{ color: "primary.main" }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1.125rem", sm: "1.5rem" },
              }}
            >
              All Stores
            </Typography>
            <Chip
              label={filteredStores.length}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Store Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Chain
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Platform
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    display: { xs: "none", md: "table-cell" },
                  }}
                >
                  Location
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Daily Orders
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Success Rate
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Avg Value
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No stores found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStores.map((store) => {
                  const statusColor = getStatusColor(store.status);
                  return (
                    <TableRow
                      key={store.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        transition: "background-color 0.2s ease-in-out",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {store.name}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {store.chain}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          textTransform: "capitalize",
                        }}
                      >
                        {store.platform}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusColor.text}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            minWidth: { xs: 70, sm: 90 },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {store.location?.city}, {store.location?.state}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {store.metrics?.daily_orders || 0}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          display: { xs: "none", sm: "table-cell" },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        <Chip
                          label={`${(store.metrics?.success_rate || 0).toFixed(
                            1
                          )}%`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            color: "#10B981",
                            fontWeight: 600,
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          display: { xs: "none", sm: "table-cell" },
                          fontWeight: 600,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        ${(store.metrics?.avg_order_value || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<Visibility sx={{ fontSize: 16 }} />}
                          onClick={() => handleOpenDetails(store)}
                          sx={{ color: "primary.main" }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredStores.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              px: { xs: 1, sm: 2 },
            },
            "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel":
              {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
          }}
        />
      </Paper>

      {/* Store Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        {/* Dialog Header */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.375rem", sm: "1.5rem" },
                color: "#111827",
                mb: 0.75,
              }}
            >
              {selectedStore?.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                icon={
                  getStatusColor(selectedStore?.status).bg === "#10B981" ? (
                    <Online sx={{ color: "white !important" }} />
                  ) : (
                    <Offline sx={{ color: "white !important" }} />
                  )
                }
                label={getStatusColor(selectedStore?.status).text}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(selectedStore?.status).bg,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  fontWeight: 500,
                }}
              >
                {selectedStore?.chain}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={handleCloseDetails}
            sx={{
              color: "#6B7280",
              minWidth: "auto",
              p: 1,
              "&:hover": { backgroundColor: "#F3F4F6" },
            }}
          >
            <CloseIcon sx={{ fontSize: "1.25rem" }} />
          </Button>
        </Box>

        {/* Dialog Content */}
        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* Location */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  pb: 2,
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <Box
                  sx={{
                    p: 1.25,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10B981",
                    flexShrink: 0,
                  }}
                >
                  <MapLocation sx={{ fontSize: "1.5rem" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#6B7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 0.5,
                    }}
                  >
                    Location
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#111827",
                      mb: 0.25,
                    }}
                  >
                    {selectedStore?.location?.address}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#6B7280",
                    }}
                  >
                    {selectedStore?.location?.city},{" "}
                    {selectedStore?.location?.state}{" "}
                    {selectedStore?.location?.zip}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Platform */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#FEF3C7",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#F59E0B",
                    flexShrink: 0,
                  }}
                >
                  <PlatformIcon sx={{ fontSize: "1.25rem" }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#6B7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Platform
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#111827",
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedStore?.platform || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Success Rate */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#D1FAE5",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10B981",
                    flexShrink: 0,
                  }}
                >
                  <SuccessIcon sx={{ fontSize: "1.25rem" }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#6B7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Success Rate
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {(selectedStore?.metrics?.success_rate || 0).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Average Order Time */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#DBEAFE",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#3B82F6",
                    flexShrink: 0,
                  }}
                >
                  <ClockIcon sx={{ fontSize: "1.25rem" }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#6B7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Avg Order Time
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {selectedStore?.metrics?.avg_order_time || 0}{" "}
                    <span style={{ fontSize: "0.85em", fontWeight: 500 }}>
                      min
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Average Order Value */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#EDE9FE",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8B5CF6",
                    flexShrink: 0,
                  }}
                >
                  <MoneyIcon sx={{ fontSize: "1.25rem" }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#6B7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Avg Order Value
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    ${(selectedStore?.metrics?.avg_order_value || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderTop: "1px solid #E5E7EB",
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseDetails}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              py: 1,
              backgroundColor: "#3B82F6",
              color: "white",
              "&:hover": {
                backgroundColor: "#2563EB",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
