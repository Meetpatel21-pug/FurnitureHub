import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';

// ─── UPI Config ───────────────────────────────────────────────────────────────
const UPI_ID   = 'meetparsana211@okaxis';
const MERCHANT = 'FurnitureHub';

// Build UPI deep-link
const buildUpiUrl = (amount, orderId) => {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `FurnitureHub Order #${orderId}`,
  });
  return `upi://pay?${params.toString()}`;
};

// Build QR image URL (no npm needed – uses free public API)
const buildQrImgUrl = (amount, orderId, size = 220, fmt = 'svg') => {
  const upiUrl = buildUpiUrl(amount, orderId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=1a1a2e&qzone=2&format=${fmt}`;
};

// ─── Reusable UPI QR Component ────────────────────────────────────────────────
const UpiQRCode = ({ amount, orderId, size = 220 }) => {
  const [loaded, setLoaded] = useState(false);
  const qrUrl  = buildQrImgUrl(amount, orderId, size);
  const upiUrl = buildUpiUrl(amount, orderId);

  const handleDownload = useCallback(async () => {
    try {
      const pngUrl = buildQrImgUrl(amount, orderId, 400, 'png');
      const res    = await fetch(pngUrl);
      const blob   = await res.blob();
      const link   = document.createElement('a');
      link.href    = URL.createObjectURL(blob);
      link.download = `FurnitureHub-QR-Order-${orderId}.png`;
      link.click();
    } catch {
      toast.error('Download failed. Try right-clicking the QR and saving.');
    }
  }, [amount, orderId]);

  return (
    <div className="text-center">
      {/* QR Card with gradient border */}
      <div style={{ display:'inline-block', background:'linear-gradient(135deg,#667eea,#764ba2)', padding:'4px', borderRadius:'20px', boxShadow:'0 8px 32px rgba(102,126,234,0.35)', marginBottom:'12px' }}>
        <div style={{ background:'#fff', borderRadius:'17px', padding:'16px', position:'relative', minWidth:`${size+32}px`, minHeight:`${size+32}px`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {/* Shimmer */}
          {!loaded && (
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize:'400% 100%', animation:'qrShimmer 1.2s infinite', borderRadius:'17px' }} />
          )}
          <img src={qrUrl} alt="GPay UPI QR Code" width={size} height={size}
            onLoad={() => setLoaded(true)}
            style={{ display:'block', opacity: loaded ? 1 : 0, transition:'opacity 0.4s ease', borderRadius:'8px' }}
          />
          {/* Center logo */}
          {loaded && (
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'38px', height:'38px', background:'linear-gradient(135deg,#667eea,#764ba2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.3)', border:'3px solid #fff' }}>
              <span style={{ color:'#fff', fontSize:'13px', fontWeight:'bold' }}>₹</span>
            </div>
          )}
        </div>
      </div>

      {/* App badges */}
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
        {['GPay','PhonePe','Paytm','BHIM'].map(app => (
          <span key={app} style={{ background:'linear-gradient(135deg,#667eea18,#764ba218)', border:'1px solid #667eea55', color:'#5a52d5', borderRadius:'20px', padding:'3px 10px', fontSize:'0.7rem', fontWeight:600 }}>{app}</span>
        ))}
      </div>

      {/* Amount pill */}
      <div style={{ display:'inline-block', background:'linear-gradient(135deg,#11998e,#38ef7d)', color:'#fff', borderRadius:'30px', padding:'8px 24px', fontSize:'1.25rem', fontWeight:800, marginBottom:'10px', boxShadow:'0 4px 15px rgba(17,153,142,0.35)' }}>
        ₹{amount.toFixed(2)}
      </div>

      <p style={{ fontSize:'0.75rem', color:'#6b7280', marginBottom:'10px' }}>
        UPI ID: <strong style={{ color:'#374151' }}>{UPI_ID}</strong>
      </p>

      {/* Action buttons */}
      <div className="d-flex justify-content-center gap-2">
        <button onClick={handleDownload} style={{ background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', border:'none', borderRadius:'10px', padding:'8px 16px', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', boxShadow:'0 3px 10px rgba(102,126,234,0.4)' }}>
          <i className="fas fa-download me-1" /> Download QR
        </button>
        <a href={upiUrl} style={{ background:'linear-gradient(135deg,#11998e,#38ef7d)', color:'#fff', textDecoration:'none', borderRadius:'10px', padding:'8px 16px', fontSize:'0.78rem', fontWeight:600, boxShadow:'0 3px 10px rgba(17,153,142,0.35)' }}>
          <i className="fas fa-mobile-alt me-1" /> Open UPI App
        </a>
      </div>

      <style>{`
        @keyframes qrShimmer { 0%{background-position:-400% 0} 100%{background-position:400% 0} }
      `}</style>
    </div>
  );
};

// ─── Main PaymentConfirmation Page ────────────────────────────────────────────
const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const [loading,  setLoading]  = useState(false);
  const [showBill, setShowBill] = useState(false);

  const { orderData } = location.state || {};
  const subtotal       = Number(orderData?.subtotal       ?? cart.total_price ?? 0);
  const deliveryCharge = Number(orderData?.deliveryCharge ?? 50);
  const grandTotal     = Number(orderData?.totalAmount    ?? subtotal + deliveryCharge);
  const orderId        = orderData?.orderId ?? 'N/A';

  useEffect(() => {
    if (!orderData) navigate('/checkout', { replace: true });
  }, [navigate, orderData]);

  if (!orderData) return null;

  const handlePaymentConfirm = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.updatePaymentStatus(orderData.orderId, 'completed');
      clearCart();
      if (response.data?.email_sent) {
        toast.success(`Payment successful! Bill sent to ${response.data.email_recipient || 'your email'}.`);
      } else {
        toast.warn(`Payment successful, but bill email was not sent${response.data?.email_error ? `: ${response.data.email_error}` : ''}.`);
      }
      navigate('/orders');
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentLabel =
    orderData.payment_method === 'cod'        ? 'Cash on Delivery'
    : orderData.payment_method === 'card'     ? 'Credit / Debit Card'
    : orderData.payment_method === 'upi'      ? 'UPI'
    : 'Net Banking';

  const renderPaymentDetails = () => {
    switch (orderData.payment_method) {
      case 'upi':
        return (
          <div>
            <h4 className="mb-1 fw-bold" style={{ color:'#1a1a2e' }}>
              <i className="fas fa-qrcode me-2" style={{ color:'#667eea' }} />UPI / GPay Payment
            </h4>
            <p className="text-muted small mb-4">Scan the QR below with any UPI app — amount is pre-filled</p>
            <UpiQRCode amount={grandTotal} orderId={orderId} size={220} />
          </div>
        );
      case 'netbanking':
        return (
          <div>
            <h4 className="mb-3 text-dark">Net Banking</h4>
            <div className="row g-3 mb-3">
              {[{ label:'SBI', color:'#1a237e', bg:'#e8eaf6' },{ label:'HDFC', color:'#b71c1c', bg:'#ffebee' },{ label:'ICICI', color:'#e65100', bg:'#fff3e0' },{ label:'Axis', color:'#1b5e20', bg:'#e8f5e9' }].map(b => (
                <div key={b.label} className="col-6 col-md-3">
                  <div className="card p-2 text-center" style={{ cursor:'pointer' }}>
                    <div className="p-2 rounded mb-2 fw-bold" style={{ background:b.bg, color:b.color }}>{b.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-dark">Amount: <strong>₹{grandTotal.toFixed(2)}</strong></p>
          </div>
        );
      default:
        return (
          <div>
            <h4 className="mb-3 text-dark">Card Payment</h4>
            <div className="mb-3"><label className="form-label text-dark">Card Number</label><input type="text" className="form-control" placeholder="1234 5678 9012 3456" /></div>
            <div className="row mb-3">
              <div className="col-md-6"><label className="form-label text-dark">Expiry Date</label><input type="text" className="form-control" placeholder="MM/YY" /></div>
              <div className="col-md-6"><label className="form-label text-dark">CVV</label><input type="text" className="form-control" placeholder="123" /></div>
            </div>
            <div className="mb-3"><label className="form-label text-dark">Name on Card</label><input type="text" className="form-control" placeholder="John Doe" /></div>
            <p className="text-dark">Amount: <strong>₹{grandTotal.toFixed(2)}</strong></p>
          </div>
        );
    }
  };

  return (
    <div style={{ paddingTop:'100px' }}>
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Payment Confirmation</h2>
            <p className="text-muted">Complete your payment to place the order</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card shadow-sm border-0" style={{ borderRadius:'20px', overflow:'hidden' }}>
                <div className="card-body p-4">
                  {renderPaymentDetails()}

                  <div className="d-grid gap-2 mt-4">
                    {/* Generate Bill button */}
                    <button
                      className="btn btn-lg fw-bold"
                      onClick={() => setShowBill(p => !p)}
                      style={{ background: showBill ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#1a1a2e', color:'#fff', borderRadius:'12px', border:'none', boxShadow:'0 4px 15px rgba(26,26,46,0.3)', transition:'all 0.3s ease' }}
                    >
                      <i className={`fas fa-${showBill ? 'eye-slash' : 'file-invoice'} me-2`} />
                      {showBill ? 'Hide Bill' : 'Generate Bill'}
                    </button>

                    {/* ── Invoice with QR ── */}
                    {showBill && (
                      <div className="card mt-2 mb-2 border-0" style={{ borderRadius:'16px', overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', animation:'fadeInDown 0.35s ease' }}>
                        {/* Header */}
                        <div className="card-header py-3" style={{ background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)' }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h5 className="mb-0 text-white fw-bold"><i className="fas fa-receipt me-2" style={{ color:'#667eea' }} />Order Invoice</h5>
                              <small style={{ color:'#9ca3af' }}>FurnitureHub</small>
                            </div>
                            <div style={{ background:'linear-gradient(135deg,#667eea,#764ba2)', borderRadius:'8px', padding:'4px 12px' }}>
                              <span style={{ color:'#fff', fontSize:'0.75rem', fontWeight:600 }}>#{orderId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="card-body p-4">
                          {/* Meta */}
                          <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                            <div><div className="text-muted small">Order ID</div><div className="fw-bold text-dark">#{orderId}</div></div>
                            <div className="text-end"><div className="text-muted small">Date</div><div className="fw-bold text-dark">{new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div></div>
                          </div>
                          {/* Address */}
                          <div className="mb-3 pb-3 border-bottom">
                            <div className="text-muted small mb-1"><i className="fas fa-map-marker-alt me-1" />Shipping Address</div>
                            <div className="text-dark small">{orderData.address}</div>
                          </div>
                          {/* Payment */}
                          <div className="mb-3 pb-3 border-bottom">
                            <div className="text-muted small mb-1"><i className="fas fa-credit-card me-1" />Payment Method</div>
                            <div className="text-dark small fw-bold">{paymentLabel}</div>
                          </div>
                          {/* Amounts */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Subtotal</span><span className="text-dark">₹{subtotal.toFixed(2)}</span></div>
                            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Delivery Charge</span><span className="text-dark">₹{deliveryCharge.toFixed(2)}</span></div>
                            <div className="d-flex justify-content-between border-top pt-3 mt-2">
                              <span className="fw-bold text-dark fs-5">Total Amount</span>
                              <span className="fw-bold fs-5" style={{ color:'#10b981' }}>₹{grandTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* ── QR Code inside Bill ── */}
                          <div style={{ background:'linear-gradient(135deg,#f8f9ff,#f0f4ff)', border:'1px solid #e0e7ff', borderRadius:'16px', padding:'24px 16px' }}>
                            <div className="text-center mb-3">
                              <span style={{ display:'inline-block', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', borderRadius:'20px', padding:'4px 16px', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.5px' }}>
                                <i className="fas fa-mobile-alt me-1" />SCAN &amp; PAY · GPay / UPI
                              </span>
                            </div>
                            <UpiQRCode amount={grandTotal} orderId={orderId} size={200} />
                            <p className="text-muted text-center small mt-3 mb-0">
                              Amount ₹{grandTotal.toFixed(2)} is pre-filled · No manual entry needed
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirm Payment */}
                    <button
                      className="btn btn-lg fw-bold"
                      onClick={handlePaymentConfirm}
                      disabled={loading}
                      style={{ background:'linear-gradient(135deg,#11998e,#38ef7d)', color:'#fff', borderRadius:'12px', border:'none', boxShadow:'0 4px 15px rgba(17,153,142,0.4)', transition:'all 0.3s ease' }}
                    >
                      {loading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" />Processing...</>) : (<><i className="fas fa-check-circle me-2" />Confirm Payment</>)}
                    </button>

                    <button className="btn btn-outline-secondary" onClick={() => navigate('/checkout')} disabled={loading} style={{ borderRadius:'12px' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="mt-4 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  <i className="fas fa-shield-alt text-success" /><span className="text-muted small">256-bit SSL Secured</span>
                  <span className="text-muted small">·</span>
                  <i className="fas fa-lock text-success" /><span className="text-muted small">UPI Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default PaymentConfirmation;