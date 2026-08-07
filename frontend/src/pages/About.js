import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div>
      {/* Hero Carousel */}
      <div id="aboutCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div className="hero-slide" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=800&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '85vh',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div className="container text-center text-white">
                <h1 className="display-2 fw-bold mb-4">About FurnitureHub</h1>
                <p className="lead mb-5">Creating beautiful spaces since 2008 with premium furniture</p>
                <Link to="/products" className="btn btn-primary btn-lg px-5 py-3">
                  Discover Our Story <i className="fas fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-5" style={{ background: 'var(--bg-base)' }}>
        <div className="container">
          <div className="text-center mb-5 animate__animated animate__fadeInUp">
            <h2 className="fw-bold" style={{ color: 'var(--ink)' }}>Our Story</h2>
            <p className="text-muted">15 years of transforming homes</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {/* Mission */}
            <div className="modern-product-card">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop"
                alt="Our showroom"
                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
              />
              <div className="product-content">
                <h3 className="product-title" style={{ color: 'var(--ink)' }}>Our Mission</h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>To provide high-quality, affordable furniture that transforms houses into homes. We believe everyone deserves beautiful living spaces.</p>
              </div>
            </div>
            {/* Vision */}
            <div className="modern-product-card">
              <img
                src="https://images.unsplash.com/photo-1549497538-303791108f95?w=600&h=400&fit=crop"
                alt="Modern furniture"
                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
              />
              <div className="product-content">
                <h3 className="product-title" style={{ color: 'var(--ink)' }}>Our Vision</h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>To be the leading furniture destination that inspires creativity and comfort in every home across the country.</p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Values */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5 animate__animated animate__fadeInUp">
            <h2 className="fw-bold">Why Choose Us</h2>
            <p className="text-muted">What makes us different</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {/* Premium Quality */}
            <div className="modern-product-card" style={{ textAlign: 'center' }}>
              <div className="product-image-container">
                <img
                  src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop"
                  className="product-image"
                  alt="Quality furniture"
                />
              </div>
              <div className="product-content">
                <h4 className="product-title" style={{ color: 'var(--ink)' }}>Premium Quality</h4>
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>Every piece is carefully selected and tested for durability and comfort.</p>
              </div>
            </div>
            {/* Expert Service */}
            <div className="modern-product-card" style={{ textAlign: 'center' }}>
              <div className="product-image-container">
                <img
                  src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop"
                  className="product-image"
                  alt="Customer service"
                />
              </div>
              <div className="product-content">
                <h4 className="product-title" style={{ color: 'var(--ink)' }}>Expert Service</h4>
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>Our team provides personalized recommendations and exceptional support.</p>
              </div>
            </div>
            {/* Sustainable */}
            <div className="modern-product-card" style={{ textAlign: 'center' }}>
              <div className="product-image-container">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop"
                  className="product-image"
                  alt="Sustainable furniture"
                />
              </div>
              <div className="product-content">
                <h4 className="product-title" style={{ color: 'var(--ink)' }}>Sustainable</h4>
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>Committed to environmental responsibility through eco-friendly materials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>




    </div>
  );
};

export default About;