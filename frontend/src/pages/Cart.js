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
      <div style={{paddingTop: '100px'}}>
        <section className="py-5 bg-light">
          <div className="container text-center">
            <div className="modern-product-card">
              <div className="product-content">
                <i className="fas fa-user-lock fa-3x text-primary mb-3"></i>
                <h2 className="product-title">Access Required</h2>
                <p className="text-muted">Please login to view your cart</p>
                <Link to="/login" className="btn btn-primary btn-lg px-5 py-3">
                  <i className="fas fa-sign-in-alt me-2"></i>Login
                </Link>
              </div>
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
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', paddingTop: '100px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading Cart...</h4>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5 bg-light">
          <div className="container text-center">
            <div className="modern-product-card">
              <div className="product-content">
                <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h2 className="product-title">Your Cart is Empty</h2>
                <p className="text-muted">Add some beautiful furniture to get started!</p>
                <Link to="/products" className="btn btn-dark btn-lg px-5 py-3">
                  <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '100px'}}>
      {/* Cart Header */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Shopping Cart</h2>
            <p className="text-muted">Review your items before checkout</p>
          </div>
          
          <div className="row g-4">
            {/* Cart Items */}
            <div className="col-lg-8">
              {cart.items.map(item => (
                <div key={item.id} className="card mb-2">
                  <div className="card-body py-2">
                    <div className="row align-items-center">
                      <div className="col-2">
                        <img
                          src={item.product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=60&fit=crop'}
                          alt={item.product.name}
                          className="img-fluid rounded"
                          style={{height: '50px', width: '70px', objectFit: 'cover'}}
                        />
                      </div>
                      <div className="col-4">
                        <h6 className="mb-0">{item.product.name}</h6>
                        <small className="text-muted">{item.product.category?.name}</small>
                      </div>
                      <div className="col-2">
                        <div className="input-group input-group-sm">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            style={{fontSize: '0.8rem'}}
                          />
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-2">
                        <h6 className="text-primary mb-0">₹{parseFloat(item.cost).toFixed(0)}</h6>
                      </div>
                      <div className="col-2">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="text-dark mb-4">Order Summary</h4>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-dark">Items ({cart.items?.length || 0}):</span>
                    <span className="text-dark">₹{parseFloat(cart.total_price || 0).toFixed(0)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-dark">Shipping:</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="d-flex justify-content-between mb-4">
                    <strong className="text-dark">Total:</strong>
                    <strong className="text-primary">₹{parseFloat(cart.total_price || 0).toFixed(0)}</strong>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Link to="/checkout" className="btn btn-dark w-100">
                      Proceed to Checkout
                    </Link>
                    <Link to="/products" className="btn btn-outline-dark w-100">
                      Continue Shopping
                    </Link>
                  </div>
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