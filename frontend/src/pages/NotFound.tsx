import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          borderRadius: 4,
        }}
      >
        <Box
          sx={{
            fontSize: '8rem',
            fontWeight: 'bold',
            color: 'primary.main',
            lineHeight: 1,
            mb: 2,
          }}
        >
          404
        </Box>
        
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          Page Not Found
        </Typography>
        
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Oops! The page you're looking for doesn't exist. It might have been moved, 
          deleted, or you entered the wrong URL.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              minWidth: 180,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Go to Homepage
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              minWidth: 180,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Go Back
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/products')}
            sx={{
              minWidth: 180,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Browse Products
          </Button>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team or visit our FAQ section.
          </Typography>
        </Box>
      </Paper>

      {/* Additional helpful links */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Popular Pages
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          <Button variant="text" onClick={() => navigate('/products')}>
            All Products
          </Button>
          <Button variant="text" onClick={() => navigate('/cart')}>
            Shopping Cart
          </Button>
          <Button variant="text" onClick={() => navigate('/orders')}>
            Order History
          </Button>
          <Button variant="text" onClick={() => navigate('/settings')}>
            Account Settings
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
