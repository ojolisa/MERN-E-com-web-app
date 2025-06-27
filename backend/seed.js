const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User'); // Add User model import
require('dotenv').config();

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "The most advanced iPhone ever with titanium design, A17 Pro chip, and incredible camera system.",
    price: 999,
    discountPrice: 899,
    category: "Electronics",
    brand: "Apple",
    images: [
      {
        url: "https://images.unsplash.com/photo-1592286942460-c63600a6b253?w=400",
        alt: "iPhone 15 Pro"
      }
    ],
    stock: 50,
    specifications: {
      "Screen Size": "6.1 inches",
      "Storage": "128GB",
      "Color": "Natural Titanium",
      "Camera": "48MP Main"
    },
    rating: {
      average: 4.8,
      count: 245
    },
    tags: ["smartphone", "apple", "premium", "5g"],
    isActive: true
  },
  {
    name: "MacBook Air M2",
    description: "Supercharged by M2 chip. Ultra-thin, ultra-capable, and available in four beautiful colors.",
    price: 1199,
    category: "Electronics",
    brand: "Apple",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        alt: "MacBook Air M2"
      }
    ],
    stock: 30,
    specifications: {
      "Processor": "Apple M2 chip",
      "Memory": "8GB",
      "Storage": "256GB SSD",
      "Display": "13.6-inch Liquid Retina"
    },
    rating: {
      average: 4.7,
      count: 189
    },
    tags: ["laptop", "apple", "ultrabook", "productivity"],
    isActive: true
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling wireless headphones with exceptional sound quality.",
    price: 399,
    discountPrice: 329,
    category: "Electronics",
    brand: "Sony",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        alt: "Sony WH-1000XM5"
      }
    ],
    stock: 75,
    specifications: {
      "Type": "Over-ear",
      "Battery Life": "30 hours",
      "Noise Canceling": "Yes",
      "Connectivity": "Bluetooth 5.2"
    },
    rating: {
      average: 4.6,
      count: 423
    },
    tags: ["headphones", "wireless", "noise-canceling", "premium"],
    isActive: true
  },
  {
    name: "Nike Air Max 270",
    description: "Lifestyle shoe with Max Air unit for all-day comfort and modern style.",
    price: 150,
    discountPrice: 120,
    category: "Clothing",
    brand: "Nike",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        alt: "Nike Air Max 270"
      }
    ],
    stock: 100,
    specifications: {
      "Type": "Lifestyle Sneakers",
      "Material": "Mesh and synthetic",
      "Sole": "Rubber",
      "Closure": "Lace-up"
    },
    rating: {
      average: 4.4,
      count: 567
    },
    tags: ["shoes", "sneakers", "lifestyle", "comfort"],
    isActive: true
  },
  {
    name: "Samsung 65\" 4K Smart TV",
    description: "Crystal UHD 4K Smart TV with HDR and built-in streaming apps.",
    price: 799,
    discountPrice: 649,
    category: "Electronics",
    brand: "Samsung",
    images: [
      {
        url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
        alt: "Samsung 4K TV"
      }
    ],
    stock: 25,
    specifications: {
      "Screen Size": "65 inches",
      "Resolution": "4K UHD",
      "Smart TV": "Yes",
      "HDR": "HDR10+"
    },
    rating: {
      average: 4.5,
      count: 234
    },
    tags: ["tv", "4k", "smart", "entertainment"],
    isActive: true
  },
  {
    name: "The Great Gatsby",
    description: "Classic novel by F. Scott Fitzgerald. A masterpiece of American literature.",
    price: 12.99,
    category: "Books",
    brand: "Scribner",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        alt: "The Great Gatsby Book"
      }
    ],
    stock: 200,
    specifications: {
      "Pages": "180",
      "Publisher": "Scribner",
      "Language": "English",
      "Format": "Paperback"
    },
    rating: {
      average: 4.3,
      count: 1234
    },
    tags: ["classic", "literature", "fiction", "american"],
    isActive: true
  },
  {
    name: "Instant Pot Duo",
    description: "7-in-1 programmable pressure cooker, slow cooker, rice cooker, and more.",
    price: 99,
    discountPrice: 79,
    category: "Home & Garden",
    brand: "Instant Pot",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        alt: "Instant Pot"
      }
    ],
    stock: 60,
    specifications: {
      "Capacity": "6 Quart",
      "Functions": "7-in-1",
      "Material": "Stainless Steel",
      "Safety": "10+ safety features"
    },
    rating: {
      average: 4.7,
      count: 892
    },
    tags: ["kitchen", "appliance", "cooking", "multi-use"],
    isActive: true
  },
  {
    name: "Yoga Mat Premium",
    description: "Non-slip yoga mat with excellent grip and cushioning for all types of yoga.",
    price: 49,
    category: "Sports",
    brand: "YogaLife",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506629905996-636ebe8f0bf8?w=400",
        alt: "Yoga Mat"
      }
    ],
    stock: 80,
    specifications: {
      "Material": "TPE",
      "Thickness": "6mm",
      "Size": "72\" x 24\"",
      "Weight": "2.2 lbs"
    },
    rating: {
      average: 4.2,
      count: 145
    },
    tags: ["yoga", "fitness", "exercise", "wellness"],
    isActive: true
  }
];

// Sample users including admin
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'admin123456',
    role: 'admin',
    phone: '+1234567890',
    address: {
      street: '123 Admin Street',
      city: 'Admin City',
      state: 'Admin State',
      zipCode: '12345',
      country: 'United States'
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        promotions: false,
        orderUpdates: true
      },
      categories: ['Electronics', 'Clothing', 'Home & Garden']
    }
  },
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1987654321',
    address: {
      street: '456 User Street',
      city: 'User City',
      state: 'User State',
      zipCode: '54321',
      country: 'United States'
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        promotions: true,
        orderUpdates: true
      },
      categories: ['Electronics', 'Sports']
    }
  }
];

// Function to create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@ecommerce.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Ensure the user has admin role
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user to admin role');
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password: 'admin123456',
        role: 'admin',
        phone: '+1234567890',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          zipCode: '12345',
          country: 'United States'
        },
        preferences: {
          currency: 'USD',
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            promotions: false,
            orderUpdates: true
          },
          categories: ['Electronics', 'Clothing', 'Home & Garden']
        }
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@ecommerce.com');
      console.log('Password: admin123456');
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB successfully');

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing products`);

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} sample products`);

    // Create admin user
    await createAdminUser();

    console.log('Database seeded successfully!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to MongoDB. Please ensure MongoDB is running on localhost:27017');
    }
    process.exit(1);
  }
};

seedProducts();
