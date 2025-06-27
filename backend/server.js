const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
.then(() => {
  console.log('MongoDB connected successfully');
  console.log('Database name:', mongoose.connection.name);
})
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('Could not connect to MongoDB. Please ensure MongoDB is running on localhost:27017');
    console.log('Server will continue running with mock data fallback');
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce Backend API is running!' });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:');
  console.error('URL:', req.url);
  console.error('Method:', req.method);
  console.error('Error stack:', err.stack);
  console.error('Error message:', err.message);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
