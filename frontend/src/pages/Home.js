import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mlAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      console.log('KNN Recommendations refreshed:', recommendationsData);
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

            // If there's a new order or first load
            if (!lastOrderTime || orderTime > lastOrderTime) {
              setLastOrderTime(orderTime);
              // Refresh recommendations based on new order
              fetchRecommendations();
            }
          }
        } catch (error) {
          console.error('Error checking orders:', error);
        }
      };

      checkForNewOrders();

      // Poll for new orders every 30 seconds
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

        console.log('KNN Recommendations:', recommendationsData);
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Carousel */}
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div className="hero-slide" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1920&h=800&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '85vh',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 1s ease-in-out'
            }}>
              <div className="container text-center text-white">
                <h1 className="display-2 fw-bold mb-4 animate__animated animate__fadeInUp">Luxury Living Redefined</h1>
                <p className="lead mb-5 animate__animated animate__fadeInUp animate__delay-1s">Transform your home with our exquisite furniture collection</p>
                <Link to="/products" className="btn btn-primary btn-lg px-5 py-3 animate__animated animate__fadeInUp animate__delay-2s">
                  Discover Collection <i className="fas fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <div className="hero-slide" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&h=800&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '85vh',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 1s ease-in-out'
            }}>
              <div className="container text-center text-white">
                <h1 className="display-2 fw-bold mb-4">Modern Elegance</h1>
                <p className="lead mb-5">Where comfort meets contemporary design</p>
                <Link to="/products" className="btn btn-outline-light btn-lg px-5 py-3">
                  Shop Now <i className="fas fa-shopping-bag ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <div className="hero-slide" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1920&h=800&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '85vh',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 1s ease-in-out'
            }}>
              <div className="container text-center text-white">
                <h1 className="display-2 fw-bold mb-4">Crafted Perfection</h1>
                <p className="lead mb-5">Premium materials, exceptional craftsmanship</p>
                <Link to="/about" className="btn btn-light btn-lg px-5 py-3">
                  Our Story <i className="fas fa-heart ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Recommended Products */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white">Recommended Products</h2>
            <p className="text-muted">Handpicked selections for you</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {(recommendations.length > 0 ? recommendations : [
              {
                id: 1,
                name: 'Premium Leather Sofa',
                price: 899,
                image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
                knn_score: 9.2,
                category: 'Living Room'
              },
              {
                id: 2,
                name: 'Modern Dining Table',
                price: 649,
                image_url: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop',
                knn_score: 8.7,
                category: 'Dining Room'
              },
              {
                id: 3,
                name: 'Ergonomic Office Chair',
                price: 299,
                image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
                knn_score: 8.4,
                category: 'Office'
              },
              {
                id: 4,
                name: 'Wooden Bookshelf',
                price: 399,
                image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop',
                knn_score: 8.1,
                category: 'Storage'
              },
              {
                id: 5,
                name: 'Queen Size Bed Frame',
                price: 799,
                image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop',
                knn_score: 7.9,
                category: 'Bedroom'
              },
              {
                id: 6,
                name: 'Glass Coffee Table',
                price: 449,
                image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
                knn_score: 7.6,
                category: 'Living Room'
              }
            ]).slice(0, 6).map((product, index) => (
              <div key={product.id || index}>
                <div className="modern-product-card">
                  <div className="product-image-container">
                    <img
                      src={product.image_url || '/api/placeholder/300/200'}
                      className="product-image"
                      alt={product.name}
                    />
                    {product.order_count > 0 && (
                      <div className="stock-badge bg-success text-white">
                        <i className="fas fa-arrow-up me-1"></i>
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="product-content">
                    <div className="product-category">{product.category}</div>
                    <h3 className="product-title">
                      <Link to={`/products/${product.slug || product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="product-price">
                      <span className="current-price">₹{parseFloat(product.price).toFixed(0)}</span>
                    </div>
                    <div className="product-actions">
                      <Link to={`/products/${product.slug || product.id}`} className="add-to-cart-btn text-decoration-none">
                        {product.order_count > 0 ? (
                          <>
                            <i className="fas fa-fire me-2"></i>Popular Choice
                          </>
                        ) : (
                          <>
                            <i className="fas fa-thumbs-up me-2"></i>Recommended
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;