import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Product } from '../types';
import { productsAPI } from '../services/api';

interface InventoryAlertsProps {
  onError: (message: string) => void;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ onError }) => {
  const [inventoryAlerts, setInventoryAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryAlerts();
  }, []);

  const fetchInventoryAlerts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getInventoryAlerts();
      setInventoryAlerts(response.data);
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to fetch inventory alerts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  if (!inventoryAlerts) {
    return (
      <Alert severity="error">
        Failed to load inventory alerts
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Inventory Alerts
      </Typography>

      <Grid container spacing={3}>
        {/* Low Stock Alert */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  Low Stock Products ({inventoryAlerts.alerts.lowStock})
                </Typography>
              </Box>
              <List>
                {inventoryAlerts.lowStockProducts.slice(0, 10).map((product: Product) => (
                  <React.Fragment key={product._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={product.images[0]?.url}
                          alt={product.name}
                          variant="square"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        secondary={`Stock: ${product.stock} | Category: ${product.category}`}
                      />
                      <Chip 
                        label={`${product.stock} left`} 
                        color="warning" 
                        size="small" 
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {inventoryAlerts.lowStockProducts.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No low stock products" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Out of Stock Alert */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6" color="error.main">
                  Out of Stock Products ({inventoryAlerts.alerts.outOfStock})
                </Typography>
              </Box>
              <List>
                {inventoryAlerts.outOfStockProducts.slice(0, 10).map((product: Product) => (
                  <React.Fragment key={product._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={product.images[0]?.url}
                          alt={product.name}
                          variant="square"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        secondary={`Category: ${product.category} | Price: $${product.price}`}
                      />
                      <Chip 
                        label="Out of Stock" 
                        color="error" 
                        size="small" 
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {inventoryAlerts.outOfStockProducts.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No out of stock products" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryAlerts;
