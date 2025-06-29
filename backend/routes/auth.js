const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update login info
    await user.updateLoginInfo();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        avatar: user.avatar,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    // Populate cart and saved items with product details
    const user = await req.user.populate([
      { path: 'cart.productId', select: 'name price discountPrice images' },
      { path: 'savedItems.productId', select: 'name price discountPrice images' },
      { path: 'recentlyViewed.productId', select: 'name price discountPrice images' }
    ]);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        avatar: user.avatar,
        preferences: user.preferences,
        cart: user.cart,
        savedItems: user.savedItems,
        recentlyViewed: user.recentlyViewed,
        searchHistory: user.searchHistory,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { currency, language, theme, emailNotifications, smsNotifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        'preferences.currency': currency,
        'preferences.language': language,
        'preferences.theme': theme,
        'preferences.emailNotifications': emailNotifications,
        'preferences.smsNotifications': smsNotifications
      },
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cart management endpoints
router.post('/cart/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    await req.user.addToCart(productId, quantity);
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/cart/:productId', auth, async (req, res) => {
  try {
    await req.user.removeFromCart(req.params.productId);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/cart/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    await req.user.updateCartQuantity(req.params.productId, quantity);
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/cart', auth, async (req, res) => {
  try {
    await req.user.clearCart();
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Saved items management
router.post('/saved/:productId', auth, async (req, res) => {
  try {
    await req.user.saveItem(req.params.productId);
    res.json({ message: 'Item saved' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/saved/:productId', auth, async (req, res) => {
  try {
    await req.user.unsaveItem(req.params.productId);
    res.json({ message: 'Item unsaved' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Recently viewed
router.post('/viewed/:productId', auth, async (req, res) => {
  try {
    await req.user.addToRecentlyViewed(req.params.productId);
    res.json({ message: 'Added to recently viewed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Search history
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;
    await req.user.addToSearchHistory(query);
    res.json({ message: 'Search saved' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete account
router.delete('/delete-account', auth, async (req, res) => {
  try {
    // Remove user from database
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin routes for user management
router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/users/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    res.json({
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/admin/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
