import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  Card,
  CardContent,
  TextField,
  Divider,
  IconButton,
  Badge,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { Product as ProductType } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserState } from '../contexts/UserStateContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { savedItems, addToSaved, removeFromSaved, addToRecentlyViewed } = useUserState();
  
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check if product is saved
  const isSaved = product ? savedItems.some(item => item.productId._id === product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productsAPI.getProduct(id);
        setProduct(response.data);
        
        // Add to recently viewed
        await addToRecentlyViewed(id);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, addToRecentlyViewed]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Show success message or redirect to cart
    }
  };

  const handleToggleSaved = async () => {
    if (!product) return;
    
    try {
      if (isSaved) {
        await removeFromSaved(product._id);
      } else {
        await addToSaved(product._id);
      }
    } catch (error) {
      console.error('Failed to toggle saved state:', error);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !user || !review.rating) return;

    try {
      setSubmittingReview(true);
      await productsAPI.addReview(product._id, review.rating, review.comment);
      
      // Refresh product to show new review
      const response = await productsAPI.getProduct(product._id);
      setProduct(response.data);
      setReview({ rating: 0, comment: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height={400} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={100} />
            <Skeleton variant="rectangular" height={60} />
          </Box>
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Product Images */}
        <Box sx={{ flex: 1 }}>
          <Box>
            <img
              src={product.images[selectedImage]?.url || '/placeholder.png'}
              alt={product.images[selectedImage]?.alt || product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            {product.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2, overflow: 'auto' }}>
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #1976d2' : '2px solid transparent',
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Product Info */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating value={product.rating.average} readOnly precision={0.1} />
            <Typography variant="body2" color="text.secondary">
              ({product.rating.count} reviews)
            </Typography>
          </Box>

          <Chip label={product.category} sx={{ mb: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {formatPrice(product.discountPrice || product.price)}
              </Typography>
              {product.discountPrice && (
                <>
                  <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                  <Chip 
                    label={`${discountPercentage}% OFF`} 
                    color="secondary" 
                    size="small" 
                  />
                </>
              )}
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Brand: {product.brand}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            In Stock: {product.stock} items
          </Typography>

          {/* Quantity Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body1">Quantity:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= product.stock) {
                    setQuantity(val);
                  }
                }}
                size="small"
                sx={{ width: '60px', mx: 1 }}
                inputProps={{ style: { textAlign: 'center' } }}
              />
              <IconButton 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{ flex: 1 }}
            >
              Add to Cart
            </Button>
            <IconButton 
              size="large" 
              onClick={handleToggleSaved}
              color={isSaved ? 'error' : 'default'}
            >
              {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton size="large">
              <ShareIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Product Reviews */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Customer Reviews
        </Typography>
        
        {user && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  value={review.rating}
                  onChange={(_, newValue) => setReview(prev => ({ ...prev, rating: newValue || 0 }))}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comment"
                value={review.comment}
                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSubmitReview}
                disabled={!review.rating || submittingReview}
              >
                Submit Review
              </Button>
            </CardContent>
          </Card>
        )}

        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {review.user?.name || 'Anonymous'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                <Typography variant="body2">
                  {review.comment}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetail;
