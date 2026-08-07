import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mlAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
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
        const recommendationsRes = await mlAPI.getRecommendations('knn', 6).catch(() => ({ data: { recommendations: [] } }));
        const recommendationsData = recommendationsRes.data.recommendations || [];
        setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh', background: 'var(--bg-base)' }}>
        <div className="spinner-border text-dark" role="status" style={{ width: '2rem', height: '2rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const defaultProducts = [
    {
      id: 1,
      name: 'Wonban Dining Table',
      price: 899,
      image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=450&fit=crop',
      category: 'Dining Table'
    },
    {
      id: 2,
      name: 'Baekja Lounge Chair',
      price: 649,
      image_url: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=600&h=450&fit=crop',
      category: 'Lounge Chair'
    },
    {
      id: 3,
      name: 'Cheongja Console',
      price: 1299,
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop',
      category: 'Console'
    },
    {
      id: 4,
      name: 'Soban Side Table',
      price: 399,
      image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=450&fit=crop',
      category: 'Side Table'
    },
    {
      id: 5,
      name: 'Minimalist Bed Frame',
      price: 1499,
      image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=450&fit=crop',
      category: 'Bed'
    },
    {
      id: 6,
      name: 'Heritage Low Bench',
      price: 549,
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop',
      category: 'Bench'
    }
  ];

  const displayList = recommendations.length > 0 ? recommendations : defaultProducts;

  return (
    <div style={{ background: 'var(--bg-base)' }}>
      {/* ── Editorial Hero Section ── */}
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="6000" style={{ position: 'relative' }}>
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