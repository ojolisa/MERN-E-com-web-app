import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemsCount } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <ShoppingCartIcon sx={{ fontSize: 120, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="text.secondary">
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Looks like you haven't added any items to your cart yet.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Shopping Cart ({getCartItemsCount()} items)
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Cart Items */}
        <Box sx={{ flex: { md: 2 } }}>
          {cart.map((item) => (
            <Card key={item.product._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                    image={item.product.images[0]?.url || '/placeholder.png'}
                    alt={item.product.name}
                  />

                  {/* Product Details */}
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${item.product._id}`)}
                    >
                      {item.product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.product.brand} • {item.product.category}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h6" color="primary">
                        {formatPrice(item.product.discountPrice || item.product.price)}
                      </Typography>
                      {item.product.discountPrice && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ textDecoration: 'line-through' }}
                        >
                          {formatPrice(item.product.price)}
                        </Typography>
                      )}
                    </Box>

                    {/* Quantity Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          size="small"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              handleQuantityChange(item.product._id, val);
                            }
                          }}
                          sx={{ width: '60px', mx: 1 }}
                          inputProps={{ style: { textAlign: 'center' } }}
                        />
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Subtotal: {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                        </Typography>
                        <IconButton 
                          color="error"
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {item.quantity > item.product.stock && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Only {item.product.stock} items in stock
                      </Alert>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>

        {/* Order Summary */}
        <Box sx={{ flex: { md: 1 } }}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">{formatPrice(getCartTotal())}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                <Typography variant="body2" color="text.secondary">Free</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Tax:</Typography>
                <Typography variant="body2" color="text.secondary">Calculated at checkout</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatPrice(getCartTotal())}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleProceedToCheckout}
                disabled={cart.some(item => item.quantity > item.product.stock)}
              >
                Proceed to Checkout
              </Button>

              {cart.some(item => item.quantity > item.product.stock) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Please adjust quantities for out-of-stock items
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Cart;
