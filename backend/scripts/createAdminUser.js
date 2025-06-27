const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Script to create an admin user in the database
 * Usage: node scripts/createAdminUser.js
 * 
 * You can customize the admin user details below
 */

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Admin user details - customize these as needed
    const adminData = {
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123456', // This will be hashed automatically by the User model
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
    };

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log(`Admin user with email ${adminData.email} already exists!`);
      console.log(`User ID: ${existingAdmin._id}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      // Update existing user to admin role if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user role to admin');
      }
    } else {
      // Create new admin user
      const adminUser = new User(adminData);
      await adminUser.save();
      
      console.log('Admin user created successfully!');
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${adminData.password}`);
      console.log(`User ID: ${adminUser._id}`);
      console.log(`Role: ${adminUser.role}`);
    }

  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Function to create admin user with custom details
const createCustomAdminUser = async (name, email, password) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`Updated existing user ${email} to admin role`);
      } else {
        console.log(`User ${email} is already an admin`);
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        name,
        email,
        password,
        role: 'admin',
        preferences: {
          currency: 'USD',
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            promotions: false,
            orderUpdates: true
          }
        }
      });
      
      await adminUser.save();
      console.log(`Admin user created: ${email}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
};

// Export functions for use in other scripts
module.exports = { createAdminUser, createCustomAdminUser };

// If this script is run directly
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 3) {
    const [name, email, password] = args;
    createCustomAdminUser(name, email, password);
  } else if (args.length === 0) {
    createAdminUser();
  } else {
    console.log('Usage:');
    console.log('  node scripts/createAdminUser.js');
    console.log('  node scripts/createAdminUser.js "Admin Name" "admin@email.com" "password123"');
  }
}
