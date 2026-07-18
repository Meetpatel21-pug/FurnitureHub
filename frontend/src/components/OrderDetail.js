import React from 'react';
import { ordersAPI } from '../services/api';

const OrderDetail = ({ order, onOrderUpdate }) => {
  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await ordersAPI.cancelOrder(order.order_id);
        // Notify parent component to refresh orders
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.response?.data?.error || 'Failed to cancel order');
      }
    }
  };

  return (
    <div className="product-content">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="product-title mb-1 text-dark">Order #{order.order_id}</h4>
          <div className="product-category">
            <i className="fas fa-calendar me-2"></i>
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="text-end">
          <span 
            className={`badge ${
              order.status === 'pending' ? 'bg-warning text-dark' : 
              order.status === 'confirmed' ? 'bg-info text-white' :
              order.status === 'shipped' ? 'bg-primary text-white' :
              order.status === 'delivered' ? 'bg-success text-white' :
              'bg-danger text-white'
            }`} 
            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
          >
            <i className={`fas fa-${
              order.status === 'pending' ? 'clock' : 
              order.status === 'confirmed' ? 'check-circle' :
              order.status === 'shipped' ? 'shipping-fast' :
              order.status === 'delivered' ? 'box-open' :
              'times-circle'
            } me-2`}></i>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="row">
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
            ))}
          </div>
        </div>
        
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
                onClick={handleCancelOrder}
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
  );
};

export default OrderDetail;