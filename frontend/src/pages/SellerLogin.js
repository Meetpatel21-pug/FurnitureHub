import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SellerLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Username and password are required');
      return;
    }

    setLoading(true);
    const result = await login(formData);
    
    if (result.success) {
      // Check if user is actually a vendor!
      const userDataStr = sessionStorage.getItem('user');
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        if (user.is_vendor || user.is_superuser) {
          toast.success('Seller Login successful!');
          const from = location.state?.from?.pathname || '/seller-dashboard';
          navigate(from);
        } else {
          toast.error('This account is not a seller. Please register as a seller first.');
          navigate('/become-a-seller');
        }
      }
    } else {
      toast.error(result.error);
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
          <div className="col-md-5 col-lg-4">
            <div className="text-center mb-5">
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '10px' }}>
                Seller Portal
              </h1>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
                Manage your store and orders
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: 'transparent' }}>
              <div>
                <label style={labelStyle}>Username</label>
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
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', textDecoration: 'none' }}>
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
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
                {loading ? 'Authenticating...' : 'Sign In as Seller'}
              </button>

              <div className="text-center mt-4">
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                  Don't have a seller account?{' '}
                  <Link to="/seller/register" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
                    Apply Now
                  </Link>
                </p>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: '10px' }}>
                  Not a seller?{' '}
                  <Link to="/login" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
                    Login as Buyer
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

export default SellerLogin;
