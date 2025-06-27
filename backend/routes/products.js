const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) {
      // Support multiple categories separated by comma
      const categories = category.split(',');
      query.category = { $in: categories };
    }
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) {
      query['rating.average'] = { $gte: Number(minRating) };
    }
    if (search) {
      query.$or = [
        { $text: { $search: search } },
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reviews.user', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    // Try to get from database first
    const products = await Product.find({ 
      isActive: true,
      'rating.average': { $gte: 4.0 }
    })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(8)
    .populate('reviews.user', 'name');

    // If no products in database, return mock data
    if (products.length === 0) {
      return res.json(getMockProducts());
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Fallback to mock data if database error
    res.json(getMockProducts());
  }
});

// Mock data for development when MongoDB is not available
const getMockProducts = () => {
  return [
    {
      _id: "mock1",
      name: "iPhone 15 Pro",
      description: "The most advanced iPhone ever with titanium design, A17 Pro chip, and incredible camera system.",
      price: 999,
      discountPrice: 899,
      category: "Electronics",
      brand: "Apple",
      images: [{
        url: "https://images.unsplash.com/photo-1592286942460-c63600a6b253?w=400",
        alt: "iPhone 15 Pro"
      }],
      stock: 50,
      rating: { average: 4.8, count: 245 },
      isActive: true
    },
    {
      _id: "mock2",
      name: "MacBook Air M2",
      description: "Supercharged by M2 chip. Ultra-thin, ultra-capable, and available in four beautiful colors.",
      price: 1199,
      category: "Electronics",
      brand: "Apple",
      images: [{
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        alt: "MacBook Air M2"
      }],
      stock: 30,
      rating: { average: 4.7, count: 189 },
      isActive: true
    },
    {
      _id: "mock3",
      name: "Sony WH-1000XM5",
      description: "Industry-leading noise canceling wireless headphones with exceptional sound quality.",
      price: 399,
      discountPrice: 329,
      category: "Electronics",
      brand: "Sony",
      images: [{
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        alt: "Sony WH-1000XM5"
      }],
      stock: 75,
      rating: { average: 4.6, count: 423 },
      isActive: true
    },
    {
      _id: "mock4",
      name: "Nike Air Max 270",
      description: "Lifestyle shoe with Max Air unit for all-day comfort and modern style.",
      price: 150,
      discountPrice: 120,
      category: "Clothing",
      brand: "Nike",
      images: [{
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        alt: "Nike Air Max 270"
      }],
      stock: 100,
      rating: { average: 4.4, count: 567 },
      isActive: true
    }
  ];
};

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');
    
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add product review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    product.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update rating
    const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRatings / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin routes
// Create product
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin routes for category management
router.get('/admin/categories', adminAuth, async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalStock: { $sum: "$stock" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/admin/categories/:oldName/:newName', adminAuth, async (req, res) => {
  try {
    const { oldName, newName } = req.params;
    
    const result = await Product.updateMany(
      { category: oldName },
      { category: newName }
    );

    res.json({
      message: 'Category updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/admin/inventory/alerts', adminAuth, async (req, res) => {
  try {
    const lowStockThreshold = 10;
    const outOfStockThreshold = 0;

    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $lte: lowStockThreshold, $gt: outOfStockThreshold }
    }).sort({ stock: 1 });

    const outOfStockProducts = await Product.find({
      isActive: true,
      stock: { $lte: outOfStockThreshold }
    });

    res.json({
      lowStockProducts,
      outOfStockProducts,
      alerts: {
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
