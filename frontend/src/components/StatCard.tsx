import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Receipt,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: 'revenue' | 'orders' | 'customers' | 'avgOrder';
}

const iconMap = {
  revenue: AttachMoney,
  orders: ShoppingCart,
  customers: People,
  avgOrder: Receipt,
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon }) => {
  const theme = useTheme();
  const IconComponent = iconMap[icon];

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={{ xs: 1.5, sm: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500, mb: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: '12px',
              backgroundColor: theme.palette.primary.light + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.main,
              flexShrink: 0,
              ml: 1,
            }}
          >
            <IconComponent sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
          {trend === 'up' ? (
            <TrendingUp sx={{ color: theme.palette.success.main, fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          ) : (
            <TrendingDown sx={{ color: theme.palette.error.main, fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 600,
            }}
          >
            {Math.abs(change)}%
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            vs last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
