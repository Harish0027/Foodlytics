// Mock data for the Restaurant Dashboard

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  totalAmount: number;
  status: 'Active' | 'Pending' | 'Delivered' | 'Cancelled';
  orderDate: string;
  restaurant: string;
}

export interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: string;
}

// Generate mock orders
const statuses: Order['status'][] = ['Active', 'Pending', 'Delivered', 'Cancelled'];
const restaurants = [
  'The Gourmet Kitchen',
  'Pasta Paradise',
  'Sushi Masters',
  'Burger House',
  'Taco Fiesta',
  'Pizza Corner',
  'Steak & Grill',
  'Asian Fusion',
];
const customers = [
  'John Smith',
  'Emma Johnson',
  'Michael Brown',
  'Sarah Davis',
  'David Wilson',
  'Lisa Anderson',
  'Robert Taylor',
  'Jennifer Martinez',
  'William Garcia',
  'Jessica Lee',
];

function generateOrders(count: number): Order[] {
  const orders: Order[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    orderDate.setHours(Math.floor(Math.random() * 24));
    orderDate.setMinutes(Math.floor(Math.random() * 60));
    
    orders.push({
      id: `ORD-${String(i + 1).padStart(4, '0')}`,
      orderNumber: `#${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      items: Math.floor(Math.random() * 5) + 1,
      totalAmount: parseFloat((Math.random() * 200 + 20).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      orderDate: orderDate.toISOString(),
      restaurant: restaurants[Math.floor(Math.random() * restaurants.length)],
    });
  }
  
  return orders;
}

export const mockOrders = generateOrders(150);

export const kpiMetrics: KPIMetric[] = [
  {
    title: 'Total Revenue',
    value: '$125,430',
    change: 12.5,
    trend: 'up',
    icon: 'revenue',
  },
  {
    title: 'Orders',
    value: '1,234',
    change: 8.2,
    trend: 'up',
    icon: 'orders',
  },
  {
    title: 'Customers',
    value: '8,456',
    change: -2.1,
    trend: 'down',
    icon: 'customers',
  },
  {
    title: 'Avg Order Value',
    value: '$98.50',
    change: 5.4,
    trend: 'up',
    icon: 'avgOrder',
  },
];

// Chart data
export const revenueChartData = [
  { name: 'Jan', revenue: 45000, orders: 320 },
  { name: 'Feb', revenue: 52000, orders: 380 },
  { name: 'Mar', revenue: 48000, orders: 350 },
  { name: 'Apr', revenue: 61000, orders: 420 },
  { name: 'May', revenue: 55000, orders: 390 },
  { name: 'Jun', revenue: 67000, orders: 460 },
  { name: 'Jul', revenue: 73000, orders: 510 },
  { name: 'Aug', revenue: 69000, orders: 480 },
  { name: 'Sep', revenue: 78000, orders: 540 },
  { name: 'Oct', revenue: 82000, orders: 570 },
  { name: 'Nov', revenue: 95000, orders: 650 },
  { name: 'Dec', revenue: 105000, orders: 720 },
];

export const categoryChartData = [
  { name: 'Delivered', value: 1240, percentage: 72.5 },
  { name: 'Pending', value: 320, percentage: 18.7 },
  { name: 'Active', value: 120, percentage: 7.0 },
  { name: 'Cancelled', value: 30, percentage: 1.8 },
];
