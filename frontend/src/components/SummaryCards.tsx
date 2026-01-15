import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Store,
  ShoppingCart,
  AttachMoney,
  CheckCircle,
  Cancel,
  Error,
  HourglassEmpty,
  TrendingUp,
} from "@mui/icons-material";
import { Summary } from "../store/dashboardStore";

interface SummaryCardsProps {
  summary: Summary | null;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  bgColor,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: { xs: 140, sm: 160, md: 180 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          width="100%"
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
                fontWeight: 500,
                mb: 1,
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 40, sm: 44, md: 48 },
              height: { xs: 40, sm: 44, md: 48 },
              borderRadius: "12px",
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
              flexShrink: 0,
              ml: { xs: 0.5, sm: 1 },
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "$0.00";
  if (numAmount >= 1000000) {
    return `$${(numAmount / 1000000).toFixed(2)}M`;
  } else if (numAmount >= 1000) {
    return `$${(numAmount / 1000).toFixed(1)}K`;
  }
  return `$${numAmount.toFixed(2)}`;
};

const formatNumber = (num: number | string) => {
  const numValue = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(numValue)) return "0";
  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`;
  }
  return numValue.toLocaleString();
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  loading,
}) => {
  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: "Total Stores",
      value: formatNumber(summary.total_stores),
      icon: <Store />,
      color: "#3C50E0",
      bgColor: "rgba(60, 80, 224, 0.1)",
    },
    {
      title: "Total Orders",
      value: formatNumber(summary.total_orders),
      icon: <ShoppingCart />,
      color: "#8B5CF6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(summary.total_revenue),
      icon: <AttachMoney />,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(summary.avg_order_value),
      icon: <TrendingUp />,
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "Completed",
      value: formatNumber(summary.completed_orders),
      icon: <CheckCircle />,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Processing",
      value: formatNumber(summary.processing_orders),
      icon: <HourglassEmpty />,
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Failed",
      value: formatNumber(summary.failed_orders),
      icon: <Error />,
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
    },
    {
      title: "Cancelled",
      value: formatNumber(summary.cancelled_orders),
      icon: <Cancel />,
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
  ];

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {cards.map((card, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <StatCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
          />
        </Grid>
      ))}
    </Grid>
  );
};
