import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState({
    user: {},
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    date_of_birth: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        first_name: profile.user.first_name,
        last_name: profile.user.last_name,
        username: profile.user.username,
        email: profile.user.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        date_of_birth: profile.date_of_birth
      };
      
      await userAPI.updateProfile(updateData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  };

  const labelStyle = {
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--ink)',
    display: 'block',
    marginBottom: '8px'
  };

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
        <div className="container py-5 text-center">
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
            <i className="fas fa-user-lock fa-3x mb-4" style={{ color: 'var(--ink)' }}></i>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, marginBottom: '16px' }}>Access Required</h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '32px' }}>Please login to view your profile</p>
            <button 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 32px',
                background: 'var(--ink)',
                color: 'var(--bg-base)',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink-muted)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ink)'; }}
            >
              <i className="fas fa-sign-in-alt me-2"></i>Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--ink)' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, letterSpacing: '0.1em' }}>LOADING PROFILE...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--ink)' }}>
      <section className="py-5">
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className="text-center mb-5">
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', display: 'block', marginBottom: '8px' }}>
              ACCOUNT SETTINGS
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: 0 }}>
              My Profile
            </h1>
          </div>
          
          <div className="row g-4 justify-content-center">
            {/* Sidebar Profile Card */}
            <div className="col-lg-4">
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '40px 24px', textAlign: 'center', height: '100%' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: 'transparent',
                  border: '1px solid var(--border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto' 
                }}>
                  <i className="fas fa-user" style={{ fontSize: '40px', color: 'var(--ink)' }}></i>
                </div>
                
                <h4 style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
                  {profile.user.first_name} {profile.user.last_name}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  @{profile.user.username}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  {profile.user.email}
                </p>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '6px 16px', 
                  background: 'transparent', 
                  border: '1px solid var(--border)', 
                  color: 'var(--ink)', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  letterSpacing: '0.1em', 
                  textTransform: 'uppercase' 
                }}>
                  Active Member
                </div>
              </div>
            </div>
            
            {/* Main Form Area */}
            <div className="col-lg-8">
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '40px' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  Personal Information
                </h4>
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label style={labelStyle}>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={profile.user.first_name || ''}
                        onChange={(e) => setProfile({...profile, user: {...profile.user, first_name: e.target.value}})}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={profile.user.last_name || ''}
                        onChange={(e) => setProfile({...profile, user: {...profile.user, last_name: e.target.value}})}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={profile.user.username || ''}
                        onChange={(e) => setProfile({...profile, user: {...profile.user, username: e.target.value}})}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profile.user.email || ''}
                        onChange={(e) => setProfile({...profile, user: {...profile.user, email: e.target.value}})}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="phone" style={labelStyle}>Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="date_of_birth" style={labelStyle}>Date of Birth</label>
                      <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={profile.date_of_birth}
                        onChange={handleChange}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="address" style={labelStyle}>Address</label>
                      <textarea
                        id="address"
                        name="address"
                        rows="3"
                        value={profile.address}
                        onChange={handleChange}
                        placeholder="Enter your complete address"
                        style={{ ...inputStyle, resize: 'vertical' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      ></textarea>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="city" style={labelStyle}>City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={profile.city}
                        onChange={handleChange}
                        placeholder="City"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="state" style={labelStyle}>State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={profile.state}
                        onChange={handleChange}
                        placeholder="State"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="pincode" style={labelStyle}>Pincode</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={profile.pincode}
                        onChange={handleChange}
                        placeholder="110001"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-12 text-center mt-5">
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          padding: '16px 48px',
                          background: 'var(--ink)',
                          color: 'var(--bg-base)',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: saving ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => { if(!saving) e.currentTarget.style.background = 'var(--ink-muted)'; }}
                        onMouseLeave={(e) => { if(!saving) e.currentTarget.style.background = 'var(--ink)'; }}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Updating...
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;