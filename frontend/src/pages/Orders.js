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
        fetchOrders();
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.response?.data?.error || 'Failed to cancel order');
      }
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await ordersAPI.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download invoice');
    }
  };

  const statusColorMap = {
    pending: '#facc15',
    confirmed: '#60a5fa',
    shipped: '#a78bfa',
    delivered: '#4ade80',
    cancelled: '#f87171'
  };

  const getStatusBadgeStyle = (status) => {
    const color = statusColorMap[status] || '#ffffff';
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      background: color + '20',
      color: color,
      border: `1px solid ${color}40`,
      textTransform: 'capitalize'
    };
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
      <div style={{ paddingTop: '100px', background: '#000', minHeight: '100vh' }}>
        <section className="py-5">
          <div className="container text-center">
            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '48px 24px', maxWidth: '440px', margin: '0 auto' }}>
              <i className="fas fa-user-lock fa-3x mb-3" style={{ color: '#60a5fa' }}></i>
              <h2 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '8px' }}>Access Required</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>Please login to view your orders</p>
              <Link to="/login" className="btn btn-light px-4 py-2" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px' }}>
                <i className="fas fa-sign-in-alt me-2"></i>Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: '#000', paddingTop: '100px' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, letterSpacing: '0.05em' }}>Loading Orders...</h4>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ paddingTop: '100px', background: '#000', minHeight: '100vh' }}>
        <section className="py-5">
          <div className="container text-center">
            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '48px 24px', maxWidth: '480px', margin: '0 auto' }}>
              <i className="fas fa-shopping-bag fa-3x mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}></i>
              <h2 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '8px' }}>No Orders Yet</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <Link to="/products" className="btn btn-light px-4 py-2" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px' }}>
                <i className="fas fa-shopping-cart me-2"></i>Start Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', background: '#000000', minHeight: '100vh' }}>
      {/* Orders Header */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="text-center mb-5">
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '8px' }}>
              Account History
            </span>
            <h1 className="fw-normal text-white" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>
              Order History
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Track and manage your orders</p>
          </div>
          
          <div className="row g-4">
            {orders
              .slice(
                (currentPage - 1) * ordersPerPage,
                currentPage * ordersPerPage
              )
              .map(order => (
              <div key={order.id} className="col-12">
                <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
                  <div className="product-content">
                    {/* Order Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <h4 className="mb-1" style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.35rem' }}>
                          Order #{order.order_id}
                        </h4>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', letterSpacing: '0.04em' }}>
                          <i className="fas fa-calendar me-2" style={{ color: 'rgba(255,255,255,0.3)' }}></i>
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-end">
                        <span style={getStatusBadgeStyle(order.status)}>
                          <i className={getStatusIcon(order.status)}></i>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="row g-4">
                      {/* Order Items */}
                      <div className="col-lg-7">
                        <h5 style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
                          <i className="fas fa-box me-2" style={{ color: 'rgba(255,255,255,0.4)' }}></i>Items Ordered
                        </h5>
                        <div className="order-items">
                          {order.items?.map(item => (
                            <div key={item.id} className="d-flex justify-content-between align-items-center py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="d-flex align-items-center">
                                <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px' }}>
                                  <i className="fas fa-cube" style={{ color: '#fff', fontSize: '16px' }}></i>
                                </div>
                                <div>
                                  <h6 className="mb-1" style={{ color: '#ffffff', fontWeight: 500, fontSize: '14px' }}>{item.product?.name || 'Product'}</h6>
                                  <small style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>Quantity: {item.quantity}</small>
                                </div>
                              </div>
                              <div className="text-end">
                                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>₹{parseFloat(item.cost || item.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                              </div>
                            </div>
                          )) || (
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No items found</div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="col-lg-5">
                        <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                          <h5 style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
                            <i className="fas fa-receipt me-2" style={{ color: 'rgba(255,255,255,0.4)' }}></i>Order Summary
                          </h5>
                          
                          {order.shipping_address && (
                            <div className="mb-3">
                              <h6 style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                <i className="fas fa-map-marker-alt me-2"></i>Shipping Address
                              </h6>
                              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{order.shipping_address}</p>
                            </div>
                          )}
                          
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '12px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount:</span>
                              <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.25rem' }}>
                                ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            
                            <button
                              className="btn w-100 mb-2"
                              style={{ background: 'transparent', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', fontSize: '12px', fontWeight: 600, padding: '9px', borderRadius: '8px', opacity: !['confirmed', 'shipped', 'delivered'].includes(order.status) ? 0.4 : 1 }}
                              onClick={() => handleDownloadInvoice(order.order_id)}
                              disabled={!['confirmed', 'shipped', 'delivered'].includes(order.status)}
                            >
                              <i className="fas fa-file-pdf me-2"></i>
                              Download Invoice
                            </button>
                            
                            <button 
                              className="btn w-100" 
                              style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: '12px', fontWeight: 600, padding: '9px', borderRadius: '8px', opacity: (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'shipped') ? 0.4 : 1 }}
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