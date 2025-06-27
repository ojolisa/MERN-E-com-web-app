import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Alert,
  Skeleton,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserState } from '../contexts/UserStateContext';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { productsAPI } from '../services/api';

interface ProductWithViewTime extends Product {
  viewedAt: string;
}

const RecentlyViewed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recentlyViewed, savedItems, addToSaved, removeFromSaved } = useUserState();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<ProductWithViewTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentlyViewedProducts();
  }, [recentlyViewed]);

  const fetchRecentlyViewedProducts = async () => {
    try {
      setLoading(true);
      if (recentlyViewed.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productPromises = recentlyViewed.map(item => {
        const productId = typeof item.productId === 'string' ? item.productId : item.productId._id;
        return productsAPI.getProduct(productId);
      });
      
      const responses = await Promise.all(productPromises);
      const productsData = responses.map(response => response.data);
      
      // Sort by view date (most recent first)
      const sortedProducts = productsData.map((product, index) => ({
        ...product,
        viewedAt: recentlyViewed[index].viewedAt,
      })).sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
      
      setProducts(sortedProducts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recently viewed products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleToggleSaved = async (productId: string) => {
    const isSaved = savedItems.some(item => item.productId._id === productId);
    try {
      if (isSaved) {
        await removeFromSaved(productId);
      } else {
        await addToSaved(productId);
      }
    } catch (error) {
      console.error('Failed to toggle saved state:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const viewed = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return viewed.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Recently Viewed
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={30} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} width="60%" />
              </CardContent>
            </Card>
          ))}
        </Box>
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

  if (products.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <VisibilityIcon sx={{ fontSize: 120, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="text.secondary">
          No Recently Viewed Items
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Products you view will appear here for easy access later.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/products')}
          startIcon={<ArrowBackIcon />}
        >
          Start Browsing
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Home
        </Button>
        <Typography variant="h4" component="h1">
          Recently Viewed ({products.length} items)
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
        {products.map((product) => {
          const isSaved = savedItems.some(item => item.productId._id === product._id);
          
          return (
            <Card 
              key={product._id}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images[0]?.url || '/placeholder-image.jpg'}
                  alt={product.name}
                  sx={{ 
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/product/${product._id}`)}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  }}
                  onClick={() => handleToggleSaved(product._id)}
                >
                  {isSaved ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                
                {/* Recently viewed indicator */}
                <Chip
                  label={formatTimeAgo(product.viewedAt)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(25, 118, 210, 0.9)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                
                {product.discountPercentage && (
                  <Chip
                    label={`${product.discountPercentage}% OFF`}
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      fontWeight: 'bold',
                    }}
                  />
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {product.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.brand} • {product.category}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {product.discountPrice ? (
                    <>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(product.discountPrice)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                      >
                        {formatPrice(product.price)}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(product.price)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ⭐ {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                  </Typography>
                </Box>

                {product.stock === 0 && (
                  <Chip
                    label="Out of Stock"
                    color="error"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
                
                {product.stock > 0 && product.stock <= 5 && (
                  <Chip
                    label={`Only ${product.stock} left`}
                    color="warning"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
              </CardContent>

              <Divider />

              <CardActions sx={{ p: 2, pt: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    sx={{
                      flex: 1,
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/product/${product._id}`)}
                    sx={{
                      borderRadius: 2,
                      minWidth: 'auto',
                      px: 2,
                    }}
                  >
                    View
                  </Button>
                </Box>
              </CardActions>
            </Card>
          );
        })}
      </Box>

      {/* Summary */}
      <Card sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Browsing History Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {products.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items Viewed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {new Set(products.map(p => p.category)).size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Categories Explored
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {products.filter(p => p.stock > 0).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Items
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              products
                .filter(p => p.stock > 0)
                .forEach(product => addToCart(product));
            }}
            disabled={products.filter(p => p.stock > 0).length === 0}
            sx={{ mr: 2, minWidth: 200 }}
          >
            Add All Available to Cart
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/products')}
            sx={{ minWidth: 200 }}
          >
            Explore More Products
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default RecentlyViewed;
