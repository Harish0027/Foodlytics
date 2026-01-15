import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number; orders: number }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transform: 'translateY(-2px)',
        },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box mb={{ xs: 2, sm: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.125rem', sm: '1.5rem' }, color: theme.palette.primary.main }}>
            Revenue & Orders Trend
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            7-day revenue and order performance
          </Typography>
        </Box>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3C50E0" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748B"
              style={{ fontSize: '0.875rem' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748B"
              style={{ fontSize: '0.875rem' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '2px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px',
              }}
              labelStyle={{ color: '#1C2434', fontWeight: 600 }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') {
                  return [`$${value.toFixed(2)}`, 'Revenue'];
                }
                return [value, 'Orders'];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value: string) => {
                return value === 'revenue' ? 'Revenue ($)' : 'Orders';
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#3C50E0"
              strokeWidth={3}
              dot={{ fill: '#3C50E0', r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7, strokeWidth: 0 }}
              name="revenue"
              isAnimationActive={true}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7, strokeWidth: 0 }}
              name="orders"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
