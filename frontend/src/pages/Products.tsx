import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Rating,
  Chip,
  Pagination,
  Alert,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useUserState } from '../contexts/UserStateContext';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToSearchHistory } = useUserState();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    updateURL();
  }, [search, category, sortBy, sortOrder, page, minPrice, maxPrice]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };
      
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);

      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (page !== 1) params.set('page', page.toString());
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    
    // Track search history if there's a search term
    if (search.trim()) {
      addToSearchHistory(search.trim());
    }
    
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Min Price"
            type="number"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            sx={{ width: 120 }}
          />

          <TextField
            size="small"
            label="Max Price"
            type="number"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            sx={{ width: 120 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="createdAt">Newest</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="rating.average">Rating</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={30} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or browse all products.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
            {products.map((product) => {
              const discountPercentage = product.discountPrice 
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;

              return (
                <Card key={product._id} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.images[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    />
                    {discountPercentage > 0 && (
                      <Chip
                        label={`${discountPercentage}% OFF`}
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      />
                    )}
                    {product.stock === 0 && (
                      <Chip
                        label="Out of Stock"
                        color="error"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                        }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      {product.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.brand} • {product.category}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={product.rating.average} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.rating.count})
                      </Typography>
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {formatPrice(product.discountPrice || product.price)}
                      </Typography>
                      {product.discountPrice && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ textDecoration: 'line-through' }}
                        >
                          {formatPrice(product.price)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default Products;
