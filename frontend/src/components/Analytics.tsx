import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { ordersAPI } from '../services/api';

interface AnalyticsProps {
  onError: (message: string) => void;
}

interface AnalyticsData {
  dailyRevenue: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    totalSold: number;
    revenue: number;
    product: {
      name: string;
      category: string;
    };
  }>;
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  categoryPerformance: Array<{
    _id: string;
    totalSold: number;
    revenue: number;
  }>;
}

const Analytics: React.FC<AnalyticsProps> = ({ onError }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await ordersAPI.getAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setAnalytics(response.data);
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType: 'orders' | 'products' | 'users') => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await ordersAPI.exportReport(reportType, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to export report');
    }
  };

  const getTotalRevenue = () => {
    if (!analytics?.dailyRevenue) return 0;
    return analytics.dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
  };

  const getTotalOrders = () => {
    if (!analytics?.dailyRevenue) return 0;
    return analytics.dailyRevenue.reduce((sum, day) => sum + day.orders, 0);
  };

  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="error">
        No analytics data available
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Analytics & Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportReport('orders')}
            size="small"
          >
            Export Orders
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" color="success.main">
              ${getTotalRevenue().toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4">
              {getTotalOrders()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Average Order Value
            </Typography>
            <Typography variant="h4">
              ${getAverageOrderValue().toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
        {/* Top Products */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.topProducts.slice(0, 5).map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" noWrap>
                            {product.product.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {product.product.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{product.totalSold}</TableCell>
                      <TableCell align="right">${product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analytics.ordersByStatus.map((status) => (
                <Box key={status._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={status._id}
                    color={
                      status._id === 'delivered' ? 'success' :
                      status._id === 'cancelled' ? 'error' :
                      status._id === 'shipped' ? 'primary' : 'default'
                    }
                    size="small"
                  />
                  <Typography variant="h6">{status.count}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category Performance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Items Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.categoryPerformance.slice(0, 5).map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>{category._id}</TableCell>
                      <TableCell align="right">{category.totalSold}</TableCell>
                      <TableCell align="right">${category.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Daily Revenue Trend */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Revenue (Last 7 Days)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {analytics.dailyRevenue.slice(-7).map((day) => (
                <Box key={day._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {new Date(day._id).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      ${day.revenue.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ({day.orders} orders)
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Export Options */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => handleExportReport('products')}
        >
          Export Products Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => handleExportReport('users')}
        >
          Export Users Report
        </Button>
      </Box>
    </Box>
  );
};

export default Analytics;
