import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Rating,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import { ArrowForward, ShoppingCart, LocalOffer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getFeaturedProducts();
        setFeaturedProducts(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load featured products';
        setError(errorMessage);
        console.error('Error fetching featured products:', err);
        console.error('Error response:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 'bold',
              mb: 3,
            }}
          >
            Welcome to ShopHub
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 300,
              lineHeight: 1.4,
              opacity: 0.9,
            }}
          >
            Discover amazing products at unbeatable prices. Shop with confidence
            and enjoy fast, reliable delivery.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/products')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Shop Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/categories')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Browse Categories
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold', color: 'text.primary' }}
          >
            Why Choose ShopHub?
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'center',
            }}
          >
            {[
              {
                icon: '🚚',
                title: 'Free Shipping',
                description: 'Free delivery on orders over $50',
              },
              {
                icon: '🔒',
                title: 'Secure Payment',
                description: 'Your payments are safe and secure',
              },
              {
                icon: '🎧',
                title: '24/7 Support',
                description: 'Get help whenever you need it',
              },
              {
                icon: '🔄',
                title: 'Easy Returns',
                description: '30-day hassle-free return policy',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                sx={{
                  flex: '1 1 250px',
                  maxWidth: 300,
                  textAlign: 'center',
                  p: 3,
                  border: 'none',
                  boxShadow: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Typography sx={{ fontSize: '3rem', mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              Featured Products
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Discover our most popular and highly-rated items
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {loading
              ? Array.from(new Array(8)).map((_, index) => (
                  <Card key={index} sx={{ height: 400 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Card>
                ))
              : featuredProducts.map((product) => (
                  <Card
                    key={product._id}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.images[0]?.url || '/placeholder-image.jpg'}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 'bold',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 1,
                        }}
                      >
                        {product.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={product.rating.average}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({product.rating.count})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {product.discountPrice ? (
                          <>
                            <Typography
                              variant="h6"
                              color="primary"
                              fontWeight="bold"
                            >
                              {formatPrice(product.discountPrice)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ textDecoration: 'line-through' }}
                              color="text.secondary"
                            >
                              {formatPrice(product.price)}
                            </Typography>
                            <Chip
                              label={`${product.discountPercentage}% OFF`}
                              color="error"
                              size="small"
                              icon={<LocalOffer />}
                            />
                          </>
                        ) : (
                          <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                          >
                            {formatPrice(product.price)}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={product.category}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShoppingCart />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                        sx={{
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </Card>
                ))}
          </Box>

          {!loading && featuredProducts.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/products')}
                sx={{ px: 4, py: 1.5 }}
              >
                View All Products
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Ready to Start Shopping?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of happy customers and discover your next favorite product today!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: 'white',
              color: 'error.main',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
