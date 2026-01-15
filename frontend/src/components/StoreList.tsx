import React from "react";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import { Visibility, Store as StoreIcon } from "@mui/icons-material";
import { Store } from "../store/dashboardStore";

interface StoreListProps {
  stores: Store[];
  onSelectStore: (store: Store) => void;
  selectedStoreId?: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "online":
      return { bg: "#10B981", color: "#fff" };
    case "offline":
      return { bg: "#EF4444", color: "#fff" };
    case "busy":
      return { bg: "#F59E0B", color: "#fff" };
    default:
      return { bg: "#64748B", color: "#fff" };
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "doordash":
      return { bg: "#FF3008", color: "#fff" };
    case "ubereats":
      return { bg: "#06C167", color: "#fff" };
    case "grubhub":
      return { bg: "#F63440", color: "#fff" };
    default:
      return { bg: "#3C50E0", color: "#fff" };
  }
};

export const StoreList: React.FC<StoreListProps> = ({
  stores,
  onSelectStore,
  selectedStoreId,
}) => {
  return (
    <Paper sx={{ overflow: "hidden", width: "100%" }}>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <StoreIcon
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
            Stores
          </Typography>
          <Chip
            label={stores.length}
            size="small"
            color="primary"
            sx={{ ml: "auto", fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
          />
        </Box>
      </Box>

      <TableContainer
        sx={{
          maxHeight: { xs: 350, sm: 400, md: 500 },
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
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No stores found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => {
                const statusColor = getStatusColor(store.status);
                const platformColor = getPlatformColor(store.platform);
                const isSelected = selectedStoreId === store.id;

                return (
                  <TableRow
                    key={store.id}
                    sx={{
                      backgroundColor: isSelected
                        ? "action.selected"
                        : "inherit",
                      "&:hover": {
                        backgroundColor: "action.hover",
                        cursor: "pointer",
                      },
                      transition: "background-color 0.2s ease-in-out",
                    }}
                    onClick={() => onSelectStore(store)}
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
                    <TableCell>
                      <Chip
                        label={store.platform}
                        size="small"
                        sx={{
                          backgroundColor: platformColor.bg,
                          color: platformColor.color,
                          fontWeight: 600,
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={store.status}
                        size="small"
                        sx={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.color,
                          fontWeight: 600,
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          textTransform: "capitalize",
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
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStore(store);
                          }}
                          sx={{ color: "primary.main" }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
