import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  return (
    <footer className="footer-gradient">
      <div className="footer-container">

        {/* ── Main grid ── */}
        <div className="footer-grid">

          {/* Brand column */}
          <div>
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <i className="fas fa-couch" style={{ color: '#fff', fontSize: 16 }}></i>
              </div>
              FurnitureHub<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <p className="footer-text">
              Transform your living spaces with handcrafted furniture that blends timeless elegance with modern comfort. Premium quality, delivered to your door.
            </p>
            <div className="social-links">
              {[
                { icon: 'fa-facebook-f', href: '#', label: 'Facebook' },
                { icon: 'fa-instagram', href: '#', label: 'Instagram' },
                { icon: 'fa-twitter', href: '#', label: 'Twitter' },
                { icon: 'fa-pinterest-p', href: '#', label: 'Pinterest' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  className="social-link"
                  aria-label={s.label}
                  rel="noopener noreferrer"
                >
                  <i className={`fab ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="footer-heading">Quick Links</h6>
            <ul className="footer-links">
              {[
                { label: 'Home', to: '/' },
                { label: 'Products', to: '/products' },
                { label: 'Room AI', to: '/room-ai' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h6 className="footer-heading">Categories</h6>
            <ul className="footer-links">
              {[
                { label: 'Living Room', slug: 'living-room' },
                { label: 'Bedroom', slug: 'bedroom' },
                { label: 'Dining Room', slug: 'dining-room' },
                { label: 'Office', slug: 'office' },
                { label: 'Storage', slug: 'storage' },
              ].map(c => (
                <li key={c.label}>
                  <Link to={`/products?category=${c.slug}`} className="footer-link">{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h6 className="footer-heading">Get in Touch</h6>
            <div style={{ marginBottom: 24 }}>
              {[
                { icon: 'fa-map-marker-alt', text: '123 Furniture Street, Design City' },
                { icon: 'fa-phone', text: '+91 1234 567 890' },
                { icon: 'fa-envelope', text: 'hello@furniturezone.com' },
              ].map(item => (
                <div className="contact-item" key={item.text}>
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Mini newsletter */}
            <h6 className="footer-heading">Newsletter</h6>
            <form
              onSubmit={e => { e.preventDefault(); setEmail(''); }}
              style={{ display: 'flex', gap: 8 }}
              id="footer-newsletter-form"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                required
                id="footer-newsletter-email"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  border: '1.5px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  minWidth: 0,
                }}
              />
              <button
                type="submit"
                id="footer-newsletter-btn"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  background: 'var(--grad-accent)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* ── Divider + Bottom bar ── */}
        <hr className="footer-divider" />
        <div className="footer-bottom footer-container" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} FurnitureHub. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;