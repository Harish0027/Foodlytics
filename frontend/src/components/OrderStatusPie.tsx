import React, { useMemo } from "react";
import { Paper, Box, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface OrderStatusPieProps {
  completed: number;
  processing: number;
  failed: number;
  cancelled: number;
}

const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#F59E0B"];

export const OrderStatusPie: React.FC<OrderStatusPieProps> = ({
  completed,
  processing,
  failed,
  cancelled,
}) => {
  const data = useMemo(() => {
    return [
      { name: "Completed", value: completed, fill: "#10B981" },
      { name: "Processing", value: processing, fill: "#3B82F6" },
      { name: "Failed", value: failed, fill: "#EF4444" },
      { name: "Cancelled", value: cancelled, fill: "#F59E0B" },
    ].filter((item) => item.value > 0);
  }, [completed, processing, failed, cancelled]);

  const total = completed + processing + failed + cancelled;

  if (data.length === 0) {
    return (
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Typography color="text.secondary">No order data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        transition: "all 0.3s ease-in-out",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
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
          Order Status Distribution
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          Breakdown of all orders by status
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => {
              const percentage = Math.round((value / total) * 100);
              return `${name}: ${value} (${percentage}%)`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => {
              const percentage = Math.round((value / total) * 100);
              return `${value} orders (${percentage}%)`;
            }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "2px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
              padding: "12px",
            }}
            labelStyle={{ color: "#1C2434", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};
