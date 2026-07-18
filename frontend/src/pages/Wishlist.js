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
      <div style={{paddingTop: '100px'}}>
        <div className="container py-5 text-center">
          <h2>Please login to view your wishlist</h2>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{paddingTop: '100px'}}>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div style={{paddingTop: '100px'}}>
        <div className="container py-5 text-center">
          <i className="fas fa-heart fa-3x text-muted mb-3"></i>
          <h2>Your wishlist is empty</h2>
          <p className="text-muted">Save items you love for later!</p>
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '100px'}}>
      <div className="container py-5">
        <h2 className="mb-4">My Wishlist</h2>
        <div className="row g-4">
          {wishlistItems.map(item => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <Link to={`/products/${item.product.slug}`}>
                  <img
                    src={item.product.image_url || '/api/placeholder/300/250'}
                    className="card-img-top"
                    alt={item.product.name}
                    style={{ height: '250px', objectFit: 'cover' }}
                  />
                </Link>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">
                    <Link to={`/products/${item.product.slug}`} className="text-decoration-none text-dark">
                      {item.product.name}
                    </Link>
                  </h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {item.product.description.substring(0, 100)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-primary mb-0">₹{parseFloat(item.product.price).toFixed(0)}</h5>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <small className="text-muted mt-2">
                    Added on {new Date(item.added_at).toLocaleDateString()}
                  </small>
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