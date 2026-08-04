import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const contactOptions = [
  {
    icon: 'fa-location-dot',
    title: 'Visit the showroom',
    detail: 'LJU College Campus, Ahmedabad',
    meta: 'Gujarat 380015',
  },
  {
    icon: 'fa-phone-volume',
    title: 'Speak with our team',
    detail: '+91 12345 67890',
    meta: 'Mon–Sat, 9:00 AM – 8:00 PM',
    href: 'tel:+911234567890',
  },
  {
    icon: 'fa-envelope',
    title: 'Send an email',
    detail: 'support@furniturezone.com',
    meta: 'A reply within one business day',
    href: 'mailto:support@furniturezone.com',
  },
];

const Contact = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success('Thanks for reaching out! Our team will get back to you soon.');
    event.currentTarget.reset();
  };

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero__content">
            <span className="contact-eyebrow"><i className="fas fa-sparkles"></i> Here when you need us</span>
            <h1>Let’s make your space feel like home.</h1>
            <p>Whether you need product advice, delivery help, or design guidance, our furniture specialists are ready to help.</p>
            <div className="contact-hero__actions">
              <a href="#contact-form" className="contact-primary-button">Send a message <i className="fas fa-arrow-right"></i></a>
              <Link to="/products" className="contact-secondary-button">Explore furniture</Link>
            </div>
          </div>
          <div className="contact-hero__panel" aria-label="Customer support availability">
            <div className="contact-hero__panel-icon"><i className="fas fa-headset"></i></div>
            <span className="contact-status"><span></span> Support team online</span>
            <h2>Expert help, thoughtfully delivered.</h2>
            <p>Connect with a real person for guidance on every room and every detail.</p>
            <div className="contact-hero__availability">
              <i className="far fa-clock"></i>
              <span><strong>Business hours</strong>Monday to Saturday · 9 AM to 8 PM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-details-section">
        <div className="container">
          <div className="contact-section-heading">
            <span>Contact options</span>
            <h2>Choose the way that works for you.</h2>
          </div>
          <div className="contact-options-grid">
            {contactOptions.map(({ icon, title, detail, meta, href }) => (
              <div key={title}>
                <article className="contact-option-card h-100">
                  <div className="contact-option-card__icon"><i className={`fas ${icon}`}></i></div>
                  <h3>{title}</h3>
                  {href ? <a href={href}>{detail}</a> : <p>{detail}</p>}
                  <small>{meta}</small>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-form-section" id="contact-form">
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-lg-5">
              <div className="contact-form-intro">
                <span className="contact-eyebrow">Send a message</span>
                <h2>Tell us how we can help.</h2>
                <p>Share a few details and our team will connect with you within one business day.</p>
                <div className="contact-response-note">
                  <i className="fas fa-shield-heart"></i>
                  <span><strong>Your details stay private.</strong> We only use them to respond to your request.</span>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <form className="contact-form-card" onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label htmlFor="firstName">First name</label>
                    <input id="firstName" name="firstName" type="text" placeholder="Your first name" required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName">Last name</label>
                    <input id="lastName" name="lastName" type="text" placeholder="Your last name" required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="phone">Phone number <span>Optional</span></label>
                    <input id="phone" name="phone" type="tel" placeholder="+91 12345 67890" />
                  </div>
                  <div className="col-12">
                    <label htmlFor="subject">What can we help with?</label>
                    <select id="subject" name="subject" defaultValue="">
                      <option value="" disabled>Select a topic</option>
                      <option>Product enquiry</option>
                      <option>Delivery and order support</option>
                      <option>Design consultation</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="message">Your message</label>
                    <textarea id="message" name="message" rows="5" placeholder="Tell us a little more about what you need..." required></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="contact-primary-button">Send message <i className="fas fa-paper-plane"></i></button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
