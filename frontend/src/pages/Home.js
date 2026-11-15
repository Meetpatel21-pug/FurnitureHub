import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mlAPI, ordersAPI, productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import CollectionSlider from '../components/CollectionSlider';

const Home = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [dbFallback, setDbFallback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderTime, setLastOrderTime] = useState(null);

  // Function to fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const recommendationsRes = await mlAPI.getRecommendations('knn', 6);
      const recommendationsData = recommendationsRes.data.recommendations || [];
      setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, []);

  // Check for recent orders to refresh recommendations
  useEffect(() => {
    if (user) {
      const checkForNewOrders = async () => {
        try {
          const ordersRes = await ordersAPI.getHistory();
          const orders = ordersRes.data || [];

          if (orders.length > 0) {
            const latestOrder = orders[0];
            const orderTime = new Date(latestOrder.created_at).getTime();

            if (!lastOrderTime || orderTime > lastOrderTime) {
              setLastOrderTime(orderTime);
              fetchRecommendations();
            }
          }
        } catch (error) {
          console.error('Error checking orders:', error);
        }
      };

      checkForNewOrders();
      const interval = setInterval(checkForNewOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user, lastOrderTime, fetchRecommendations]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recommendationsRes, productsRes] = await Promise.all([
          mlAPI.getRecommendations('knn', 10).catch(() => ({ data: { recommendations: [] } })),
          productsAPI.getAll({ limit: 10 })
        ]);
        const recommendationsData = recommendationsRes.data.recommendations || [];
        setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);

        const productsData = productsRes.data?.results || productsRes.data || [];
        setDbFallback(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Automatic 4-second loop carousel slider
  useEffect(() => {
    if (loading) return;
    const carouselEl = document.getElementById('heroCarousel');
    if (!carouselEl) return;

    let carouselInstance = null;
    if (window.bootstrap && window.bootstrap.Carousel) {
      carouselInstance = window.bootstrap.Carousel.getOrCreateInstance(carouselEl, {
        interval: 4000,
        ride: 'carousel',
        pause: false,
        wrap: true,
      });
      carouselInstance.cycle();
    }

    const timer = setInterval(() => {
      const nextBtn = carouselEl.querySelector('.carousel-control-next');
      if (nextBtn) nextBtn.click();
    }, 4000);

    return () => {
      clearInterval(timer);
      if (carouselInstance && typeof carouselInstance.dispose === 'function') {
        carouselInstance.dispose();
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh', background: 'var(--bg-base)' }}>
        <div className="spinner-border text-dark" role="status" style={{ width: '2rem', height: '2rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const availableFilter = (p) => p && p.available !== false && (p.stock === undefined || p.stock > 0);
  const rawList = recommendations.length > 0 ? recommendations : dbFallback;
  const displayList = rawList.filter(availableFilter).slice(0, 6);



  return (
    <div style={{ background: 'var(--bg-base)' }}>
      {/* ── Editorial Hero Section ── */}
      <div id="heroCarousel" className="carousel slide" style={{ position: 'relative' }}>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url(https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1920&h=1080&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: '100px',
              }}
            >
              <div className="container" style={{ maxWidth: '1400px' }}>
                <div style={{ maxWidth: '650px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    EASTERN ESSENCE &amp; MODERN MINIMALISM
                  </span>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 300, color: '#fff', lineHeight: 1.05, margin: '16px 0 24px 0' }}>
                    Structure &amp; Silence.
                  </h1>
                  <Link
                    to="/products"
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      border: '1px solid #ffffff',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
                  >
                    DISCOVER COLLECTION
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="carousel-item">
            <div
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&h=1080&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: '100px',
              }}
            >
              <div className="container" style={{ maxWidth: '1400px' }}>
                <div style={{ maxWidth: '650px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    CRAFTED PERFECTION
                  </span>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 300, color: '#fff', lineHeight: 1.05, margin: '16px 0 24px 0' }}>
                    Harmonious Living Space.
                  </h1>
                  <Link
                    to="/products"
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      border: '1px solid #ffffff',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
                  >
                    EXPLORE NOW
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal slide controls */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="prev"
          style={{ width: '5%', opacity: 0.7 }}
        >
          <span className="carousel-control-prev-icon" />
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="next"
          style={{ width: '5%', opacity: 0.7 }}
        >
          <span className="carousel-control-next-icon" />
        </button>
      </div>

      {/* ── Shop Our Collections Section (Eastern Edition Style) ── */}
      <CollectionSlider />

      {/* ── Featured Selections Section ── */}
      <section style={{ padding: '100px 0 120px 0', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          {/* Editorial Section Header */}
          <div className="d-flex justify-content-between align-items-flex-end mb-5 flex-wrap gap-3">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-light)', display: 'block', marginBottom: '8px' }}>
                CURATED SELECTIONS
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
                Recommended Furniture
              </h2>
            </div>
            <Link
              to="/products"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--ink)',
                paddingBottom: '2px',
              }}
            >
              VIEW ALL PRODUCTS ({displayList.length}) &rarr;
            </Link>
          </div>

          {/* Flat 3-column gallery grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '40px 30px',
            }}
          >
            {displayList.slice(0, 6).map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;