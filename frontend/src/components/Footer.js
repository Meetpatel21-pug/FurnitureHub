import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  return (
    <footer
      style={{
        background: '#111111',
        color: '#ffffff',
        paddingTop: '80px',
        paddingBottom: '40px',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
      }}
    >
      <div className="container" style={{ maxWidth: '1400px' }}>
        {/* Main Grid */}
        <div className="row g-5 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Newsletter Column */}
          <div className="col-lg-4 col-md-6">
            <div className="mb-3 d-flex align-items-center gap-2">
              <i className="fas fa-cubes" style={{ fontSize: '18px', color: '#fff' }} />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                FURNITUREZONE
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
              style={{ display: 'flex', gap: '0', flexDirection: 'column' }}
              id="footer-newsletter-form"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="SUBSCRIBE TO OUR FURNITUREZONE"
                required
                id="footer-newsletter-email"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.3)',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  outline: 'none',
                  marginBottom: '16px',
                }}
              />
              <button
                type="submit"
                id="footer-newsletter-btn"
                style={{
                  padding: '12px 24px',
                  border: '1px solid #ffffff',
                  background: 'transparent',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

          {/* Contact Column */}
          <div className="col-lg-3 col-md-6">
            <h6
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '20px',
                color: '#fff',
              }}
            >
              CONTACT
            </h6>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
              T. 070. 8129. 1111
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '24px' }}>
              E. contact@furniturezone.com
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
              {['instagram', 'pinterest', 'youtube', 'facebook-f'].map((icon) => (
                <a key={icon} href="#" style={{ color: 'inherit', transition: 'color 0.2s' }}>
                  <i className={`fab fa-${icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Products Column */}
          <div className="col-lg-2 col-md-6">
            <h6
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '20px',
                color: '#fff',
              }}
            >
              PRODUCTS
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Living Room', slug: 'living-room' },
                { label: 'Bedroom', slug: 'bedroom' },
                { label: 'Dining Room', slug: 'dining-room' },
                { label: 'Office', slug: 'office' },
                { label: 'Storage', slug: 'storage' },
              ].map((c) => (
                <li key={c.label}>
                  <Link
                    to={`/products?category=${c.slug}`}
                    style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px' }}
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Service Column */}
          <div className="col-lg-3 col-md-6">
            <h6
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '20px',
                color: '#fff',
              }}
            >
              CLIENT SERVICE &amp; LEGAL
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/become-a-seller" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px' }}>Become a Seller</Link></li>
              <li><Link to="/seller-dashboard" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px' }}>Seller Dashboard</Link></li>
              <li><Link to="/admin-panel" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px' }}>Admin Panel</Link></li>
              <li><Link to="/room-ai" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px' }}>Room AI Generator</Link></li>
              <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px' }}>Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal / Copyright Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
            COMPANY: FurnitureZone. E-MAIL: contact@furniturezone.com
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
            &copy; {new Date().getFullYear()} FURNITUREZONE All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;