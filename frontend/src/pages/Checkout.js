import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subtotal = Number(cart.total_price || 0);
      const deliveryCharge = 50;
      const totalAmount = subtotal + deliveryCharge;

      const orderData = {
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        payment_method: paymentMethod,
        subtotal,
        deliveryCharge,
        totalAmount
      };
      
      const response = await ordersAPI.checkout(orderData);
      
      if (paymentMethod === 'cod') {
        clearCart();
        if (response.data?.email_sent) {
          toast.success(`Order ${response.data.order_id} placed successfully. Bill sent to ${response.data.email_recipient || 'your email'}.`);
        } else {
          toast.warn(`Order ${response.data.order_id} placed successfully, but the bill email was not sent${response.data?.email_error ? `: ${response.data.email_error}` : ''}.`);
        }
        navigate('/orders');
      } else {
        // Navigate to payment confirmation page with order data
        navigate('/payment-confirmation', { 
          state: { 
            orderData: {
              ...orderData,
              orderId: response.data.order_id,
              totalAmount: Number(response.data.total_amount ?? totalAmount),
              subtotal,
              deliveryCharge
            } 
          }
        });
      }
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5 bg-light">
          <div className="container text-center">
            <div className="modern-product-card">
              <div className="product-content">
                <i className="fas fa-user-lock fa-3x text-primary mb-3"></i>
                <h2 className="product-title">Access Required</h2>
                <p className="text-muted">Please login to proceed with checkout</p>
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

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5 bg-light">
          <div className="container text-center">
            <div className="modern-product-card">
              <div className="product-content">
                <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h2 className="product-title">Cart is Empty</h2>
                <p className="text-muted">Add some items to proceed with checkout</p>
                <Link to="/products" className="btn btn-primary btn-lg px-5 py-3">
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
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Checkout</h2>
            <p className="text-muted">Complete your order</p>
          </div>
          
          <div className="row g-4">
            {/* Shipping Form */}
            <div className="col-lg-8">
              <div className="card">
                <div className="card-body">
                  <h4 className="text-dark mb-4">
                    <i className="fas fa-shipping-fast me-2"></i>Shipping Information
                  </h4>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="address" className="form-label text-dark">Address</label>
                        <textarea
                          className="form-control border-dark"
                          id="address"
                          name="address"
                          rows="3"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter your complete address"
                          style={{color: '#333'}}
                          required
                        ></textarea>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="city" className="form-label text-dark">City</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          style={{color: '#333'}}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="state" className="form-label text-dark">State</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="State"
                          style={{color: '#333'}}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pincode" className="form-label text-dark">Pincode</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="110001"
                          style={{color: '#333'}}
                          required
                        />
                      </div>
                      
                      <div className="col-12 mt-4">
                        <h4 className="text-dark mb-3">
                          <i className="fas fa-money-bill-wave me-2"></i>Payment Method
                        </h4>
                        
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-body">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    id="codPayment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                  />
                                  <label className="form-check-label w-100" htmlFor="codPayment">
                                    <div className="d-flex align-items-center">
                                      <i className="fas fa-truck fs-3 text-primary me-3"></i>
                                      <div>
                                        <h6 className="mb-1 text-dark">Cash on Delivery</h6>
                                        <small className="text-muted">Pay when your order arrives</small>
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-body">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    id="onlinePayment"
                                    value="online"
                                    checked={paymentMethod !== 'cod'}
                                    onChange={() => setPaymentMethod('card')}
                                  />
                                  <label className="form-check-label w-100" htmlFor="onlinePayment">
                                    <div className="d-flex align-items-center">
                                      <i className="fas fa-credit-card fs-3 text-success me-3"></i>
                                      <div>
                                        <h6 className="mb-1 text-dark">Online Payment</h6>
                                        <small className="text-muted">Pay now with card, UPI, or net banking</small>
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {paymentMethod !== 'cod' && (
                            <div className="col-12 mt-3">
                              <div className="card">
                                <div className="card-body">
                                  <h6 className="mb-3">Select Payment Option</h6>
                                  <div className="row g-3">
                                    <div className="col-md-3">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="onlinePaymentType"
                                          id="cardPayment"
                                          checked={paymentMethod === 'card'}
                                          onChange={() => setPaymentMethod('card')}
                                        />
                                        <label className="form-check-label text-dark" htmlFor="cardPayment">
                                          <i className="far fa-credit-card me-2 "></i>Card
                                        </label>
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="onlinePaymentType"
                                          id="upiPayment"
                                          checked={paymentMethod === 'upi'}
                                          onChange={() => setPaymentMethod('upi')}
                                        />
                                        <label className="form-check-label text-dark" htmlFor="upiPayment">
                                          <i className="fas fa-mobile-alt me-2"></i>UPI
                                        </label>
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="onlinePaymentType"
                                          id="netbankingPayment"
                                          checked={paymentMethod === 'netbanking'}
                                          onChange={() => setPaymentMethod('netbanking')}
                                        />
                                        <label className="form-check-label text-dark" htmlFor="netbankingPayment">
                                          <i className="fas fa-university me-2"></i>Net Banking
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-12 text-center mt-4">
                        <button
                          type="submit"
                          className="btn btn-dark btn-lg px-5 py-3"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Placing Order...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-credit-card me-2"></i>Place Order
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="text-dark mb-4">
                    <i className="fas fa-receipt me-2"></i>Order Summary
                  </h4>
                  
                  <div className="order-items mb-4">
                    {cart.items?.map(item => (
                      <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                          <h6 className="mb-0 text-dark">{item.product.name}</h6>
                          <small className="text-muted">Qty: {item.quantity}</small>
                        </div>
                        <span className="text-dark">₹{parseFloat(item.cost).toFixed(0)}</span>
                      </div>
                    )) || (
                      <div className="text-muted">No items found</div>
                    )}
                  </div>
                  
                  <div className="summary-totals">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-dark">Subtotal:</span>
                      <span className="text-dark">₹{parseFloat(cart.total_price || 0).toFixed(0)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-dark">Shipping:</span>
                      <span className="text-success">Free</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 pt-2 border-top">
                      <h5 className="text-dark">Total:</h5>
                      <h4 className="text-success fw-bold">₹{parseFloat(cart.total_price || 0).toFixed(0)}</h4>
                    </div>
                  </div>
                  
                  <div className="security-info p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-shield-alt text-success fa-2x me-3"></i>
                      <div>
                        <h6 className="mb-1 text-dark">Secure Checkout</h6>
                        <small className="text-muted">Your information is protected</small>
                      </div>
                    </div>
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

export default Checkout;