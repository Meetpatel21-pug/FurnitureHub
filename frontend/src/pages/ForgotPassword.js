import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const { isDarkTheme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const cardStyle = {
    background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.3)' : '0 12px 32px rgba(15,23,42,0.12)',
    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
  };

  const inputStyle = {
    background: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#ffffff',
    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.15)'}`,
    color: isDarkTheme ? 'white' : '#0f172a',
    borderRadius: '10px',
  };

  const btnStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email not found');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    setLoading(true);
    try {
      await authAPI.verifyOtp({ email, otp });
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, new_password: passwords.newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
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
          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
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
                  {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : 'New Password'}
                </h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: 0,
                  }}
                >
                  {step === 1 && 'Enter your email to receive a security code'}
                  {step === 2 && `Enter the 6-digit code sent to ${email}`}
                  {step === 3 && 'Choose a strong new password'}
                </p>
              </div>

              {/* Step 1: Email */}
              {step === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label
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
                      className="form-control"
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        boxShadow: 'none',
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter registered email"
                      required
                    />
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
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Sending Code...
                      </>
                    ) : (
                      'Send Security Code'
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4">
                    <label
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
                      Security OTP
                    </label>
                    <input
                      type="text"
                      className="form-control text-center"
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '1.5rem',
                        letterSpacing: '0.4rem',
                        boxShadow: 'none',
                      }}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="------"
                      maxLength={6}
                      required
                    />
                    <div className="text-end mt-2">
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px' }}
                        onClick={handleSendOtp}
                      >
                        Resend Code
                      </button>
                    </div>
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
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label
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
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        boxShadow: 'none',
                      }}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
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
                      className="form-control"
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        boxShadow: 'none',
                      }}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                      required
                    />
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
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Resetting...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              )}

              <div className="text-center mt-4 pt-2">
                <Link
                  to="/login"
                  style={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  <i className="fas fa-arrow-left me-2" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
