import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const { orderData } = location.state || {};
  const subtotal = Number(orderData?.subtotal ?? cart.total_price ?? 0);
  const deliveryCharge = Number(orderData?.deliveryCharge ?? 50);
  const grandTotal = Number(orderData?.totalAmount ?? subtotal + deliveryCharge);

  useEffect(() => {
    if (!orderData) {
      navigate('/checkout', { replace: true });
    }
  }, [navigate, orderData]);

  if (!orderData) {
    return null;
  }

  const handlePaymentConfirm = async () => {
    setLoading(true);
    try {
      // Update payment status to completed
      const response = await ordersAPI.updatePaymentStatus(orderData.orderId, 'completed');
      clearCart();
      if (response.data?.email_sent) {
        toast.success(`Payment successful! Bill sent to ${response.data.email_recipient || 'your email'}.`);
      } else {
        toast.warn(`Payment successful, but the bill email was not sent${response.data?.email_error ? `: ${response.data.email_error}` : ''}.`);
      }
      navigate('/orders');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/checkout');
  };
  
  const toggleBill = () => {
    setShowBill((previous) => !previous);
  };

  const renderPaymentDetails = () => {
    switch (orderData.payment_method) {
      case 'upi':
        return (
          <div>
            <h4 className="mb-3 text-dark">UPI Payment</h4>
            <div className="text-center mb-4">
              <div className="border border-dark rounded p-4 mx-auto" style={{width: '150px', height: '150px'}}>
                <div className="h-100 d-flex flex-column align-items-center justify-content-center">
                  <i className="fas fa-qrcode fa-5x text-dark mb-2"></i>
                  <div className="text-dark">UPI QR Code</div>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-dark">Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
              {/* <p className="text-dark">UPI ID: <strong className="text-dark">example@upi</strong></p> */}
              <p className="text-dark">Amount: <strong className="text-dark">₹{grandTotal.toFixed(2)}</strong></p>
            </div>
          </div>
        );
      case 'netbanking':
        return (
          <div>
            <h4 className="mb-3 text-dark">Net Banking</h4>
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="card p-2 text-center cursor-pointer">
                    <div className="bg-primary text-white p-2 rounded mb-2">SBI</div>
                    <div className="mt-2 text-dark">SBI</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card p-2 text-center cursor-pointer">
                    <div className="bg-danger text-white p-2 rounded mb-2">HDFC</div>
                    <div className="mt-2 text-dark">HDFC</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card p-2 text-center cursor-pointer">
                    <div className="bg-warning text-dark p-2 rounded mb-2">ICICI</div>
                    <div className="mt-2 text-dark">ICICI</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card p-2 text-center cursor-pointer">
                    <div className="bg-success text-white p-2 rounded mb-2">Axis</div>
                    <div className="mt-2 text-dark">Axis</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-dark">Amount: <strong className="text-dark">₹{grandTotal.toFixed(2)}</strong></p>
          </div>
        );
      case 'card':
      default:
        return (
          <div>
            <h4 className="mb-3 text-dark">Card Payment</h4>
            <div className="mb-3">
              <label className="form-label text-dark">Card Number</label>
              <input type="text" className="form-control" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label text-dark">Expiry Date</label>
                <input type="text" className="form-control" placeholder="MM/YY" />
              </div>
              <div className="col-md-6">
                <label className="form-label text-dark">CVV</label>
                <input type="text" className="form-control" placeholder="123" />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-dark">Name on Card</label>
              <input type="text" className="form-control" placeholder="John Doe" />
            </div>
            <p className="text-dark">Amount: <strong className="text-dark">₹{grandTotal.toFixed(2)}</strong></p>
          </div>
        );
    }
  };

  return (
    <div style={{paddingTop: '100px'}}>
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Payment Confirmation</h2>
            <p className="text-muted">Complete your payment to place the order</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-body p-4">
                  {renderPaymentDetails()}
                  
                  <div className="d-grid gap-2 mt-4">
                    <button 
                      className="btn btn-success btn-lg bg-dark" 
                      onClick={toggleBill}
                    >
                      <i className="fas fa-file-invoice me-2 "></i>
                      {showBill ? 'Hide Bill' : 'Generate Bill'}
                    </button>
                    
                    {showBill && (
                      <div className="card mt-3 mb-3">
                        <div className="card-header bg-dark text-white">
                          <h5 className="mb-0">Order Invoice</h5>
                        </div>
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-3">
                            <div>
                              <h6 className="mb-1 text-dark">Order ID</h6>
                              <p className="mb-0 text-dark">{orderData.orderId}</p>
                            </div>
                            <div className="text-end">
                              <h6 className="mb-1 text-dark">Date</h6>
                              <p className="mb-0 text-dark">{new Date().toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <h6 className="mb-1 text-dark">Shipping Address</h6>
                            <p className="mb-0 text-dark">{orderData.address}</p>
                          </div>
                          
                          <div className="mb-3">
                            <h6 className="mb-1 text-dark">Payment Method</h6>
                            <p className="mb-0 text-dark">
                              {orderData.payment_method === 'cod' ? 'Cash on Delivery' : 
                               orderData.payment_method === 'card' ? 'Credit/Debit Card' :
                               orderData.payment_method === 'upi' ? 'UPI' : 'Net Banking'}
                            </p>
                          </div>
                          
                          <div className="mb-0">
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-dark">Subtotal</span>
                                <span className="text-dark">₹{subtotal.toFixed(2)}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-dark">Delivery Charge</span>
                                <span className="text-dark">₹{deliveryCharge.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2">
                              <h5 className="text-dark">Total Amount</h5>
                              <h5 className="text-success">₹{grandTotal.toFixed(2)}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className="btn btn-dark btn-lg" 
                      onClick={handlePaymentConfirm}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-2"></i>
                          Confirm Payment
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="fas fa-shield-alt text-success me-2"></i>
                  <span className="text-muted">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentConfirmation;