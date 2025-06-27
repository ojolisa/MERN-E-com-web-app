import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Grid,
  Divider,
  Pagination,
  CircularProgress,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Product, Order, User } from '../types';
import { productsAPI, ordersAPI } from '../services/api';
import UserManagement from '../components/UserManagement';
import CategoryManagement from '../components/CategoryManagement';
import InventoryAlerts from '../components/InventoryAlerts';
import Analytics from '../components/Analytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [totalProductsPages, setTotalProductsPages] = useState(1);
  const [totalOrdersPages, setTotalOrdersPages] = useState(1);
  
  // Search and filter state
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // Product management state
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: '',
    brand: '',
    tags: [] as string[],
  });

  // Order management state
  const [orderDialog, setOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderStatusForm, setOrderStatusForm] = useState({
    orderStatus: '',
    trackingNumber: '',
  });

  // Bulk actions state
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchOrders()
      ]);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (page = 1, search = '') => {
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      
      const response = await productsAPI.getProducts(params);
      const data = response.data;
      
      // Ensure data integrity
      const productsData = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : [];
      setProducts(productsData);
      setTotalProductsPages(data.totalPages || 1);
      setProductsPage(page);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]); // Set to empty array on error
      setError('Failed to fetch products');
      throw err;
    }
  };

  const fetchOrders = async (page = 1, status = '') => {
    try {
      const params: any = { page, limit: 10 };
      if (status) params.status = status;
      
      const response = await ordersAPI.getAllOrders(params);
      const data = response.data;
      
      // Ensure data integrity
      const ordersData = Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : [];
      setOrders(ordersData);
      setTotalOrdersPages(data.totalPages || 1);
      setOrdersPage(page);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]); // Set to empty array on error
      setError('Failed to fetch orders');
      throw err;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProductSubmit = async () => {
    try {
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct._id!, productForm);
        setSuccess('Product updated successfully');
      } else {
        await productsAPI.createProduct(productForm);
        setSuccess('Product created successfully');
      }
      setProductDialog(false);
      resetProductForm();
      await fetchProducts(productsPage, productSearch);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
      console.error('Error saving product:', err);
    }
  };

  const handleOrderStatusUpdate = async () => {
    if (!editingOrder) return;
    
    try {
      await ordersAPI.updateOrderStatus(
        editingOrder._id, 
        orderStatusForm.orderStatus,
        orderStatusForm.trackingNumber || undefined
      );
      setSuccess('Order status updated successfully');
      setOrderDialog(false);
      setEditingOrder(null);
      setOrderStatusForm({ orderStatus: '', trackingNumber: '' });
      await fetchOrders(ordersPage, orderStatusFilter);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
      console.error('Error updating order:', err);
    }
  };

  const handleBulkOrderAction = async () => {
    if (selectedOrders.length === 0) {
      setError('Please select orders to perform bulk action');
      return;
    }

    try {
      if (bulkAction === 'delete') {
        // Note: This would need a backend bulk delete endpoint
        setError('Bulk delete not yet implemented in backend');
        return;
      }
      
      if (bulkAction === 'export') {
        // Export selected orders
        const response = await ordersAPI.exportReport('orders');
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess(`Exported ${selectedOrders.length} orders`);
      }
      
      setBulkActionDialog(false);
      setSelectedOrders([]);
      setBulkAction('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to perform bulk action');
    }
  };

  const handleProductDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(id);
        setSuccess('Product deleted successfully');
        await fetchProducts(productsPage, productSearch);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const openOrderDialog = (order: Order) => {
    setEditingOrder(order);
    setOrderStatusForm({
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber || '',
    });
    setOrderDialog(true);
  };

  const handleOrderSelection = (orderId: string, selected: boolean) => {
    if (selected) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAllOrders = (selected: boolean) => {
    if (!orders || orders.length === 0) return;
    
    if (selected) {
      setSelectedOrders(orders.map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleProductSearch = async (search: string) => {
    setProductSearch(search);
    setProductsPage(1);
    await fetchProducts(1, search);
  };

  const handleOrderFilter = async (status: string) => {
    setOrderStatusFilter(status);
    setOrdersPage(1);
    await fetchOrders(1, status);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrl: '',
      brand: '',
      tags: [],
    });
    setEditingProduct(null);
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        imageUrl: product.images?.[0]?.url || '',
        brand: product.brand || '',
        tags: product.tags || [],
      });
    } else {
      resetProductForm();
    }
    setProductDialog(true);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getDashboardStats = () => {
    const totalProducts = products?.length || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders
      ?.filter(order => order?.orderStatus !== 'cancelled')
      ?.reduce((sum, order) => sum + (order?.totalAmount || 0), 0) || 0;
    const lowStockProducts = products?.filter(product => product?.stock < 10)?.length || 0;

    return { totalProducts, totalOrders, totalRevenue, lowStockProducts };
  };

  const stats = React.useMemo(() => {
    try {
      return getDashboardStats();
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return { totalProducts: 0, totalOrders: 0, totalRevenue: 0, lowStockProducts: 0 };
    }
  }, [products, orders]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<CategoryIcon />} label="Products" />
          <Tab icon={<PeopleIcon />} label="Orders" />
          <Tab icon={<AnalyticsIcon />} label="Users" />
          <Tab icon={<InventoryIcon />} label="Categories" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Dashboard Overview</Typography>
          <IconButton onClick={fetchData} title="Refresh Data">
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {stats.totalProducts}
              </Typography>
              <Chip 
                label="Active" 
                color="success" 
                size="small" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {stats.totalOrders}
              </Typography>
              <Chip 
                label="All Time" 
                color="info" 
                size="small" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="success.main">
                ${stats.totalRevenue.toFixed(2)}
              </Typography>
              <Chip 
                label="Completed Orders" 
                color="success" 
                size="small" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4" color={stats.lowStockProducts > 0 ? "warning.main" : "success.main"}>
                {stats.lowStockProducts}
              </Typography>
              <Chip 
                label={stats.lowStockProducts > 0 ? "Needs Attention" : "All Good"} 
                color={stats.lowStockProducts > 0 ? "warning" : "success"} 
                size="small" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Orders
              </Typography>
              <Button 
                size="small" 
                onClick={() => setTabValue(2)}
                variant="outlined"
              >
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders && orders.length > 0 ? orders.slice(0, 5).map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {order._id?.slice(-8) || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {typeof order.user === 'string' 
                          ? order.user 
                          : order.user?.name || 'Unknown User'
                        }
                      </TableCell>
                      <TableCell>${(order.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatus || 'Unknown'}
                          color={getOrderStatusColor(order.orderStatus || '') as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openOrderDialog(order)}
                          title="Quick Edit"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No orders found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Products Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Products Management</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => handleProductSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            <IconButton onClick={() => fetchProducts(productsPage, productSearch)}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openProductDialog()}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products && products.length > 0 ? products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {product.images?.[0]?.url && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                        />
                      )}
                      <Typography variant="body2">{product.name || 'Unnamed Product'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{product.brand || 'No Brand'}</TableCell>
                  <TableCell>{product.category || 'Uncategorized'}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        ${(product.price || 0).toFixed(2)}
                      </Typography>
                      {product.discountPrice && (
                        <Typography variant="caption" color="success.main">
                          Sale: ${product.discountPrice.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.stock || 0}
                      color={
                        (product.stock || 0) < 10 ? 'error' : 
                        (product.stock || 0) < 50 ? 'warning' : 'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.isActive ? 'Active' : 'Inactive'}
                      color={product.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => openProductDialog(product)}
                      size="small"
                      title="Edit Product"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleProductDelete(product._id!)}
                      size="small"
                      color="error"
                      title="Delete Product"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalProductsPages || 1}
            page={productsPage}
            onChange={(_, page) => fetchProducts(page, productSearch)}
            disabled={!products || products.length === 0}
          />
        </Box>
      </TabPanel>

      {/* Orders Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Orders Management</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={orderStatusFilter}
                label="Filter by Status"
                onChange={(e) => handleOrderFilter(e.target.value)}
              >
                <MenuItem value="">All Orders</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            {selectedOrders.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setBulkActionDialog(true)}
              >
                Bulk Actions ({selectedOrders.length})
              </Button>
            )}
            <IconButton onClick={() => fetchOrders(ordersPage, orderStatusFilter)}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={orders && orders.length > 0 && selectedOrders.length === orders.length}
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < (orders?.length || 0)}
                    onChange={(e) => handleSelectAllOrders(e.target.checked)}
                    disabled={!orders || orders.length === 0}
                  />
                </TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders && orders.length > 0 ? orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order._id)}
                      onChange={(e) => handleOrderSelection(order._id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {order._id?.slice(-8) || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {typeof order.user === 'string' 
                      ? order.user 
                      : order.user?.name || 'Unknown User'
                    }
                  </TableCell>
                  <TableCell>{(order.items?.length || 0)} items</TableCell>
                  <TableCell>${(order.totalAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.orderStatus || 'Unknown'}
                      color={getOrderStatusColor(order.orderStatus || '') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => openOrderDialog(order)}
                      title="Edit Status"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" title="View Details">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalOrdersPages || 1}
            page={ordersPage}
            onChange={(_, page) => fetchOrders(page, orderStatusFilter)}
            disabled={!orders || orders.length === 0}
          />
        </Box>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={3}>
        <UserManagement onError={setError} />
      </TabPanel>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={4}>
        <CategoryManagement onError={setError} />
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={5}>
        <Analytics onError={setError} />
      </TabPanel>

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Product Name"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Brand"
              value={productForm.brand}
              onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                margin="normal"
                required
              />
              <TextField
                sx={{ flex: 1 }}
                label="Stock Quantity"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                margin="normal"
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Category"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Image URL"
              value={productForm.imageUrl}
              onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={productForm.tags}
                onChange={(e) => setProductForm({ ...productForm, tags: e.target.value as string[] })}
                input={<OutlinedInput label="Tags" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {['Featured', 'Sale', 'New', 'Popular', 'Limited'].map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    <Checkbox checked={productForm.tags.includes(tag)} />
                    <ListItemText primary={tag} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleProductSubmit} 
            variant="contained"
            disabled={!productForm.name || !productForm.description || !productForm.category}
          >
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Status Dialog */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Order Status</InputLabel>
              <Select
                value={orderStatusForm.orderStatus}
                onChange={(e) => setOrderStatusForm({ ...orderStatusForm, orderStatus: e.target.value })}
                label="Order Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Tracking Number (Optional)"
              value={orderStatusForm.trackingNumber}
              onChange={(e) => setOrderStatusForm({ ...orderStatusForm, trackingNumber: e.target.value })}
              margin="normal"
              placeholder="Enter tracking number for shipped orders"
            />
            {editingOrder && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Order Details:</Typography>
                <Typography variant="body2">Order ID: {editingOrder._id}</Typography>
                <Typography variant="body2">
                  Customer: {typeof editingOrder.user === 'string' 
                    ? editingOrder.user 
                    : editingOrder.user?.name || 'Unknown User'
                  }
                </Typography>
                <Typography variant="body2">Total: ${editingOrder.totalAmount.toFixed(2)}</Typography>
                <Typography variant="body2">Items: {editingOrder.items.length}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleOrderStatusUpdate} 
            variant="contained"
            disabled={!orderStatusForm.orderStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)}>
        <DialogTitle>Bulk Actions</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Selected {selectedOrders.length} orders. Choose an action:
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              label="Action"
            >
              <MenuItem value="export">Export Selected Orders</MenuItem>
              <MenuItem value="delete" disabled>Delete Selected Orders (Coming Soon)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkOrderAction}
            variant="contained"
            disabled={!bulkAction}
          >
            Execute
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;
