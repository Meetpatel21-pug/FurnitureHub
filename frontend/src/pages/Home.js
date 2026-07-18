import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, mlAPI, ordersAPI, roomAIAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const backendBaseUrl = 'http://127.0.0.1:8000';

const resolveMediaUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${backendBaseUrl}${value}`;
};

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderTime, setLastOrderTime] = useState(null);
  const [roomImage, setRoomImage] = useState(null);
  const [roomImagePreview, setRoomImagePreview] = useState('');
  const [roomHint, setRoomHint] = useState('');
  const [styleHint, setStyleHint] = useState('');
  const [budget, setBudget] = useState('');
  const [analyzingRoom, setAnalyzingRoom] = useState(false);
  const [roomAnalysis, setRoomAnalysis] = useState(null);

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

  const roomPreviewUrl = useMemo(() => {
    return resolveMediaUrl(roomAnalysis?.preview?.annotated_image_url) || roomImagePreview;
  }, [roomAnalysis, roomImagePreview]);

  const handleRoomImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setRoomImage(null);
      setRoomImagePreview('');
      return;
    }

    setRoomImage(file);
    setRoomImagePreview(URL.createObjectURL(file));
  };

  const handleRoomAnalyze = async (event) => {
    event.preventDefault();

    if (!roomImage) {
      toast.error('Choose a room image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', roomImage);
    if (budget) formData.append('budget', budget);
    if (styleHint) formData.append('style', styleHint);
    if (roomHint) formData.append('room_hint', roomHint);

    try {
      setAnalyzingRoom(true);
      const response = await roomAIAPI.analyzeRoom(formData);
      setRoomAnalysis(response.data);
      toast.success('Room analysis ready.');
    } catch (error) {
      console.error('Room analysis failed:', error);
      toast.error(error.response?.data?.error || 'Unable to analyze the room image.');
    } finally {
      setAnalyzingRoom(false);
    }
  };

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
        const [productsRes, categoriesRes, recommendationsRes] = await Promise.all([
          productsAPI.getAll({ limit: 8 }),
          productsAPI.getCategories(),
          mlAPI.getRecommendations('knn', 6).catch(() => ({ data: { recommendations: [] } }))
        ]);
        
        const productsData = productsRes.data.results || productsRes.data || [];
        const categoriesData = categoriesRes.data || [];
        const recommendationsData = recommendationsRes.data.recommendations || [];
        
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);
        
        console.log('KNN Recommendations:', recommendationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
        setCategories([]);
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
          <div className="row g-4">
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
              <div key={product.id || index} className="col-6 col-md-6 col-lg-4">
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

      {/* Room AI Quick Analyzer */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <div className="p-4 rounded-4 border h-100" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.16em', color: '#8bd3ff' }}>Room AI</p>
                <h2 className="fw-bold text-white mb-3">Upload a room photo and preview furniture suggestions right here.</h2>
                <p className="text-white-50 mb-4">The same vision pipeline powers the dedicated analyzer page and gives you a quick-start version on the home page.</p>

                <form onSubmit={handleRoomAnalyze} className="d-grid gap-3">
                  <label className="btn btn-outline-light btn-lg py-3 text-start position-relative overflow-hidden" style={{ borderStyle: 'dashed' }}>
                    <input type="file" accept="image/*" onChange={handleRoomImageChange} className="position-absolute top-0 start-0 w-100 h-100 opacity-0" />
                    <span className="d-block fw-semibold">Choose room image</span>
                    <span className="d-block small text-white-50">JPG, PNG, or WebP</span>
                  </label>

                  <div className="row g-2">
                    <div className="col-6">
                      <input type="text" className="form-control form-control-lg" placeholder="Room hint" value={roomHint} onChange={(e) => setRoomHint(e.target.value)} />
                    </div>
                    <div className="col-6">
                      <input type="text" className="form-control form-control-lg" placeholder="Style hint" value={styleHint} onChange={(e) => setStyleHint(e.target.value)} />
                    </div>
                  </div>

                  <input type="number" min="0" className="form-control form-control-lg" placeholder="Budget (optional)" value={budget} onChange={(e) => setBudget(e.target.value)} />

                  <button className="btn btn-primary btn-lg py-3" type="submit" disabled={analyzingRoom}>
                    {analyzingRoom ? 'Analyzing...' : 'Analyze Room'}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="rounded-4 border p-3 p-md-4 h-100" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h4 text-white mb-1">Latest analysis</h3>
                    <p className="text-white-50 mb-0">Detections, room type, and ranked furniture picks</p>
                  </div>
                  {roomAnalysis?.room_type && (
                    <div className="badge rounded-pill text-bg-info text-dark px-3 py-2">
                      {roomAnalysis.room_type.replace('_', ' ')}
                    </div>
                  )}
                </div>

                <div className="rounded-4 overflow-hidden border mb-4" style={{ minHeight: '320px', background: 'rgba(15,23,42,0.86)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  {roomPreviewUrl ? (
                    <img src={roomPreviewUrl} alt="Room preview" className="w-100 h-100" style={{ objectFit: 'cover', minHeight: '320px' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 p-5 text-center text-white-50">
                      Upload a room image here to see the analysis result without leaving the home page.
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  {(roomAnalysis?.recommendations || recommendations.slice(0, 3)).map((item, index) => {
                    const score = Number(item.score || item.knn_score || 0);
                    return (
                      <div key={`${item.product_id || item.id}-${index}`} className="col-md-4">
                        <div className="rounded-4 border h-100 p-3" style={{ background: 'rgba(15,23,42,0.72)', borderColor: 'rgba(255,255,255,0.08)' }}>
                          <img
                            src={resolveMediaUrl(item.image_url) || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop'}
                            alt={item.name}
                            className="w-100 rounded-3 mb-3"
                            style={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
                          />
                          <div className="text-white-50 small mb-1">{item.category || 'Furniture'}</div>
                          <h4 className="h6 text-white mb-2">{item.name}</h4>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-info fw-bold">₹{Math.round(Number(item.price || 0))}</span>
                            <span className="badge text-bg-secondary">{score.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Featured Products</h2>
            <p className="text-muted">Handpicked favorites from our collection</p>
          </div>
          <div className="row g-4">
            {Array.isArray(products) && products.length > 0 ? (
              products.slice(0, 8).map(product => (
                <div key={product.id} className="col-6 col-md-6 col-lg-3">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  No products available. Please start the backend server.
                </div>
              </div>
            )}
          </div>
          <div className="text-center mt-5">
            <Link to="/products" className="btn btn-primary btn-lg px-5">
              View All Products <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;