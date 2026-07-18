import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const { isAuthenticated, user } = useAuth();
  const { getCartItemCount } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="mobile-bottom-nav d-md-none">
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>
      
      <Link to="/products" className={`nav-item ${isActive('/products') ? 'active' : ''}`}>
        <i className="fas fa-th-large"></i>
        <span>Products</span>
      </Link>
      
      {isAuthenticated && (
        <Link to="/cart" className={`nav-item ${isActive('/cart') ? 'active' : ''}`}>
          <div className="position-relative">
            <i className="fas fa-shopping-cart"></i>
            {getCartItemCount() > 0 && (
              <span className="mobile-cart-badge">{getCartItemCount()}</span>
            )}
          </div>
          <span>Cart</span>
        </Link>
      )}
      
      {isAuthenticated ? (
        <>
          <Link to="/wishlist" className={`nav-item ${isActive('/wishlist') ? 'active' : ''}`}>
            <i className="fas fa-heart"></i>
            <span>Wishlist</span>
          </Link>
          
          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>
        </>
      ) : (
        <Link to="/login" className={`nav-item ${isActive('/login') ? 'active' : ''}`}>
          <i className="fas fa-sign-in-alt"></i>
          <span>Login</span>
        </Link>
      )}
    </div>
  );
};

export default MobileBottomNav;