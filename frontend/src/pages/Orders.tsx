import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Order } from '../types';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getMyOrders();
        setOrders(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>
        {[1, 2, 3].map((i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" height={30} width="60%" />
              <Skeleton variant="text" height={20} width="40%" />
              <Skeleton variant="text" height={20} width="30%" />
            </CardContent>
          </Card>
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <ShoppingBagIcon sx={{ fontSize: 120, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="text.secondary">
          No Orders Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You haven't placed any orders yet. Start shopping to see your orders here.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
        >
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Home
        </Button>
        <Typography variant="h4" component="h1">
          My Orders ({orders.length})
        </Typography>
      </Box>

      {orders.map((order) => (
        <Card key={order._id} sx={{ mb: 3 }}>
          <CardContent>
            {/* Order Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Order #{order._id.slice(-8).toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placed on {formatDate(order.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Chip 
                  label={order.orderStatus.toUpperCase()} 
                  color={getStatusColor(order.orderStatus) as any}
                  sx={{ mb: 1 }}
                />
                <Typography variant="h6" color="primary">
                  {formatPrice(order.finalTotal)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Order Items */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Items ({order.items.length})
              </Typography>
              {order.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginRight: '12px',
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity} × {formatPrice(item.price)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Shipping Address */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Shipping Address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Payment and Status Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Payment Status
                </Typography>
                <Chip 
                  label={order.paymentStatus.toUpperCase()} 
                  color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>

              {order.trackingNumber && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tracking Number
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {order.trackingNumber}
                  </Typography>
                </Box>
              )}

              {order.estimatedDelivery && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Delivery
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(order.estimatedDelivery)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Order Actions */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate(`/order/${order._id}`)}
              >
                View Details
              </Button>
              {['pending', 'confirmed'].includes(order.orderStatus) && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  // onClick={() => handleCancelOrder(order._id)}
                >
                  Cancel Order
                </Button>
              )}
              {order.orderStatus === 'delivered' && (
                <Button 
                  variant="outlined" 
                  size="small"
                  // onClick={() => navigate(`/product/${order.items[0].product}/review`)}
                >
                  Leave Review
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default Orders;
