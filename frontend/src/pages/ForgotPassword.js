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
            <div className="card border-0" style={cardStyle}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-lock mb-3" style={{ fontSize: '3rem', background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
                  <h2 className={`mb-2 ${isDarkTheme ? 'text-white' : 'text-dark'}`}>
                    {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                  </h2>
                  <p className={isDarkTheme ? 'text-muted' : 'text-secondary'}>
                    {step === 1 && 'Enter your email to receive an OTP'}
                    {step === 2 && `OTP sent to ${email}`}
                    {step === 3 && 'Enter your new password'}
                  </p>
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                  <form onSubmit={handleSendOtp}>
                    <div className="mb-4">
                      <label className={`form-label fw-bold ${isDarkTheme ? 'text-white' : 'text-dark'}`}>Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        style={inputStyle}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>
                    <button type="submit" className="btn w-100 fw-bold" style={btnStyle} disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : <><i className="fas fa-paper-plane me-2"></i>Send OTP</>}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-4">
                      <label className={`form-label fw-bold ${isDarkTheme ? 'text-white' : 'text-dark'}`}>Enter OTP</label>
                      <input
                        type="text"
                        className="form-control text-center"
                        style={{ ...inputStyle, fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="------"
                        maxLength={6}
                        required
                      />
                      <div className="text-end mt-2">
                        <button type="button" className="btn btn-link btn-sm p-0" style={{ color: '#667eea' }} onClick={handleSendOtp}>
                          Resend OTP
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="btn w-100 fw-bold" style={btnStyle} disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</> : <><i className="fas fa-check me-2"></i>Verify OTP</>}
                    </button>
                  </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <label className={`form-label fw-bold ${isDarkTheme ? 'text-white' : 'text-dark'}`}>New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        style={inputStyle}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className={`form-label fw-bold ${isDarkTheme ? 'text-white' : 'text-dark'}`}>Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        style={inputStyle}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <button type="submit" className="btn w-100 fw-bold" style={btnStyle} disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</> : <><i className="fas fa-key me-2"></i>Reset Password</>}
                    </button>
                  </form>
                )}

                <div className="text-center mt-4">
                  <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                    <i className="fas fa-arrow-left me-1"></i>Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
