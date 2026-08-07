import React from 'react';
import { Link } from 'react-router-dom';

const BecomeASeller = () => {
  const benefits = [
    { icon: <i className="fas fa-box" style={{ fontSize: '1.8rem', color: 'var(--ink)' }}></i>, title: 'List Your Products', desc: 'Showcase your furniture to thousands of buyers across India.' },
    { icon: <i className="fas fa-chart-bar" style={{ fontSize: '1.8rem', color: 'var(--ink)' }}></i>, title: 'Seller Dashboard', desc: 'Track your orders, revenue, and performance in real time.' },
    { icon: <i className="fas fa-wallet" style={{ fontSize: '1.8rem', color: 'var(--ink)' }}></i>, title: 'Grow Your Revenue', desc: 'Reach customers beyond your local area with no upfront cost.' },
    { icon: <i className="fas fa-shield-alt" style={{ fontSize: '1.8rem', color: 'var(--ink)' }}></i>, title: 'Secure Payments', desc: 'Receive payments safely via our verified checkout system.' },
  ];

  return (
    <div
      className="min-vh-100"
      style={{
        background: 'var(--bg-base)',
        paddingTop: '100px',
        paddingBottom: '60px',
      }}
    >
      <div className="container">
        {/* Hero Section */}
        <div className="text-center mb-5" style={{ padding: '60px 20px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '16px' }}>
            Sell with FurnitureZone
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Join our curated marketplace of premium furniture makers and reach thousands of customers who appreciate quality craftsmanship.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/seller/register"
              style={{
                background: 'var(--ink)',
                color: 'var(--bg-base)',
                padding: '16px 40px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Start Selling Today
            </Link>
            <Link
              to="/seller/login"
              style={{
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                padding: '16px 40px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Seller Login
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="row g-4 mb-5">
          {benefits.map((b, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '30px',
                  borderRadius: '12px',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ marginBottom: '20px' }}>{b.icon}</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '12px', fontWeight: 500 }}>
                  {b.title}
                </h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BecomeASeller;
