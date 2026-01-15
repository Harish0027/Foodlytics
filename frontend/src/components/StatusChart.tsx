import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StatusChartProps {
  data: Array<{ name: string; value: number; percentage: number }>;
}

const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
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
            Order Status Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Breakdown of orders by current status
          </Typography>
        </Box>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
              tickLine={false}
            />
            <YAxis
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
                if (name === 'value') {
                  return [`${value} orders`, 'Count'];
                }
                return [`${value}%`, 'Percentage'];
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value: string) => value === 'value' ? 'Orders' : 'Percentage'}
            />
            <Bar dataKey="value" name="Orders" radius={[12, 12, 0, 0]} isAnimationActive={true}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#gradient-${index % colors.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
