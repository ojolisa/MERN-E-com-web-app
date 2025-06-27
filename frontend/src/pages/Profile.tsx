import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  History as HistoryIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as CartIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUserState } from '../contexts/UserStateContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Profile: React.FC = () => {
  const { user, saveUserState } = useAuth();
  const { savedItems, recentlyViewed, searchHistory } = useUserState();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarDialog, setAvatarDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
  });

  const [newAvatar, setNewAvatar] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      await authAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Refresh user data
      await saveUserState();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || '',
        },
      });
    }
    setEditing(false);
    setError('');
  };

  const handleAvatarUpdate = async () => {
    try {
      setLoading(true);
      // This would typically upload the image to a service and get a URL
      // For now, we'll just use the URL directly
      await authAPI.updateProfile({ avatar: newAvatar });
      setSuccess('Avatar updated successfully!');
      setAvatarDialog(false);
      setNewAvatar('');
      await saveUserState();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Main Profile Information */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 100, height: 100, mr: 3 }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 20,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  onClick={() => setAvatarDialog(true)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                <Chip
                  label={user.role === 'admin' ? 'Administrator' : 'Customer'}
                  color={user.role === 'admin' ? 'primary' : 'default'}
                  size="small"
                />
              </Box>
              <Button
                variant={editing ? 'outlined' : 'contained'}
                startIcon={editing ? <CancelIcon /> : <EditIcon />}
                onClick={editing ? handleCancel : () => setEditing(true)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Personal Information */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              Personal Information
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
              />
              <TextField
                label="Email"
                value={user.email}
                disabled
                fullWidth
                helperText="Email cannot be changed"
              />
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
              />
            </Box>

            {/* Address Information */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1 }} />
              Address Information
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 4 }}>
              <TextField
                label="Street Address"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <TextField
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <TextField
                  label="ZIP Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Box>
              <TextField
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
              />
            </Box>

            {editing && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Sidebar with Stats and Quick Links */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Account Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Member Since:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Recently'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Logins:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user.loginCount || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Last Login:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FavoriteIcon />}
                  onClick={() => navigate('/wishlist')}
                  fullWidth
                >
                  Wishlist ({savedItems.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CartIcon />}
                  onClick={() => navigate('/orders')}
                  fullWidth
                >
                  Order History
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate('/settings')}
                  fullWidth
                >
                  Account Settings
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentlyViewed.slice(0, 3).map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        src={item.productId.images?.[0]?.url}
                        alt={item.productId.name}
                        variant="square"
                        sx={{ width: 40, height: 40 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.productId.name}
                      secondary={`Viewed ${formatDate(item.viewedAt)}`}
                    />
                  </ListItem>
                ))}
                {recentlyViewed.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No recent activity
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Avatar Update Dialog */}
      <Dialog open={avatarDialog} onClose={() => setAvatarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Avatar URL"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
            placeholder="https://example.com/your-avatar.jpg"
            sx={{ mt: 2 }}
            helperText="Enter a URL for your new profile picture"
          />
          {newAvatar && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" gutterBottom>
                Preview:
              </Typography>
              <Avatar
                src={newAvatar}
                alt="Preview"
                sx={{ width: 100, height: 100, mx: 'auto' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAvatarUpdate}
            variant="contained"
            disabled={!newAvatar || loading}
          >
            {loading ? 'Updating...' : 'Update Avatar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
