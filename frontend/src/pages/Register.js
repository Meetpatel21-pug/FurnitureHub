import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { isDarkTheme } = useTheme();

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
        return value.length < 2 ? 'First name must be at least 2 characters' : '';
      case 'last_name':
        return value.length < 2 ? 'Last name must be at least 2 characters' : '';
      case 'username':
        return value.length < 3 ? 'Username must be at least 3 characters' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'password_confirm':
        return value !== formData.password ? 'Passwords do not match' : '';
      default:
        return '';
    }
  };
  const { register } = useAuth();
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
    const result = await register(formData);
    
    if (result.success) {
      toast.success('Registration successful! Please log in.');
      navigate('/login');
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

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: '#000000',
        paddingTop: '100px',
        paddingBottom: '60px',
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div
              style={{
                background: '#121212',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '44px 36px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
              }}
            >
              <div className="text-center mb-4">
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.45)',
                    display: 'block',
                    marginBottom: '10px',
                  }}
                >
                  FurnitureHub
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2rem',
                    fontWeight: 400,
                    color: '#ffffff',
                    marginBottom: '8px',
                  }}
                >
                  Join FurnitureHub
                </h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: 0,
                  }}
                >
                  Create your account to save rooms and manage orders
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="first_name"
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(255, 255, 255, 0.85)',
                        marginBottom: '8px',
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                      style={{
                        background: '#1a1a1a',
                        border: errors.first_name
                          ? '1px solid #dc3545'
                          : '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        boxShadow: 'none',
                      }}
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                    />
                    {errors.first_name && (
                      <div className="text-danger small mt-1">{errors.first_name}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="last_name"
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(255, 255, 255, 0.85)',
                        marginBottom: '8px',
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                      style={{
                        background: '#1a1a1a',
                        border: errors.last_name
                          ? '1px solid #dc3545'
                          : '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        boxShadow: 'none',
                      }}
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                    />
                    {errors.last_name && (
                      <div className="text-danger small mt-1">{errors.last_name}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="username"
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.85)',
                      marginBottom: '8px',
                    }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    style={{
                      background: '#1a1a1a',
                      border: errors.username
                        ? '1px solid #dc3545'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      boxShadow: 'none',
                    }}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    required
                  />
                  {errors.username && (
                    <div className="text-danger small mt-1">{errors.username}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="email"
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.85)',
                      marginBottom: '8px',
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    style={{
                      background: '#1a1a1a',
                      border: errors.email
                        ? '1px solid #dc3545'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      boxShadow: 'none',
                    }}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <div className="text-danger small mt-1">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="password"
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.85)',
                      marginBottom: '8px',
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    style={{
                      background: '#1a1a1a',
                      border: errors.password
                        ? '1px solid #dc3545'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      boxShadow: 'none',
                    }}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  {errors.password && (
                    <div className="text-danger small mt-1">{errors.password}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password_confirm"
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.85)',
                      marginBottom: '8px',
                    }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password_confirm ? 'is-invalid' : ''}`}
                    style={{
                      background: '#1a1a1a',
                      border: errors.password_confirm
                        ? '1px solid #dc3545'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      boxShadow: 'none',
                    }}
                    id="password_confirm"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  {errors.password_confirm && (
                    <div className="text-danger small mt-1">{errors.password_confirm}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#e2e2e2')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#ffffff')}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-2">
                <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px', margin: 0 }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#ffffff',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      marginLeft: '4px',
                    }}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;