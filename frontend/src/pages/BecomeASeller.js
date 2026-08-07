import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vendorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BecomeASeller = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    store_name: '',
    store_description: '',
    logo_url: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in first'); navigate('/login'); return; }
    if (!form.store_name.trim()) { toast.error('Store name is required'); return; }
    setLoading(true);
    try {
      await vendorAPI.register(form);
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#111111',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: '8px',
    padding: '11px 14px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '7px',
  };

  const benefits = [
    { icon: <i className="fas fa-box" style={{ fontSize: '1.8rem', color: '#ffffff' }}></i>, title: 'List Your Products', desc: 'Showcase your furniture to thousands of buyers across India.' },
    { icon: <i className="fas fa-chart-bar" style={{ fontSize: '1.8rem', color: '#ffffff' }}></i>, title: 'Seller Dashboard', desc: 'Track your orders, revenue, and performance in real time.' },
    { icon: <i className="fas fa-wallet" style={{ fontSize: '1.8rem', color: '#ffffff' }}></i>, title: 'Grow Your Revenue', desc: 'Reach customers beyond your local area with no upfront cost.' },
    { icon: <i className="fas fa-shield-alt" style={{ fontSize: '1.8rem', color: '#ffffff' }}></i>, title: 'Secure Payments', desc: 'Receive payments safely via our verified checkout system.' },
  ];

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ marginBottom: '24px' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#4ade80' }}></i>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '12px' }}>Application Submitted</span>
          <h1 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '2.2rem', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>
            Welcome to FurnitureHub Marketplace
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '36px' }}>
            Your seller application is now <strong style={{ color: '#facc15' }}>pending review</strong>. Our team will approve your account shortly. You'll be able to list products and start selling once approved.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ background: '#fff', color: '#000', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Back to Home
            </Link>
            <Link to="/seller-dashboard" style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: '70px' }}>
      {/* Hero */}
      <section style={{ padding: '80px 20px 60px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '16px' }}>
            FurnitureHub Marketplace
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 400, color: '#fff', margin: '0 0 20px 0', lineHeight: 1.1 }}>
            Sell Your Furniture<br />to Thousands of Buyers
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 36px' }}>
            Join FurnitureHub as a verified seller. Register your store, list your products, and grow your furniture business online.
          </p>
          <a href="#register-form" style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '14px 36px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Register as Seller
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '70px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: '48px' }}>
          Why Sell on FurnitureHub?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '28px 24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{b.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.15rem', fontWeight: 400, color: '#fff', marginBottom: '10px' }}>{b.title}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Form */}
      <section id="register-form" style={{ padding: '40px 20px 80px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '2rem', fontWeight: 400, color: '#fff', marginBottom: '10px' }}>
            Create Your Seller Account
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            {user ? `Registering as ${user.username}` : 'Please log in to continue'}
          </p>
        </div>

        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px 36px', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '24px' }}>You must be logged in to register as a seller.</p>
              <Link to="/login" style={{ background: '#fff', color: '#000', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Store Name *</label>
                <input style={inputStyle} type="text" placeholder="e.g. Sharma Furniture House" value={form.store_name} onChange={e => handleChange('store_name', e.target.value)} required />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Store Description</label>
                <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} placeholder="Tell customers about your store, products, and speciality…" value={form.store_description} onChange={e => handleChange('store_description', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Logo URL</label>
                  <input style={inputStyle} type="url" placeholder="https://…" value={form.logo_url} onChange={e => handleChange('logo_url', e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Business Address</label>
                <input style={inputStyle} type="text" placeholder="Street address, landmark" value={form.address} onChange={e => handleChange('address', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} type="text" placeholder="Ahmedabad" value={form.city} onChange={e => handleChange('city', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input style={inputStyle} type="text" placeholder="Gujarat" value={form.state} onChange={e => handleChange('state', e.target.value)} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" />Submitting Application…</>
                ) : 'Submit Seller Application'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '16px' }}>
                Applications are reviewed within 24–48 hours. You'll receive a notification upon approval.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default BecomeASeller;
