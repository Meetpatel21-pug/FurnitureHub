import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => document.body.classList.remove('mobile-menu-open');
  }, [drawerOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <>
      {/* ── Top Main Navbar (Transparent) ── */}
      <nav
        className={`custom-navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar-container">

          {/* Left: Brand Logo + Main Header Nav Links */}
          <div className="d-flex align-items-center">
            <div
              className="navbar-logo"
              onClick={() => navigate('/')}
              role="link"
              tabIndex={0}
              aria-label="FurnitureHub home"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
            >
              <span className="logo-text">FurnitureHub</span>
            </div>

            {/* Main Links on Header (Visible on Desktop / Tablet) */}
            <div className="header-main-links d-none d-md-flex">
              <Link
                to="/"
                className={`header-nav-link ${isCurrentPath('/') ? 'active' : ''}`}
                id="header-nav-home"
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`header-nav-link ${isCurrentPath('/products') ? 'active' : ''}`}
                id="header-nav-products"
              >
                Products
              </Link>
              <Link
                to="/room-ai"
                className={`header-nav-link ${isCurrentPath('/room-ai') ? 'active' : ''}`}
                id="header-nav-room-ai"
              >
                Room AI
              </Link>
              <Link
                to="/about"
                className={`header-nav-link ${isCurrentPath('/about') ? 'active' : ''}`}
                id="header-nav-about"
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`header-nav-link ${isCurrentPath('/contact') ? 'active' : ''}`}
                id="header-nav-contact"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right: Search, Wishlist, Cart & Hamburger */}
          <div className="navbar-actions">

            {/* Desktop Search */}
            <div className="search-container d-none d-lg-flex" style={{ marginRight: '12px' }}>
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  aria-label="Search products"
                />
                <button type="submit" className="search-btn" aria-label="Submit search">
                  <i className="fas fa-search" />
                </button>
              </form>
            </div>

            {isAuthenticated && (
              <>
                <Link
                  to="/wishlist"
                  className="cart-link d-none d-md-flex"
                  aria-label="Wishlist"
                  id="wishlist-nav-link"
                >
                  <i className="far fa-heart" />
                </Link>

                <Link
                  to="/cart"
                  className="cart-link"
                  aria-label="Cart"
                  id="cart-nav-link"
                >
                  <i className="fas fa-shopping-bag" />
                  {getCartItemCount() > 0 && (
                    <span className="cart-badge">{getCartItemCount()}</span>
                  )}
                </Link>
              </>
            )}

            {/* Hamburger Button (Triggers Drawer) */}
            <button
              type="button"
              className="menu-icon"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              id="hamburger-btn"
              style={{ display: 'flex' }}
            >
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1099,
            cursor: 'pointer',
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Slide-in Drawer Menu (Only User/Account & Secondary Options) ── */}
      <div
        className={`navbar-menu ${drawerOpen ? 'mobile-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close Button */}
        <button
          className="close-icon"
          onClick={closeDrawer}
          aria-label="Close menu"
          id="close-drawer-btn"
        >
          <i className="fas fa-times" />
        </button>

        {/* Brand label */}
        <div style={{ marginBottom: '32px' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ink-light)',
            }}
          >
            ACCOUNT &amp; OPTIONS
          </span>
        </div>

        {/* Mobile-only Navigation Links if screen is small */}
        <div className="d-md-none mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--ink-light)',
              marginBottom: '12px',
            }}
          >
            NAVIGATION
          </div>
          <Link to="/" className="nav-link" onClick={closeDrawer} id="drawer-nav-home">
            Home
          </Link>
          <Link to="/products" className="nav-link" onClick={closeDrawer} id="drawer-nav-products">
            Products
          </Link>
          <Link to="/room-ai" className="nav-link" onClick={closeDrawer} id="drawer-nav-room-ai">
            Room AI
          </Link>
          <Link to="/about" className="nav-link" onClick={closeDrawer} id="drawer-nav-about">
            About
          </Link>
          <Link to="/contact" className="nav-link" onClick={closeDrawer} id="drawer-nav-contact">
            Contact
          </Link>
        </div>

        {/* Account Links */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--ink-light)',
            marginBottom: '12px',
          }}
        >
          MY ACCOUNT
        </div>

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="nav-link" onClick={closeDrawer} id="drawer-nav-profile">
              Profile
            </Link>
            <Link to="/orders" className="nav-link" onClick={closeDrawer} id="drawer-nav-orders">
              My Orders
            </Link>
            <Link to="/wishlist" className="nav-link" onClick={closeDrawer} id="drawer-nav-wishlist">
              Wishlist
            </Link>
            {user?.is_staff && (
              <Link to="/dashboard" className="nav-link admin-link" onClick={closeDrawer} id="drawer-nav-dashboard">
                Dashboard
              </Link>
            )}
          </>
        ) : (
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '13px', color: 'var(--ink-light)', marginBottom: '16px' }}>
              Sign in to manage your orders, wishlist, and profile.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn-outline-primary" onClick={closeDrawer} id="drawer-login">
                Login
              </Link>
              <Link to="/register" className="btn-primary" onClick={closeDrawer} id="drawer-register">
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Drawer Bottom Section: Search & Logout */}
        <div
          style={{
            marginTop: '36px',
            borderTop: '1px solid var(--border)',
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Drawer Search */}
          <form
            onSubmit={(e) => {
              handleSearch(e);
              closeDrawer();
            }}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <input
              type="search"
              placeholder="Search furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                outline: 'none',
              }}
              id="drawer-search-input"
            />
            <button
              type="submit"
              style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: '4px' }}
              aria-label="Search"
            >
              <i className="fas fa-search" />
            </button>
          </form>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              id="drawer-logout-btn"
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                cursor: 'pointer',
                padding: '10px 20px',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                alignSelf: 'flex-start',
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;