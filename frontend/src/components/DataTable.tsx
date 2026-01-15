import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Box,
  Chip,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  Typography,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { Order } from '../data/mockData';

interface DataTableProps {
  data: Order[];
}

const statusColors: Record<Order['status'], { bg: string; color: string }> = {
  Active: { bg: '#10B981', color: '#ffffff' },
  Pending: { bg: '#F59E0B', color: '#ffffff' },
  Delivered: { bg: '#3B82F6', color: '#ffffff' },
  Cancelled: { bg: '#EF4444', color: '#ffffff' },
};

const toNumber = (value: number | string | undefined): number => {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    return data.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
            Orders
          </Typography>
        </Box>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
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
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}
            size="small"
          />
          <Box display="flex" alignItems="center" gap={1} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 150 } }}>
            <FilterList sx={{ fontSize: '1rem', color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />
            <FormControl size="small" fullWidth>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as Order['status'] | 'all');
                  setPage(0);
                }}
                displayEmpty
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, padding: { xs: '8px 12px', sm: '12px 16px' } }}>Order Number</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.7rem', sm: '0.875rem' }, padding: { xs: '8px 12px', sm: '12px 16px' } }}>Customer</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, padding: { xs: '8px 12px', sm: '12px 16px' } }}>Restaurant</TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, padding: { xs: '8px 12px', sm: '12px 16px' } }}>Items</TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, padding: { xs: '8px 12px', sm: '12px 16px' } }}>Amount</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, padding: { xs: '8px 12px', sm: '12px 16px' } }}>Status</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.7rem', sm: '0.875rem' }, padding: { xs: '8px 12px', sm: '12px 16px' } }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>No orders found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{order.orderNumber}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{order.customerName}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{order.restaurant}</TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{order.items}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    ${toNumber(order.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Chip
                      label={order.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[order.status].bg,
                        color: statusColors[order.status].color,
                        fontWeight: 600,
                        minWidth: { xs: 70, sm: 90 },
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatDate(order.orderDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            px: { xs: 1, sm: 2 },
          },
          '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
        }}
      />
    </Paper>
  );
};
