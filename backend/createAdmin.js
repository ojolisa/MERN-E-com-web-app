/**
 * Simple script to create an admin user
 * Run this script with: node createAdmin.js
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to database');

    // Admin credentials - Change these as needed
    const adminEmail = 'admin@ecommerce.com';
    const adminPassword = 'admin123456';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      // Make sure user is admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated user role to admin');
      }
    } else {
      // Create new admin
      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔐 Password: ${adminPassword}`);
      console.log(`👤 Name: ${adminName}`);
      console.log(`🛡️ Role: admin`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

createAdmin();
