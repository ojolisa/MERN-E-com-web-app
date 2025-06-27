import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  InputBase,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  alpha,
  styled,
  useTheme as useMuiTheme,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle,
  Menu as MenuIcon,
  Store as StoreIcon,
  DarkMode,
  LightMode,
  Person,
  ShoppingBag,
  AdminPanelSettings,
  Logout,
  Favorite,
  History,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.text.primary, 0.08),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.12),
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
  '&:focus-within': {
    backgroundColor: alpha(theme.palette.text.primary, 0.12),
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  marginLeft: 0,
  width: '100%',
  transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color']),
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.25, 1, 1.25, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '350px',
      '&:focus': {
        width: '400px',
      },
    },
  },
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['background-color']),
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.08),
  },
}));

const Header: React.FC = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ py: 1, minHeight: '72px' }}>
        {/* Logo Section */}
        <Logo onClick={handleLogoClick} sx={{ mr: 3 }}>
          <StoreIcon 
            sx={{ 
              fontSize: 36, 
              color: 'primary.main',
              mr: 1
            }} 
          />
          <Typography
            variant="h5"
            component="div"
            sx={{ 
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: 'text.primary',
              background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ShopHub
          </Typography>
        </Logo>

        {/* Search Bar */}
        <Box 
          component="form" 
          onSubmit={handleSearch} 
          sx={{ 
            flexGrow: 1, 
            maxWidth: 600,
            mx: 2,
          }}
        >
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton 
              onClick={toggleTheme}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.08),
                },
              }}
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Cart Icon */}
          <Tooltip title="Shopping Cart">
            <IconButton 
              onClick={() => navigate('/cart')}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.08),
                },
              }}
            >
              <Badge 
                badgeContent={getCartItemsCount()} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    minWidth: '18px',
                    height: '18px',
                  },
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          {user ? (
            <>
              <Tooltip title="Account">
                <IconButton 
                  onClick={handleProfileClick}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(muiTheme.palette.text.primary, 0.08),
                    },
                  }}
                >
                  {user.avatar ? (
                    <Avatar 
                      src={user.avatar} 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: `2px solid ${muiTheme.palette.primary.main}`,
                      }} 
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: 'primary.main',
                        fontSize: '1rem',
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: `1px solid ${muiTheme.palette.divider}`,
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {user.name || user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem 
                  onClick={() => { navigate('/profile'); handleClose(); }}
                  sx={{ py: 1.5 }}
                >
                  <Person sx={{ mr: 2, fontSize: 20 }} />
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={() => { navigate('/orders'); handleClose(); }}
                  sx={{ py: 1.5 }}
                >
                  <ShoppingBag sx={{ mr: 2, fontSize: 20 }} />
                  My Orders
                </MenuItem>
                <MenuItem 
                  onClick={() => { navigate('/wishlist'); handleClose(); }}
                  sx={{ py: 1.5 }}
                >
                  <Favorite sx={{ mr: 2, fontSize: 20 }} />
                  Wishlist
                </MenuItem>
                <MenuItem 
                  onClick={() => { navigate('/recently-viewed'); handleClose(); }}
                  sx={{ py: 1.5 }}
                >
                  <History sx={{ mr: 2, fontSize: 20 }} />
                  Recently Viewed
                </MenuItem>
                <MenuItem 
                  onClick={() => { navigate('/settings'); handleClose(); }}
                  sx={{ py: 1.5 }}
                >
                  <Settings sx={{ mr: 2, fontSize: 20 }} />
                  Settings
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem 
                    onClick={() => { navigate('/admin'); handleClose(); }}
                    sx={{ py: 1.5 }}
                  >
                    <AdminPanelSettings sx={{ mr: 2, fontSize: 20 }} />
                    Admin Panel
                  </MenuItem>
                )}
                <Divider />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ py: 1.5, color: 'error.main' }}
                >
                  <Logout sx={{ mr: 2, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Button 
                variant="text"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha(muiTheme.palette.text.primary, 0.08),
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ 
                  fontWeight: 600,
                  px: 3,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
