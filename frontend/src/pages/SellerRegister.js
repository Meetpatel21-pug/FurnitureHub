import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    store_name: '',
    store_description: ''
  });
  const [loading, setLoading] = useState(false);
  const { vendorRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.store_name.trim()) {
      toast.error('Store Name is required');
      return;
    }

    setLoading(true);
    const result = await vendorRegister(formData);
    
    if (result.success) {
      toast.success('Seller Account Created! Welcome.');
      navigate('/seller-dashboard');
    } else {
      if (typeof result.error === 'object') {
        Object.values(result.error).forEach(errors => {
          if (Array.isArray(errors)) {
            errors.forEach(error => toast.error(error));
          } else {
            toast.error(errors);
          }
        });
      } else {
        toast.error(result.error);
      }
    }
    
    setLoading(false);
  };

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    color: 'var(--ink)',
    borderRadius: '0',
    padding: '12px 0',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--ink-light)',
    marginBottom: '4px',
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'var(--bg-base)',
        paddingTop: '100px',
        paddingBottom: '60px',
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center mb-5">
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '10px' }}>
                Become a Seller
              </h1>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
                Join FurnitureZone and reach thousands of customers
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: 'transparent' }}>
              <div className="row">
                <div className="col-6">
                  <label style={labelStyle}>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="col-6">
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Store Name *</label>
                <input
                  type="text"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                  placeholder="e.g. Vintage Woodworks"
                />
              </div>
              
              <div>
                <label style={labelStyle}>Store Description</label>
                <textarea
                  name="store_description"
                  value={formData.store_description}
                  onChange={handleChange}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Tell customers about what you sell..."
                />
              </div>

              <div className="row">
                <div className="col-6">
                  <label style={labelStyle}>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="col-6">
                  <label style={labelStyle}>Confirm Password *</label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--ink)',
                  color: 'var(--bg-base)',
                  border: 'none',
                  padding: '16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginTop: '20px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background 0.3s ease'
                }}
              >
                {loading ? 'Registering...' : 'Create Seller Account'}
              </button>

              <div className="text-center mt-4">
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                  Already have a seller account?{' '}
                  <Link to="/seller/login" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
                    Login Here
                  </Link>
                </p>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: '10px' }}>
                  Not a seller?{' '}
                  <Link to="/register" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
                    Register as Buyer
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
