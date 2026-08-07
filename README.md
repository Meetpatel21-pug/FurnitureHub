# FurnitureZone — Multi-Vendor Marketplace & AI Room Designer

A luxury online furniture marketplace and interior design platform built with **React** frontend and **Django REST Framework** backend.

---

## 🚀 Features

### 🏬 Multi-Vendor Marketplace
- **Seller Onboarding (`/become-a-seller`)**: Local vendors and furniture manufacturers can register their store application.
- **Admin Approval**: Admins review and approve/reject seller applications via the Admin Panel.
- **Seller Dashboard (`/seller-dashboard`)**: Dedicated management interface for approved sellers featuring:
  - **Overview**: Real-time sales KPIs, total revenue, and pending order tracking.
  - **My Products**: Add, edit, or remove store products with support for **3D `.glb` model uploads**.
  - **My Orders**: Track customer orders containing vendor products and monitor item-level revenue.
  - **Analytics**: Revenue trends (Chart.js bar charts) and order breakdown.
  - **Store Profile**: Manage store description, logo, phone, and business address.

### 👑 Comprehensive Admin Panel (`/admin-panel`)
- **7 Management Modules**:
  1. **Overview**: Key platform KPIs (revenue, orders, low-stock items, active users).
  2. **Analytics**: Revenue trends and category distribution charts.
  3. **Products**: Complete product CRUD with **3D `.glb` model upload support**.
  4. **Orders**: Manage status (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`) and payment states.
  5. **Users**: User account management, creation, banning, and deletion.
  6. **Wishlists**: Overview of customer wishlist items.
  7. **Vendors**: Approve, reject, or reset vendor registration applications.
- **Dedicated Admin Login**: Isolated login flow with staff permission enforcement.

### 🛋️ Customer Experience
- **Luxury Eastern Edition Dark Theme**: Deep `#000000` background with elevated `#121212` cards and high-contrast typography.
- **3D & AR Viewer**: Interactive 360° 3D preview using Three.js / `.glb` models.
- **AI Room Designer**: Upload room photos for automated furniture recommendation and layout analysis.
- **FurniBot AI Assistant**: AI-powered chatbot for furniture advice and store inquiries.
- **PDF Invoice Generation**: Download official PDF order invoices for confirmed purchases.
- **OTP Password Reset**: Email OTP verification flow for password recovery.
- **Cart & Wishlist**: Real-time cart management, free shipping calculation, and wishlist saving.
- **Customer Reviews**: Star ratings, breakdown progress bars, and verified review submissions.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI framework
- **React Router DOM v6** — Single page application routing
- **Chart.js & react-chartjs-2** — Analytics charts and data visualization
- **Axios** — HTTP client with JWT interceptors
- **FontAwesome** — Vector icons across UI (no emojis)
- **Bootstrap 5 & Custom CSS** — Responsive dark luxury design system
- **React Toastify** — Real-time user notifications

### Backend
- **Django 4.2 & Django REST Framework** — RESTful API architecture
- **Simple JWT** — Token-based authentication & automatic refresh
- **ReportLab** — Dynamic PDF invoice generation
- **Pillow** — Image processing
- **SQLite / PostgreSQL** — Database engine

---

## 📦 Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser / admin account
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

---

## 🌐 Access Points

| Route / Service | Path | Description |
|---|---|---|
| **Storefront** | `http://localhost:3000/` | Public catalog, cart, wishlist, & room AI |
| **Seller Registration** | `http://localhost:3000/become-a-seller` | Vendor onboarding application |
| **Seller Dashboard** | `http://localhost:3000/seller-dashboard` | Seller management interface |
| **Admin Panel** | `http://localhost:3000/admin-panel` | Platform admin dashboard |
| **Django API Base** | `http://localhost:8000/api/` | REST API endpoints |
| **Django Admin** | `http://localhost:8000/admin/` | Native Django admin |

---

## 📋 API Endpoints Summary

### 🔑 Authentication & Profile
- `POST /api/auth/register/` — Register new user
- `POST /api/auth/login/` — Login & receive JWT tokens
- `POST /api/auth/forgot-password/` — Request password reset OTP
- `POST /api/auth/verify-otp/` — Verify OTP code
- `POST /api/auth/reset-password/` — Set new password
- `GET /api/profile/` — Fetch current user profile

### 🏪 Vendor / Multi-Seller
- `POST /api/vendor/register/` — Apply for seller account
- `GET /api/vendor/profile/` — Get seller profile
- `PUT /api/vendor/profile/` — Update seller profile
- `GET /api/vendor/products/` — List seller's products
- `POST /api/vendor/products/create/` — Create product (supports `.glb` upload)
- `PUT /api/vendor/products/<id>/update/` — Update seller's product
- `DELETE /api/vendor/products/<id>/delete/` — Delete seller's product
- `GET /api/vendor/orders/` — Orders containing seller's products
- `GET /api/vendor/stats/` — Seller revenue and order statistics

### 👑 Admin Management
- `GET /api/admin/vendors/` — List all vendor applications
- `PUT /api/admin/vendors/<id>/approve/` — Approve / reject vendor
- `GET /api/admin/products/` — Admin product list
- `POST /api/admin/products/create/` — Admin product creation
- `PUT /api/admin/products/<id>/update/` — Admin product update
- `DELETE /api/admin/products/<id>/delete/` — Admin product deletion
- `GET /api/admin/orders/` — Admin order list
- `PUT /api/admin/orders/<id>/status/` — Update order & payment status
- `GET /api/admin/users/` — Admin user management

### 🛍️ Products, Cart, & Orders
- `GET /api/categories/` — List product categories
- `GET /api/products/` — Product catalog (filtering & search)
- `GET /api/products/<slug>/` — Detailed product view
- `GET /api/cart/` — Get user cart
- `POST /api/cart/add/<id>/` — Add product to cart
- `POST /api/checkout/` — Place order
- `GET /api/orders/<id>/invoice/` — Download order PDF invoice

---

## 📄 License

This project is licensed under the **MIT License**.