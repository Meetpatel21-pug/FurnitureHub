import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been sent successfully.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--ink)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero Section */}
      <section
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=800&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '120px 0',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '12px' }}>
            REACH OUT TO US
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '0.04em' }}>
            Contact Us
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Get in touch with our furniture experts for inquiries, custom orders, or showroom visits.
          </p>
          <Link
            to="/products"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              border: '1px solid #ffffff',
              background: 'transparent',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff'; }}
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section style={{ padding: '80px 0', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '8px' }}>
              GET IN TOUCH
            </h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', margin: 0 }}>
              We'd love to hear from you
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '0', background: 'transparent', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <i className="fas fa-store" style={{ fontSize: '20px', color: 'var(--ink)' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px', letterSpacing: '0.02em' }}>
                  Visit Our Store
                </h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                  LJU College Campus<br />Ahmedabad, Gujarat 380015
                </p>
              </div>
            </div>

            <div>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '0', background: 'transparent', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <i className="fas fa-phone-alt" style={{ fontSize: '20px', color: 'var(--ink)' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px', letterSpacing: '0.02em' }}>
                  Call Us
                </h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                  +91 1234567890<br />Mon-Sat: 9AM - 8PM
                </p>
              </div>
            </div>

            <div>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '0', background: 'transparent', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <i className="fas fa-envelope-open" style={{ fontSize: '20px', color: 'var(--ink)' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px', letterSpacing: '0.02em' }}>
                  Email Us
                </h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                  info@furniturezone.com<br />support@furniturezone.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section style={{ padding: '80px 0', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '8px' }}>
              SEND US A MESSAGE
            </h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', margin: 0 }}>
              We'll get back to you within 24 hours
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '60px' }}>
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Your first name"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Your last name"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div className="col-12">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help you?"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div className="col-12">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us more about your inquiry..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  ></textarea>
                </div>
                <div className="col-12 text-center mt-5">
                  <button
                    type="submit"
                    style={{
                      padding: '16px 48px',
                      background: 'var(--ink)',
                      color: 'var(--bg-base)',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink-muted)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ink)'; }}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section style={{ padding: '80px 0', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '8px' }}>
              FIND US
            </h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', margin: 0 }}>
              Visit our showroom for the best experience
            </p>
          </div>
          <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
            <iframe
              title="FurnitureZone Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5234567890123!2d72.5234567890123!3d23.0234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f5b5b5b5b5%3A0xc5f6c3b7b5b5b5b5!2sLJU%20College%2C%20Ahmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1635000000000!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0, display: 'block', filter: 'grayscale(100%) invert(100%) contrast(120%)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;