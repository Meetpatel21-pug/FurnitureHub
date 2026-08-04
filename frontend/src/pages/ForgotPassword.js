import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ForgotPassword = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { isDarkTheme } = useTheme();
  const navigate = useNavigate();

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.requestPasswordReset(email);
      toast.success(response.data.message);
      setStep('reset');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (password !== passwordConfirm) return toast.error('Passwords do not match.');
    setLoading(true);
    const result = await resetPassword({ email, otp, password });
    setLoading(false);
    if (result.success) {
      toast.success('Password changed. You are now signed in.');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  const textClass = isDarkTheme ? 'text-white' : 'text-dark';
  const inputStyle = { background: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#fff', color: isDarkTheme ? '#fff' : '#0f172a', borderRadius: '10px' };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: isDarkTheme ? 'linear-gradient(180deg, #0f172a, #111827)' : 'linear-gradient(180deg, #f8fafc, #eef2ff)', paddingTop: '80px' }}>
      <div className="container py-5"><div className="row justify-content-center"><div className="col-md-6 col-lg-4">
        <div className="card border-0" style={{ background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.96)', borderRadius: '20px', boxShadow: '0 12px 32px rgba(15,23,42,0.12)' }}>
          <div className="card-body p-5">
            <div className="text-center mb-4"><i className="fas fa-key mb-3" style={{ fontSize: '2.5rem', color: '#667eea' }}></i><h2 className={textClass}>Reset Password</h2><p className={isDarkTheme ? 'text-muted' : 'text-secondary'}>{step === 'email' ? 'We will email you a one-time password.' : `Enter the OTP sent to ${email}.`}</p></div>
            {step === 'email' ? <form onSubmit={requestOtp}>
              <div className="mb-4"><label className={`form-label fw-bold ${textClass}`} htmlFor="email">Email address</label><input id="email" type="email" className="form-control" style={inputStyle} value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></div>
              <button className="btn w-100 fw-bold" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', borderRadius: '10px', padding: '12px' }} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
            </form> : <form onSubmit={submitReset}>
              <div className="mb-3"><label className={`form-label fw-bold ${textClass}`} htmlFor="otp">OTP</label><input id="otp" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" className="form-control" style={inputStyle} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} required /></div>
              <div className="mb-3"><label className={`form-label fw-bold ${textClass}`} htmlFor="new-password">New password</label><input id="new-password" type="password" minLength="6" className="form-control" style={inputStyle} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></div>
              <div className="mb-4"><label className={`form-label fw-bold ${textClass}`} htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" minLength="6" className="form-control" style={inputStyle} value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} required autoComplete="new-password" /></div>
              <button className="btn w-100 fw-bold" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', borderRadius: '10px', padding: '12px' }} disabled={loading}>{loading ? 'Resetting...' : 'Reset password and sign in'}</button>
              <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setStep('email')} disabled={loading}>Use a different email</button>
            </form>}
            <div className="text-center mt-4"><Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Back to sign in</Link></div>
          </div>
        </div>
      </div></div></div>
    </div>
  );
};

export default ForgotPassword;
