# E-Commerce Full Stack Application

A modern, full-stack e-commerce application built with React.js frontend and Node.js/Express backend, featuring user authentication, product management, shopping cart functionality, and admin dashboard.

## 🚀 Features

### User Features

- **User Authentication**: Sign up, login, and logout functionality
- **Product Browsing**: View products with detailed information
- **Search & Filter**: Search for products with advanced filtering
- **Shopping Cart**: Add, remove, and manage items in cart
- **Checkout Process**: Secure checkout with order confirmation
- **User Profile**: Manage personal information and settings
- **Order History**: View past orders and order status

### Admin Features

- **Admin Dashboard**: Comprehensive overview with analytics
- **Product Management**: Create, read, update, and delete products
- **User Management**: View and manage user accounts
- **Order Management**: Monitor and process customer orders
- **Analytics**: View sales data and performance metrics

## 🛠️ Tech Stack

### Frontend

- **React.js** (v19.1.0) - UI library
- **React Router DOM** (v7.6.3) - Client-side routing
- **Vite** (v7.0.0) - Build tool and development server
- **CSS3** - Styling

### Backend

- **Node.js** - Runtime environment
- **Express.js** (v5.1.0) - Web framework
- **MongoDB** - Database
- **Mongoose** (v8.16.1) - MongoDB object modeling

### Security & Middleware

- **JWT** (jsonwebtoken) - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

## 📁 Project Structure

```
ecomm/
├── package.json              # Root package.json with scripts
├── README.md                 # Project documentation
├── backend/                  # Backend application
│   ├── package.json         # Backend dependencies
│   ├── server.js            # Main server file
│   ├── seed.js              # Database seeding script
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   │   └── auth.js          # Authentication middleware
│   ├── models/              # Database models
│   │   ├── User.js          # User model
│   │   ├── Product.js       # Product model
│   │   └── Order.js         # Order model
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── products.js      # Product routes
│   │   └── orders.js        # Order routes
│   └── scripts/             # Utility scripts
│       └── createAdminUser.js
└── frontend/                # Frontend application
    ├── package.json         # Frontend dependencies
    ├── index.html           # HTML entry point
    ├── vite.config.js       # Vite configuration
    ├── eslint.config.js     # ESLint configuration
    ├── public/              # Static assets
    │   └── favicon.svg
    └── src/                 # Source code
        ├── App.jsx          # Main App component
        ├── main.jsx         # Entry point
        ├── App.css          # Global styles
        ├── index.css        # Base styles
        ├── components/      # React components
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── Home.jsx
        │   ├── Auth.jsx
        │   ├── Products.jsx
        │   ├── Cart.jsx
        │   ├── Checkout.jsx
        │   ├── AdminDashboard.jsx
        │   └── ... (other components)
        ├── contexts/        # React contexts
        │   └── CartContext.jsx
        └── services/        # API services
            └── api.js
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecomm
   ```

2. **Install dependencies for all packages**

   ```bash
   npm run install-deps
   ```

3. **Environment Setup**

   Create a `.env` file in the `backend` directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start MongoDB**

   Make sure MongoDB is running on your system:

   ```bash
   # For local MongoDB installation
   mongod
   ```

5. **Seed the database (optional)**

   ```bash
   cd backend
   npm run seed
   ```

6. **Create an admin user (optional)**
   ```bash
   cd backend
   npm run create-admin-script
   ```

### Running the Application

#### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

#### Production Mode

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Start the backend server:
   ```bash
   npm start
   ```

### Individual Services

#### Backend Only

```bash
npm run server
# or
cd backend && npm run dev
```

#### Frontend Only

```bash
npm run client
# or
cd frontend && npm run dev
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Product Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Order Endpoints

- `GET /api/orders` - Get user orders (protected)
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/:id` - Get order by ID (protected)

## 🔧 Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend in development mode
- `npm run install-deps` - Install dependencies for all packages
- `npm run build` - Build frontend for production
- `npm start` - Start backend in production mode

### Backend Scripts

- `npm run dev` - Start backend with nodemon (auto-restart)
- `npm start` - Start backend in production mode
- `npm run seed` - Seed database with sample data
- `npm run create-admin-script` - Create admin user

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- Tokens are stored in localStorage
- Protected routes require valid JWT token
- Admin routes require admin role verification

## 🎨 Styling

The application uses vanilla CSS with:

- Responsive design principles
- Modern UI/UX patterns
- Component-specific stylesheets
- CSS custom properties for theming

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder

### Backend (Heroku/Railway/DigitalOcean)

1. Set environment variables
2. Deploy the `backend` directory
3. Ensure MongoDB connection is configured

### Environment Variables for Production

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- Ensure MongoDB is running before starting the backend
- Check CORS configuration for production deployment
- Verify JWT secret is properly set in production

## 📞 Support

For support, please open an issue in the repository or contact the development team.

## 🔄 Version History

- **v1.0.0** - Initial release with core e-commerce functionality
  - User authentication and authorization
  - Product catalog and management
  - Shopping cart and checkout
  - Admin dashboard and management tools
  - Order processing and history

---

**Happy Shopping! 🛒**
