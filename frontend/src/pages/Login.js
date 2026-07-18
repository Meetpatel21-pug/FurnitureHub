import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { isDarkTheme } = useTheme();

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        return value.length < 3 ? 'Username must be at least 3 characters' : '';
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      default:
        return '';
    }
  };
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: isDarkTheme
          ? 'linear-gradient(180deg, #0f172a 0%, #111827 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        paddingTop: '80px',
      }}
    >
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0"
              style={{
                background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.3)' : '0 12px 32px rgba(15,23,42,0.12)',
                border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
              }}
            >
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-couch mb-3" style={{fontSize: '3rem', background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}></i>
                  <h2 className={`mb-2 ${isDarkTheme ? 'text-white' : 'text-dark'}`}>Welcome Back</h2>
                  <p className={isDarkTheme ? 'text-muted' : 'text-secondary'}>Sign in to your FurnitureHub account</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className={`form-label fw-bold ${isDarkTheme ? 'text-white' : 'text-dark'}`}>Username</label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      style={{background: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#ffffff', border: `1px solid ${errors.username ? '#dc3545' : isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.15)'}`, color: isDarkTheme ? 'white' : '#0f172a', borderRadius: '10px'}}
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                    />
                    {errors.username && <div className="text-danger small mt-1">{errors.username}</div>}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className={`form-label fw-bold ${isDarkTheme ? 'text-white' : 'text-dark'}`}>Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      style={{background: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#ffffff', border: `1px solid ${errors.password ? '#dc3545' : isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.15)'}`, color: isDarkTheme ? 'white' : '#0f172a', borderRadius: '10px'}}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 fw-bold"
                    style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px'}}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <p className={`${isDarkTheme ? 'text-muted' : 'text-secondary'} mb-0`}>Don't have an account? <Link to="/register" style={{color: '#667eea', textDecoration: 'none', fontWeight: '500'}}>Create Account</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;