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

// Run the script
createAdminUser().catch(err => {
  console.error('Script execution error:', err.message);
});