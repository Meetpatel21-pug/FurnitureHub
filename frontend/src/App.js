import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import PaymentConfirmation from './pages/PaymentConfirmation';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import RoomAnalyzer from './pages/RoomAnalyzer';

import Contact from './pages/Contact';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import SellerDashboard from './pages/SellerDashboard';
import BecomeASeller from './pages/BecomeASeller';
import SellerLogin from './pages/SellerLogin';
import SellerRegister from './pages/SellerRegister';
import ChatBot from './components/ChatBot';
import './App.css';

// Separate component so we can use useLocation inside Router
function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin-panel')
    || location.pathname.startsWith('/seller-dashboard')
    || location.pathname.startsWith('/seller/login')
    || location.pathname.startsWith('/seller/register')
    || location.pathname.startsWith('/become-a-seller');

  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
      <ScrollToTop />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/room-ai" element={<RoomAnalyzer />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/become-a-seller" element={<BecomeASeller />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/register" element={<SellerRegister />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileBottomNav />}
      {!isAdminRoute && <ChatBot showAfterScroll={false} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;