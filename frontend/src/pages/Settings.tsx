import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Chip,
  Button,
  Alert,
  Divider,
  useTheme as useMuiTheme,
} from '@mui/material';
import { 
  DarkMode, 
  LightMode, 
  Brightness4,
  Notifications,
  Language,
  AttachMoney,
  History,
  Save
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUserState } from '../contexts/UserStateContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const { searchHistory, clearSearchHistory } = useUserState();
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [preferences, setPreferences] = useState({
    currency: user?.preferences?.currency || 'USD',
    language: user?.preferences?.language || 'en',
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      promotions: user?.preferences?.notifications?.promotions ?? true,
      orderUpdates: user?.preferences?.notifications?.orderUpdates ?? true,
    },
    categories: user?.preferences?.categories || [],
  });

  // Update theme preference when it changes
  useEffect(() => {
    if (user?.preferences?.theme) {
      const shouldBeDark = user.preferences.theme === 'dark';
      if (shouldBeDark !== isDarkMode) {
        toggleTheme();
      }
    }
  }, [user?.preferences?.theme]);

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const updatedPreferences = {
        ...preferences,
        theme: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light'
      };
      await updatePreferences(updatedPreferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearSearchHistory = () => {
    clearSearchHistory();
    setMessage({ type: 'success', text: 'Search history cleared!' });
  };

  const handleNotificationChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: event.target.checked
      }
    }));
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="warning">Please log in to access settings.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          mb: 4,
          color: 'text.primary'
        }}
      >
        Account Settings
      </Typography>

      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Theme Preferences */}
        <Card elevation={0} sx={{ border: `1px solid ${muiTheme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Brightness4 sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Appearance
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
                  Theme Preference
                </FormLabel>
                <RadioGroup
                  value={isDarkMode ? 'dark' : 'light'}
                  onChange={(e) => {
                    const newIsDark = e.target.value === 'dark';
                    if (newIsDark !== isDarkMode) {
                      toggleTheme();
                    }
                  }}
                  row
                >
                  <FormControlLabel 
                    value="light" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightMode sx={{ mr: 1, fontSize: 20 }} />
                        Light Mode
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value="dark" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DarkMode sx={{ mr: 1, fontSize: 20 }} />
                        Dark Mode
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* General Preferences */}
        <Card elevation={0} sx={{ border: `1px solid ${muiTheme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Language sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Regional Settings
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, fontSize: 20 }} />
                    Currency
                  </Box>
                </FormLabel>
                <RadioGroup
                  value={preferences.currency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                  row
                >
                  <FormControlLabel value="USD" control={<Radio />} label="USD ($)" />
                  <FormControlLabel value="EUR" control={<Radio />} label="EUR (€)" />
                  <FormControlLabel value="GBP" control={<Radio />} label="GBP (£)" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
                  Language
                </FormLabel>
                <RadioGroup
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  row
                >
                  <FormControlLabel value="en" control={<Radio />} label="English" />
                  <FormControlLabel value="es" control={<Radio />} label="Spanish" />
                  <FormControlLabel value="fr" control={<Radio />} label="French" />
                </RadioGroup>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card elevation={0} sx={{ border: `1px solid ${muiTheme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Notifications sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notification Preferences
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>Email Notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive general email notifications
                </Typography>
              </Box>
              <Switch
                checked={preferences.notifications.email}
                onChange={handleNotificationChange('email')}
                color="primary"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>Promotional Emails</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive offers and promotional content
                </Typography>
              </Box>
              <Switch
                checked={preferences.notifications.promotions}
                onChange={handleNotificationChange('promotions')}
                color="primary"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>Order Updates</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get notified about order status changes
                </Typography>
              </Box>
              <Switch
                checked={preferences.notifications.orderUpdates}
                onChange={handleNotificationChange('orderUpdates')}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card elevation={0} sx={{ border: `1px solid ${muiTheme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Account Information
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{user.name}</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Email</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{user.email}</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Last Login</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Login Count</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{user.loginCount || 0}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Search History */}
        <Card elevation={0} sx={{ border: `1px solid ${muiTheme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Search History</Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleClearSearchHistory}
                disabled={searchHistory.length === 0}
                sx={{ borderRadius: 2 }}
              >
                Clear History
              </Button>
            </Box>
            
            {searchHistory.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchHistory.map((item, index) => (
                  <Chip 
                    key={index} 
                    label={item.query} 
                    variant="outlined" 
                    size="small"
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No search history available
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSavePreferences}
            disabled={saving}
            startIcon={<Save />}
            sx={{ 
              minWidth: 200,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;
