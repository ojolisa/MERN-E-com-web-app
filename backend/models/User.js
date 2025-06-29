const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: true
      },
      orderUpdates: {
        type: Boolean,
        default: true
      }
    },
    categories: [{
      type: String
    }]
  },
  savedItems: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  recentlyViewed: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  searchHistory: [{
    query: String,
    searchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login and increment login count
userSchema.methods.updateLoginInfo = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Add item to cart
userSchema.methods.addToCart = async function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => 
    item.productId.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ productId, quantity });
  }
  
  return this.save();
};

// Remove item from cart
userSchema.methods.removeFromCart = async function(productId) {
  this.cart = this.cart.filter(item => 
    item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Update cart item quantity
userSchema.methods.updateCartQuantity = async function(productId, quantity) {
  const item = this.cart.find(item => 
    item.productId.toString() === productId.toString()
  );
  
  if (item) {
    item.quantity = quantity;
    return this.save();
  }
  return this;
};

// Clear cart
userSchema.methods.clearCart = async function() {
  this.cart = [];
  return this.save();
};

// Add to recently viewed
userSchema.methods.addToRecentlyViewed = async function(productId) {
  // Remove if already exists
  this.recentlyViewed = this.recentlyViewed.filter(item => 
    item.productId.toString() !== productId.toString()
  );
  
  // Add to beginning
  this.recentlyViewed.unshift({ productId });
  
  // Keep only last 20 items
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
  
  return this.save();
};

// Add to saved items
userSchema.methods.saveItem = async function(productId) {
  const existingItem = this.savedItems.find(item => 
    item.productId.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.savedItems.push({ productId });
    return this.save();
  }
  return this;
};

// Remove from saved items
userSchema.methods.unsaveItem = async function(productId) {
  this.savedItems = this.savedItems.filter(item => 
    item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Update user preferences
userSchema.methods.updatePreferences = async function(preferences) {
  this.preferences = { ...this.preferences.toObject(), ...preferences };
  return this.save();
};

// Add to search history
userSchema.methods.addToSearchHistory = async function(query) {
  // Remove if already exists
  this.searchHistory = this.searchHistory.filter(item => 
    item.query !== query
  );
  
  // Add to beginning
  this.searchHistory.unshift({ query });
  
  // Keep only last 10 searches
  if (this.searchHistory.length > 10) {
    this.searchHistory = this.searchHistory.slice(0, 10);
  }
  
  return this.save();
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
