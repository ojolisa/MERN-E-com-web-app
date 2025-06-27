import React from 'react';
import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
          {/* Company Info */}
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              ShopHub
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'grey.400' }}>
              Your one-stop destination for quality products at great prices. 
              We're committed to providing exceptional shopping experiences.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products" color="grey.400" underline="hover">
                All Products
              </Link>
              <Link href="/categories" color="grey.400" underline="hover">
                Categories
              </Link>
              <Link href="/deals" color="grey.400" underline="hover">
                Special Deals
              </Link>
              <Link href="/about" color="grey.400" underline="hover">
                About Us
              </Link>
              <Link href="/contact" color="grey.400" underline="hover">
                Contact
              </Link>
            </Box>
          </Box>

          {/* Customer Service */}
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="grey.400" underline="hover">
                Help Center
              </Link>
              <Link href="/shipping" color="grey.400" underline="hover">
                Shipping Info
              </Link>
              <Link href="/returns" color="grey.400" underline="hover">
                Returns & Exchanges
              </Link>
              <Link href="/faq" color="grey.400" underline="hover">
                FAQ
              </Link>
              <Link href="/track-order" color="grey.400" underline="hover">
                Track Your Order
              </Link>
            </Box>
          </Box>

          {/* Contact Info */}
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2" color="grey.400">
                  support@shophub.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2" color="grey.400">
                  1-800-SHOP-HUB
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2" color="grey.400">
                  123 Commerce St, City, State 12345
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {new Date().getFullYear()} ShopHub. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" color="grey.400" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link href="/terms" color="grey.400" underline="hover" variant="body2">
              Terms of Service
            </Link>
            <Link href="/cookies" color="grey.400" underline="hover" variant="body2">
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
