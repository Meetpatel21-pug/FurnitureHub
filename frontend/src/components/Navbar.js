import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => document.body.classList.remove('mobile-menu-open');
  }, [mobileMenuOpen]);

  // Handle scroll event to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`custom-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => window.location.href = '/'}>
          <i className="fas fa-couch me-2"></i>
          <span className="logo-text">FurnitureZone</span>
        </div>

        <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <i className="fas fa-times close-icon d-md-none" onClick={closeMobileMenu}></i>

          <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
          <Link to="/products" className="nav-link" onClick={closeMobileMenu}>Products</Link>
          <Link to="/room-ai" className="nav-link" onClick={closeMobileMenu}>Room AI</Link>
          <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About</Link>
          <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>

          {isAuthenticated && (
            <>
              {user?.is_staff && (
                <Link to="/dashboard" className="nav-link admin-link" onClick={closeMobileMenu}>
                  <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                </Link>
              )}
            </>
          )}

          {/* Mobile Search */}
          <div className="d-md-none mt-3">
            <form onSubmit={handleSearch} className="d-flex">
              <input
                type="search"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control me-2"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
              <button type="submit" className="btn btn-outline-light">
                <i className="fas fa-search"></i>
              </button>
            </form>
          </div>

          <div className="d-md-none mt-3 w-100">
            <button type="button" className="theme-toggle-btn w-100" onClick={toggleTheme} aria-label="Toggle theme">
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} me-2`}></i>
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </button>
          </div>

          <div className="mobile-auth-section d-md-none">
            {!isAuthenticated && (
              <div className="auth-buttons">
                <Link to="/login" className="btn auth-login-button" onClick={closeMobileMenu}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-actions">
          <div className="search-container d-none d-lg-flex">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="search"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>
          </div>

          {isAuthenticated ? (
            <>
              <button type="button" className="theme-toggle-btn d-none d-md-flex" onClick={toggleTheme} aria-label="Toggle theme">
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>

              <Link to="/wishlist" className="cart-link position-relative d-none d-md-flex me-2" aria-label="Wishlist">
                <i className="fas fa-heart"></i>
              </Link>

              <Link to="/cart" className="cart-link position-relative d-none d-md-flex" aria-label="Cart">
                <i className="fas fa-shopping-cart"></i>
                {getCartItemCount() > 0 && (
                  <span className="cart-badge">{getCartItemCount()}</span>
                )}
              </Link>

              <div className="user-menu dropdown d-none d-md-block">
                <button className="user-button" data-bs-toggle="dropdown">
                  <i className="fas fa-user"></i>
                  <span className="d-none d-lg-inline ms-1">{user?.first_name || user?.username}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                  {user?.is_staff && (
                    <li><Link className="dropdown-item" to="/dashboard">Dashboard</Link></li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            </>
          ) : (
            <div className="auth-buttons d-none d-lg-flex">
              <button type="button" className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              <Link to="/login" className="btn auth-login-button btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <i className="fas fa-bars menu-icon d-md-none" onClick={() => setMobileMenuOpen(true)}></i>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
