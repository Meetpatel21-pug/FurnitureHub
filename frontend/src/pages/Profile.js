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

  if (!isAuthenticated) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5 bg-light">
          <div className="container text-center">
            <div className="modern-product-card">
              <div className="product-content">
                <i className="fas fa-user-lock fa-3x text-primary mb-3"></i>
                <h2 className="product-title">Access Required</h2>
                <p className="text-muted">Please login to view your profile</p>
                <button className="btn btn-primary btn-lg px-5 py-3">
                  <i className="fas fa-sign-in-alt me-2"></i>Login
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', paddingTop: '100px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading Profile...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '100px'}}>
      {/* Profile Header */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="fw-bold text-dark">My Profile</h1>
            <p className="text-muted">Manage your account information</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-4 mb-4">
              <div className="modern-product-card text-center">
                <div className="product-image-container">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                       style={{width: '120px', height: '120px'}}>
                    <i className="fas fa-user fa-3x text-white"></i>
                  </div>
                </div>
                <div className="product-content">
                  <h4 className="product-title">{profile.user.first_name} {profile.user.last_name}</h4>
                  <div className="product-category">@{profile.user.username}</div>
                  <p className="text-muted small">{profile.user.email}</p>
                  <div className="badge bg-success">Active Member</div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-8">
              <div className="modern-product-card">
                <div className="product-content">
                  <h4 className="product-title mb-4">Personal Information</h4>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-dark">First Name</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          name="first_name"
                          value={profile.user.first_name || ''}
                          onChange={(e) => setProfile({...profile, user: {...profile.user, first_name: e.target.value}})}
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">Last Name</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          name="last_name"
                          value={profile.user.last_name || ''}
                          onChange={(e) => setProfile({...profile, user: {...profile.user, last_name: e.target.value}})}
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">Username</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          name="username"
                          value={profile.user.username || ''}
                          onChange={(e) => setProfile({...profile, user: {...profile.user, username: e.target.value}})}
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">Email</label>
                        <input
                          type="email"
                          className="form-control border-dark"
                          name="email"
                          value={profile.user.email || ''}
                          onChange={(e) => setProfile({...profile, user: {...profile.user, email: e.target.value}})}
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label text-dark">Phone</label>
                        <input
                          type="tel"
                          className="form-control border-dark"
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="date_of_birth" className="form-label text-dark">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control border-dark"
                          id="date_of_birth"
                          name="date_of_birth"
                          value={profile.date_of_birth}
                          onChange={handleChange}
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="address" className="form-label text-dark">Address</label>
                        <textarea
                          className="form-control border-dark"
                          id="address"
                          name="address"
                          rows="3"
                          value={profile.address}
                          onChange={handleChange}
                          placeholder="Enter your complete address"
                          style={{color: '#333'}}
                        ></textarea>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="city" className="form-label text-dark">City</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          id="city"
                          name="city"
                          value={profile.city}
                          onChange={handleChange}
                          placeholder="City"
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="state" className="form-label text-dark">State</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          id="state"
                          name="state"
                          value={profile.state}
                          onChange={handleChange}
                          placeholder="State"
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="pincode" className="form-label text-dark">Pincode</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          id="pincode"
                          name="pincode"
                          value={profile.pincode}
                          onChange={handleChange}
                          placeholder="110001"
                          style={{color: '#333'}}
                        />
                      </div>
                      <div className="col-12 text-center mt-4">
                        <button
                          type="submit"
                          className="btn btn-dark btn-lg px-5 py-3"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>Update Profile
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;