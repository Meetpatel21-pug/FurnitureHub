import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cart, updateCartItem, removeFromCart, loading } = useCart();

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
        <section className="py-5">
          <div className="container text-center">
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
              <i className="fas fa-user-lock fa-3x mb-4" style={{ color: 'var(--ink)' }}></i>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, marginBottom: '16px' }}>Access Required</h2>
              <p style={{ color: 'var(--ink-muted)', marginBottom: '32px' }}>Please login to view your cart</p>
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
        </section>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    const result = await updateCartItem(itemId, newQuantity);
    if (result.success) {
      toast.success('Cart updated!');
    } else {
      toast.error(result.error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Item removed from cart!');
    } else {
      toast.error(result.error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', paddingTop: '100px', background: 'var(--bg-base)', color: 'var(--ink)' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--ink)' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, letterSpacing: '0.1em' }}>LOADING CART...</h4>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
        <section className="py-5">
          <div className="container text-center">
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
              <i className="fas fa-shopping-cart fa-3x mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}></i>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, marginBottom: '16px' }}>Your Cart is Empty</h2>
              <p style={{ color: 'var(--ink-muted)', marginBottom: '32px' }}>Add some beautiful furniture to get started.</p>
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
                <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* Cart Header */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className="mb-5">
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', display: 'block', marginBottom: '8px' }}>
              YOUR SELECTIONS
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: 0 }}>
              Shopping Cart
            </h2>
          </div>
          
          <div className="row g-5">
            {/* Cart Items */}
            <div className="col-lg-8">
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {cart.items.map(item => (
                  <div key={item.id} style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
                    <div className="row align-items-center">
                      <div className="col-3 col-sm-2">
                        <img
                          src={item.product.image || item.product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=160&h=160&fit=crop'}
                          alt={item.product.name}
                          style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', background: 'var(--bg-surface)' }}
                        />
                      </div>
                      <div className="col-9 col-sm-4 mb-3 mb-sm-0">
                        <h6 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 400 }}>{item.product.name}</h6>
                        <small style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
                          {(typeof item.product.category === 'object' && item.product.category !== null ? item.product.category.name : item.product.category) || 'Furniture'}
                        </small>
                      </div>
                      <div className="col-6 col-sm-3">
                        <div style={{ display: 'flex', border: '1px solid var(--border)', width: 'fit-content' }}>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{ background: 'transparent', border: 'none', color: 'var(--ink)', padding: '6px 12px', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: item.quantity <= 1 ? 0.5 : 1 }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            style={{ width: '40px', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--ink)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', outline: 'none' }}
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--ink)', padding: '6px 12px', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-3 col-sm-2 text-end">
                        <h6 style={{ margin: 0, fontWeight: 500 }}>₹{parseFloat(item.cost).toFixed(0)}</h6>
                      </div>
                      <div className="col-3 col-sm-1 text-end">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ff4444'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '32px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '24px', letterSpacing: '0.02em' }}>Order Summary</h4>
                
                <div className="d-flex justify-content-between mb-3" style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
                  <span>Subtotal ({cart.items?.length || 0} items)</span>
                  <span>₹{parseFloat(cart.total_price || 0).toFixed(0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)', color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
                  <span>Shipping</span>
                  <span style={{ color: 'var(--ink)' }}>Complimentary</span>
                </div>
                <div className="d-flex justify-content-between mb-5">
                  <strong style={{ fontSize: '1.2rem', fontWeight: 500 }}>Total</strong>
                  <strong style={{ fontSize: '1.2rem', fontWeight: 500 }}>₹{parseFloat(cart.total_price || 0).toFixed(0)}</strong>
                </div>
                
                <div className="d-grid gap-3">
                  <Link 
                    to="/checkout" 
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '14px 24px',
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
                    Proceed to Checkout
                  </Link>
                  <Link 
                    to="/products" 
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '14px 24px',
                      background: 'transparent',
                      color: 'var(--ink)',
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cart;