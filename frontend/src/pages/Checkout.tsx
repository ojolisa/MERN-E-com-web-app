import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping address
      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      };

      await ordersAPI.createOrder(orderData);
      clearCart();
      setOrderSuccess(true);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !orderSuccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  if (orderSuccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for your order. You will receive a confirmation email shortly.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/orders')}>
              View Orders
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  required
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    required
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="State"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    required
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="ZIP Code"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    required
                    sx={{ flex: 1 }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Country"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                  required
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="credit_card"
                    control={<Radio />}
                    label="Credit Card"
                  />
                  <FormControlLabel
                    value="debit_card"
                    control={<Radio />}
                    label="Debit Card"
                  />
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal"
                  />
                  <FormControlLabel
                    value="cash_on_delivery"
                    control={<Radio />}
                    label="Cash on Delivery"
                  />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Your Order
              </Typography>
              
              {/* Order Items */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Items ({cart.length})
                </Typography>
                {cart.map((item) => (
                  <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.product.name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Shipping Address */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {shippingAddress.street}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                  {shippingAddress.country}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Payment Method */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Payment Method
                </Typography>
                <Typography variant="body2">
                  {paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatPrice(getCartTotal())}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cart')}
          sx={{ mr: 2 }}
        >
          Back to Cart
        </Button>
        <Typography variant="h4" component="h1">
          Checkout
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handlePlaceOrder : handleNext}
          disabled={loading}
        >
          {loading ? 'Processing...' : activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout;
