import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../services/api';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlistItems(items => items.filter(item => item.product.id !== productId));
      toast.success('Item removed from wishlist!');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
        <div className="container py-5 text-center">
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
            <i className="fas fa-heart fa-3x mb-4" style={{ color: 'var(--ink)' }}></i>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, marginBottom: '16px' }}>Access Required</h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '32px' }}>Please login to view your wishlist</p>
            <Link 
              to="/login" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 32px',
                background: 'var(--ink)',
                color: 'var(--bg-base)',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink-muted)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ink)'; }}
            >
              <i className="fas fa-sign-in-alt me-2"></i>Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--ink)' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, letterSpacing: '0.1em' }}>LOADING WISHLIST...</h4>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
        <div className="container py-5 text-center">
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
            <i className="far fa-heart fa-3x mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}></i>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, marginBottom: '16px' }}>Your Wishlist is Empty</h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '32px' }}>Save items you love for later.</p>
            <Link 
              to="/products" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 32px',
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--ink)',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--bg-base)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink)'; }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
      <div className="container py-5" style={{ maxWidth: '1200px' }}>
        <div className="mb-5">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', display: 'block', marginBottom: '8px' }}>
            SAVED ITEMS
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: 0 }}>
            My Wishlist
          </h2>
        </div>
        
        <div className="row g-4">
          {wishlistItems.map(item => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div style={{ background: 'transparent', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'border-color 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <Link to={`/products/${item.product.slug}`} style={{ display: 'block', overflow: 'hidden' }}>
                  <img
                    src={item.product.image || item.product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop'}
                    alt={item.product.name}
                    style={{ 
                      width: '100%', 
                      height: '280px', 
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </Link>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: 400 }}>
                    <Link to={`/products/${item.product.slug}`} style={{ color: 'var(--ink)', textDecoration: 'none', transition: 'opacity 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      {item.product.name}
                    </Link>
                  </h5>
                  <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', flexGrow: 1, marginBottom: '20px', lineHeight: 1.6 }}>
                    {item.product.description.substring(0, 100)}...
                  </p>
                  
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, fontWeight: 500 }}>₹{parseFloat(item.product.price).toFixed(0)}</h5>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid var(--border)', 
                        color: 'var(--ink)', 
                        width: '40px', 
                        height: '40px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink)'; }}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>
                    Added on {new Date(item.added_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;