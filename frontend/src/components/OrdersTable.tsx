import React, { useState, useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import { Search, FilterList, Receipt } from "@mui/icons-material";
import { Order } from "../store/dashboardStore";

interface OrdersTableProps {
  orders: Order[];
  title?: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return { bg: "#10B981", color: "#fff" }; // Green
    case "failed":
      return { bg: "#EF4444", color: "#fff" }; // Red
    case "cancelled":
      return { bg: "#F59E0B", color: "#fff" }; // Orange
    case "processing":
      return { bg: "#3B82F6", color: "#fff" }; // Blue
    default:
      return { bg: "#64748B", color: "#fff" };
  }
};

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `$${isNaN(numAmount) ? "0.00" : numAmount.toFixed(2)}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  title = "Orders",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.platform_order_id
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredOrders, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ overflow: "hidden", width: "100%" }}>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          mb={{ xs: 1.5, sm: 2 }}
          flexWrap="wrap"
        >
          <Receipt
            sx={{
              color: "primary.main",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.125rem", md: "1.5rem" },
              minWidth: 0,
            }}
          >
            {title}
          </Typography>
          <Chip
            label={filteredOrders.length}
            size="small"
            color="primary"
            sx={{ ml: "auto", fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
          />
        </Box>

        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 1.5, sm: 2 }}
          width="100%"
        >
          <TextField
            placeholder="Search orders..."
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
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <TableContainer
        sx={{
          maxHeight: { xs: 400, sm: 500 },
          overflowX: { xs: "auto", sm: "auto" },
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table
          stickyHeader
          sx={{
            minWidth: { xs: 600, sm: 700 },
            tableLayout: { xs: "auto", sm: "fixed" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                }}
              >
                Order ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  display: { xs: "none", sm: "table-cell" },
                }}
              >
                Store
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
                align="center"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                }}
              >
                Items
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                }}
              >
                Amount
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
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => {
                const statusColor = getStatusColor(order.status);

                return (
                  <TableRow
                    key={order.id}
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
                      {order.platform_order_id || order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "none", sm: "table-cell" },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      {order.store_name || order.store_id}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        textTransform: "capitalize",
                      }}
                    >
                      {order.platform}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      {order.items_count}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        sx={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.color,
                          fontWeight: 600,
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          textTransform: "capitalize",
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
                      {formatDate(order.created_at)}
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
        count={filteredOrders.length}
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
  );
};
