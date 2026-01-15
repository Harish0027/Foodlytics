import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { StoreMetrics } from '../types';

interface MetricsCardsProps {
  metrics: StoreMetrics | null;
  loading: boolean;
}

const toNumber = (value: number | string | undefined): number => {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, loading }) => {
  const successRate = toNumber(metrics?.success_rate);
  const avgProcessingTime = toNumber(metrics?.avg_processing_time_minutes);
  const totalRevenue = toNumber(metrics?.total_revenue_24h);

  const cards = [
    {
      title: 'Success Rate',
      value: successRate > 0 ? `${successRate.toFixed(1)}%` : '0%',
      color: successRate > 80 ? '#4caf50' : '#ff9800'
    },
    {
      title: 'Orders (24h)',
      value: metrics?.total_orders_24h || 0,
      color: '#2196f3'
    },
    {
      title: 'Avg Processing',
      value: avgProcessingTime > 0 ? `${avgProcessingTime.toFixed(0)} min` : '0 min',
      color: '#9c27b0'
    },
    {
      title: 'Revenue (24h)',
      value: totalRevenue > 0 ? `$${totalRevenue.toFixed(2)}` : '$0',
      color: '#4caf50'
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" height={40} />
                </>
              ) : (
                <>
                  <Typography color="textSecondary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="h2"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};