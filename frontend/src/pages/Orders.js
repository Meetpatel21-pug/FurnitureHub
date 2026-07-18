import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import PaginationControls from '../components/PaginationControls';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getHistory();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await ordersAPI.cancelOrder(orderId);
        // Refresh orders after cancellation
        fetchOrders();
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.response?.data?.error || 'Failed to cancel order');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-info text-white',
      shipped: 'bg-primary text-white',
      delivered: 'bg-success text-white',
      cancelled: 'bg-danger text-white'
    };
    return `badge ${statusClasses[status] || 'bg-secondary text-white'}`;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: 'fas fa-clock',
      confirmed: 'fas fa-check-circle',
      shipped: 'fas fa-shipping-fast',
      delivered: 'fas fa-box-open',
      cancelled: 'fas fa-times-circle'
    };
    return statusIcons[status] || 'fas fa-box';
  };

  if (!isAuthenticated) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5">
          <div className="container text-center">
            <div className="modern-product-card">
              <div className="product-content">
                <i className="fas fa-user-lock fa-3x text-primary mb-3"></i>
                <h2 className="product-title">Access Required</h2>
                <p className="text-muted">Please login to view your orders</p>
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', paddingTop: '100px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading Orders...</h4>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5">
          <div className="container text-center">
            <div className="modern-product-card">
              <div className="product-content">
                <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                <h2 className="product-title">No Orders Yet</h2>
                <p className="text-muted">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                <Link to="/products" className="btn btn-primary btn-lg px-5 py-3">
                  <i className="fas fa-shopping-cart me-2"></i>Start Shopping
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
      {/* Orders Header */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="fw-bold text-white">Order History</h1>
            <p className="text-muted">Track and manage your orders</p>
          </div>
          
          <div className="row g-4">
            {orders
              .slice(
                (currentPage - 1) * ordersPerPage,
                currentPage * ordersPerPage
              )
              .map(order => (
              <div key={order.id} className="col-12">
                <div className="modern-product-card">
                  <div className="product-content">
                    {/* Order Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                      <div>
                        <h4 className="product-title mb-1 text-dark">Order #{order.order_id}</h4>
                        <div className="product-category">
                          <i className="fas fa-calendar me-2"></i>
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className={getStatusBadge(order.status)} style={{fontSize: '0.9rem', padding: '8px 16px'}}>
                          <i className={`${getStatusIcon(order.status)} me-2`}></i>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      {/* Order Items */}
                      <div className="col-lg-8">
                        <h5 className="text-dark mb-3">
                          <i className="fas fa-box me-2"></i>Items Ordered
                        </h5>
                        <div className="order-items">
                          {order.items?.map(item => (
                            <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                              <div className="d-flex align-items-center">
                                <div className="bg-light rounded p-2 me-3">
                                  <i className="fas fa-cube text-primary"></i>
                                </div>
                                <div>
                                  <h6 className="mb-0 text-dark">{item.product?.name || 'Product'}</h6>
                                  <small className="text-dark">Quantity: {item.quantity}</small>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold">₹{parseFloat(item.cost || item.price || 0).toFixed(0)}</div>
                              </div>
                            </div>
                          )) || (
                            <div className="text-dark">No items found</div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="col-lg-4">
                        <div className="bg-light rounded p-3">
                          <h5 className="text-dark mb-3">
                            <i className="fas fa-receipt me-2"></i>Order Summary
                          </h5>
                          
                          {order.shipping_address && (
                            <div className="mb-3">
                              <h6 className="text-dark mb-2">
                                <i className="fas fa-map-marker-alt me-2"></i>Shipping Address
                              </h6>
                              <p className="text-dark small mb-0">{order.shipping_address}</p>
                            </div>
                          )}
                          
                          <div className="border-top pt-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="text-dark mb-0">Total Amount:</h5>
                              <h4 className="text-success fw-bold mb-0">
                                ₹{parseFloat(order.total_amount).toFixed(0)}
                              </h4>
                            </div>
                            <button 
                              className="btn btn-danger w-100" 
                              onClick={() => handleCancelOrder(order.order_id)}
                              disabled={order.status === 'cancelled' || order.status === 'delivered' || order.status === 'shipped'}
                            >
                              <i className="fas fa-times-circle me-2"></i>
                              Cancel Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {orders.length > ordersPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <PaginationControls
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalItems={orders.length}
                itemsPerPage={ordersPerPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Orders;