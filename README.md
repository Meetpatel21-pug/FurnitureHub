# FurnitureZone - React + Django REST API

A modern furniture e-commerce website built with React frontend and Django REST API backend.

## 🚀 Features

### Frontend (React)
- **Modern UI/UX** - Built with React, Bootstrap 5, and responsive design
- **Authentication** - JWT-based login/register system
- **Product Browsing** - Category filtering, search, and pagination
- **Shopping Cart** - Add/remove items, quantity management
- **Wishlist** - Save favorite products
- **Order Management** - Checkout process and order history
- **User Profile** - Profile management and analytics dashboard
- **Real-time Updates** - Context-based state management

### Backend (Django REST API)
- **RESTful API** - Complete REST API with Django REST Framework
- **JWT Authentication** - Secure token-based authentication
- **CORS Support** - Cross-origin resource sharing for React frontend
- **Database Models** - User profiles, products, cart, orders, reviews
- **Admin Interface** - Django admin for content management
- **API Documentation** - Well-structured API endpoints

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios (API calls)
- Bootstrap 5
- React Bootstrap
- React Toastify
- Font Awesome

### Backend
- Django 4.2
- Django REST Framework
- Django CORS Headers
- JWT Authentication
- SQLite Database
- Pillow (Image handling)

## 📦 Installation & Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\\Scripts\\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Populate sample data**
   ```bash
   python populate_data.py
   ```

7. **Start Django server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start React development server**
   ```bash
   npm start
   ```

## 🌐 Access Points

- **React Frontend**: http://localhost:3000
- **Django API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh

### Products
- `GET /api/categories/` - List categories
- `GET /api/products/` - List products (with filtering)
- `GET /api/products/{slug}/` - Product details

### Cart
- `GET /api/cart/` - Get user cart
- `POST /api/cart/add/{id}/` - Add to cart
- `PUT /api/cart/update/{id}/` - Update cart item
- `DELETE /api/cart/remove/{id}/` - Remove from cart

### Wishlist
- `GET /api/wishlist/` - Get wishlist
- `POST /api/wishlist/add/{id}/` - Add to wishlist
- `DELETE /api/wishlist/remove/{id}/` - Remove from wishlist

### Orders
- `POST /api/checkout/` - Place order
- `GET /api/orders/` - Order history
- `GET /api/orders/{id}/` - Order details

### User
- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update profile
- `GET /api/analytics/` - User analytics

## 🎯 Key Features Implemented

### Authentication & Authorization
- JWT token-based authentication
- Protected routes and API endpoints
- User registration and login
- Automatic token refresh

### Product Management
- Category-based product organization
- Product search and filtering
- Product details with reviews
- Stock management

### Shopping Experience
- Shopping cart with quantity management
- Wishlist functionality
- Secure checkout process
- Order tracking and history

### User Experience
- Responsive design for all devices
- Real-time notifications
- Loading states and error handling
- Intuitive navigation

### Analytics Dashboard
- Purchase history analysis
- Spending statistics
- Member tier system
- Recent orders overview

### AI Room Recommendation Design
- Room-image upload flow for detecting furniture and classifying room type
- CNN and YOLO-based vision pipeline for room understanding
- Recommendation layer that ranks products from the furniture database
- Visual preview support for detected furniture and suggested items
- Design spec: [docs/ai-room-recommendation.md](docs/ai-room-recommendation.md)

## 🔧 Customization

### Adding New Features
1. **Backend**: Add new models, serializers, and views
2. **Frontend**: Create new components and pages
3. **API**: Update URL patterns and add endpoints

### Styling
- Modify `src/App.css` for custom styles
- Update Bootstrap classes in components
- Add new CSS variables for theming

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Backend Deployment
1. Configure production settings
2. Set up PostgreSQL database
3. Configure static files serving
4. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build production version: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**FurnitureZone** - Modern furniture shopping experience with React and Django! 🏠✨