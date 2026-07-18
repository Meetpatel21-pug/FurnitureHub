import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div>
      {/* Hero Section */}
      <div id="contactCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div className="hero-slide" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=800&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '85vh',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div className="container text-center text-white">
                <h1 className="display-2 fw-bold mb-4">Contact Us</h1>
                <p className="lead mb-5">Get in touch with our furniture experts</p>
                <Link to="/products" className="btn btn-primary btn-lg px-5 py-3">
                  Browse Products <i className="fas fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5 animate__animated animate__fadeInUp">
            <h2 className="fw-bold text-dark">Get In Touch</h2>
            <p className="text-muted">We'd love to hear from you</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="modern-product-card text-center h-100 animate__animated animate__fadeInUp animate__delay-1s">
                <div className="mb-3">
                  <i className="fas fa-store fa-3x text-primary"></i>
                </div>
                <div className="product-content">
                  <h4 className="product-title" style={{color: '#333'}}>Visit Our Store</h4>
                  <p className="text-dark">LJU College Campus<br/>Ahmedabad, Gujarat 380015</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="modern-product-card text-center h-100 animate__animated animate__fadeInUp animate__delay-2s">
                <div className="mb-3">
                  <i className="fas fa-phone-alt fa-3x text-primary"></i>
                </div>
                <div className="product-content">
                  <h4 className="product-title" style={{color: '#333'}}>Call Us</h4>
                  <p className="text-dark">+91 1234567890<br/>Mon-Sat: 9AM-8PM</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="modern-product-card text-center h-100 animate__animated animate__fadeInUp animate__delay-3s">
                <div className="mb-3">
                  <i className="fas fa-envelope-open fa-3x text-primary"></i>
                </div>
                <div className="product-content">
                  <h4 className="product-title" style={{color: '#333'}}>Email Us</h4>
                  <p className="text-dark">info@furniturezone.com<br/>support@furniturezone.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5 animate__animated animate__fadeInUp">
            <h2 className="fw-bold">Send Us A Message</h2>
            <p className="text-muted">We'll get back to you within 24 hours</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="modern-product-card animate__animated animate__fadeInUp animate__delay-1s">
                <div className="product-content">
                  <form>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-dark">First Name</label>
                        <input type="text" className="form-control border-dark" placeholder="Your first name" style={{color: '#333'}} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">Last Name</label>
                        <input type="text" className="form-control border-dark" placeholder="Your last name" style={{color: '#333'}} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">Email</label>
                        <input type="email" className="form-control border-dark" placeholder="your.email@example.com" style={{color: '#333'}} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">Phone</label>
                        <input type="tel" className="form-control border-dark" placeholder="+91 1234567890" style={{color: '#333'}} />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-dark">Subject</label>
                        <input type="text" className="form-control border-dark" placeholder="How can we help you?" style={{color: '#333'}} />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-dark">Message</label>
                        <textarea className="form-control border-dark" rows="5" placeholder="Tell us more about your inquiry..." style={{color: '#333'}}></textarea>
                      </div>
                      <div className="col-12 text-center">
                        <button type="submit" className="btn btn-dark btn-lg px-5 py-3">
                          <i className="fas fa-paper-plane me-2"></i>Send Message
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

      {/* Map Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5 animate__animated animate__fadeInUp">
            <h2 className="fw-bold text-dark">Find Us</h2>
            <p className="text-muted">Visit our showroom for the best experience</p>
          </div>
          <div className="modern-product-card animate__animated animate__fadeInUp animate__delay-1s">
            <div className="product-image-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5234567890123!2d72.5234567890123!3d23.0234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f5b5b5b5b5%3A0xc5f6c3b7b5b5b5b5!2sLJU%20College%2C%20Ahmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1635000000000!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{border: 0, borderRadius: '15px'}}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;