import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { productsAPI } from '../services/api';

interface CategoryManagementProps {
  onError: (message: string) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ onError }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ oldName: '', newName: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getCategoryStats();
      setCategories(response.data);
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryUpdate = async () => {
    if (!categoryForm.oldName || !categoryForm.newName) {
      onError('Please select a category and enter a new name');
      return;
    }

    try {
      await productsAPI.updateCategoryName(categoryForm.oldName, categoryForm.newName);
      setCategoryDialog(false);
      setCategoryForm({ oldName: '', newName: '' });
      fetchCategories();
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Category Management</Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setCategoryDialog(true)}
        >
          Edit Category
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        {categories.map((category) => (
          <Card key={category._id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  {category._id}
                </Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Products"
                    secondary={category.count}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Average Price"
                    secondary={formatPrice(category.avgPrice)}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Total Stock"
                    secondary={category.totalStock}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Category Update Dialog */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Category Name</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Category</InputLabel>
              <Select
                value={categoryForm.oldName}
                onChange={(e) => setCategoryForm({ ...categoryForm, oldName: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category._id} ({category.count} products)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="New Category Name"
              value={categoryForm.newName}
              onChange={(e) => setCategoryForm({ ...categoryForm, newName: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCategoryUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;
