import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Chip,
  Alert,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Slider,
  Divider,
  Rating,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useUserState } from '../contexts/UserStateContext';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { savedItems, addToSaved, removeFromSaved, addToSearchHistory } = useUserState();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Search and filter state
  const query = searchParams.get('q') || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (query) {
      addToSearchHistory(query);
      fetchProducts();
    }
  }, [query, currentPage, sortBy, sortOrder, selectedCategories, priceRange, minRating]);

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
      const response = await productsAPI.getProducts({
        search: query,
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating,
      });

      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalResults(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event: any) => {
    const [newSortBy, newSortOrder] = event.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handlePriceRangeCommitted = () => {
    setCurrentPage(1);
  };

  const handleRatingChange = (event: any, newValue: number | null) => {
    setMinRating(newValue || 0);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setMinRating(0);
    setCurrentPage(1);
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

  if (!query) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Please enter a search term to find products.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Results for "{query}"
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '250px 1fr' }, gap: 3 }}>
        {/* Filters Sidebar */}
        <Box>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  Filters
                </Typography>
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={selectedCategories.length === 0 && priceRange[0] === 0 && priceRange[1] === 1000 && minRating === 0}
                >
                  Clear
                </Button>
              </Box>

              {/* Categories Filter */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Categories</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {categories.map((category) => (
                      <FormControlLabel
                        key={category}
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                          />
                        }
                        label={category}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Price Range Filter */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Price Range</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      onChangeCommitted={handlePriceRangeCommitted}
                      valueLabelDisplay="auto"
                      min={0}
                      max={1000}
                      step={10}
                      valueLabelFormat={(value) => `$${value}`}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">${priceRange[0]}</Typography>
                      <Typography variant="body2">${priceRange[1]}</Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Rating Filter */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Minimum Rating</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                      value={minRating}
                      onChange={handleRatingChange}
                      precision={0.5}
                    />
                    <Typography variant="body2">& up</Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Box>

        {/* Results */}
        <Box>
          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {loading ? 'Searching...' : `${totalResults} results found`}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                label="Sort by"
              >
                <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                <MenuItem value="price-asc">Price (Low to High)</MenuItem>
                <MenuItem value="price-desc">Price (High to Low)</MenuItem>
                <MenuItem value="rating.average-desc">Rating (High to Low)</MenuItem>
                <MenuItem value="createdAt-desc">Newest First</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <>
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
                        {product.discountPercentage && (
                          <Chip
                            label={`${product.discountPercentage}% OFF`}
                            color="error"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
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
                          <Rating value={product.rating.average} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({product.rating.count})
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
                      </CardContent>

                      <Divider />

                      <CardActions sx={{ p: 2, pt: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        >
                          Add to Cart
                        </Button>
                      </CardActions>
                    </Card>
                  );
                })}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && products.length === 0 && (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search terms or filters to find what you're looking for.
              </Typography>
              <Button variant="outlined" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SearchResults;
