import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

const FurnitureViewer = lazy(() => import('../components/FurnitureViewer'));

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const reviewStats = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews
      : Number(product?.average_rating || 0);

    const distribution = [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter((review) => Number(review.rating) === rating).length;
      return {
        rating,
        count,
        percent: totalReviews ? (count / totalReviews) * 100 : 0,
      };
    });

    return {
      totalReviews,
      averageRating,
      distribution,
    };
  }, [reviews, product?.average_rating]);

  const modelUrl = product?.model_url || product?.model_file;
  const previewImageUrl = product?.image_url || product?.image;

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const productRes = await productsAPI.getBySlug(slug);
      const reviewsRes = await reviewsAPI.getByProduct(productRes.data.id).catch(() => ({ data: [] }));
      setProduct(productRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product.id);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to wishlist');
      return;
    }

    const result = await toggleWishlist(product.id);
    if (result.success) {
      toast.success(
        result.action === 'added'
          ? `${product.name} added to wishlist!`
          : `${product.name} removed from wishlist!`
      );
    } else {
      toast.error(result.error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please login to add a review');
      return;
    }

    try {
      await reviewsAPI.add(product.id, reviewForm);
      toast.success('Review added successfully!');
      setReviewForm({ rating: 5, comment: '' });
      fetchProduct();
    } catch (error) {
      toast.error('Failed to add review');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${i <= rating ? 'text-warning' : 'text-secondary'}`}
          style={{ fontSize: '13px', margin: '0 1px' }}
        ></i>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: '#000000', paddingTop: '100px' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, letterSpacing: '0.05em' }}>Loading Product Details...</h4>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ background: '#000000', minHeight: '100vh', paddingTop: '120px' }}>
        <div className="container py-5 text-center">
          <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '60px 24px', maxWidth: '440px', margin: '0 auto' }}>
            <i className="fas fa-couch fa-3x mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}></i>
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, marginBottom: '12px' }}>Product Not Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>The product you are looking for does not exist or has been removed.</p>
            <Link to="/products" className="btn btn-light px-4 py-2" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px' }}>
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000000', minHeight: '100vh', paddingTop: '90px', color: '#ffffff' }}>
      {/* Product Hero Section */}
      <section className="py-5" style={{ background: '#000000' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div className="row g-5 align-items-stretch">
            {/* Left: 3D Viewer & Media */}
            <div className="col-lg-6">
              <div 
                style={{ 
                  background: '#0a0a0a', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '20px', 
                  padding: '24px', 
                  height: '100%', 
                  minHeight: '440px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  position: isFullScreen ? 'fixed' : 'relative',
                  top: isFullScreen ? 0 : 'auto',
                  left: isFullScreen ? 0 : 'auto',
                  width: isFullScreen ? '100vw' : 'auto',
                  height: isFullScreen ? '100vh' : '100%',
                  zIndex: isFullScreen ? 9999 : 1,
                  margin: 0
                }}
              >
                {!show3D ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={previewImageUrl || '/placeholder.png'} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    />
                    {modelUrl && (
                      <button 
                        onClick={() => setShow3D(true)}
                        style={{ 
                          position: 'absolute', 
                          bottom: '20px', 
                          right: '20px', 
                          background: 'rgba(0,0,0,0.65)', 
                          backdropFilter: 'blur(12px)', 
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.15)', 
                          color: '#ffffff', 
                          padding: '10px 20px', 
                          borderRadius: '30px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; 
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'; 
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = 'rgba(0,0,0,0.65)'; 
                          e.currentTarget.style.transform = 'scale(1) translateY(0)'; 
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                        }}
                      >
                        <i className="fas fa-cube"></i> View in 3D
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Suspense
                      fallback={
                        <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div className="spinner-border text-light mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }} />
                          <h5 style={{ color: '#fff', fontWeight: 400 }}>Loading 3D Furniture Viewer</h5>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Preparing 3D model geometry...</p>
                        </div>
                      }
                    >
                      <FurnitureViewer
                        name={product.name}
                        category={product.category?.name}
                        modelUrl={modelUrl}
                        posterUrl={previewImageUrl}
                        fallbackImage={previewImageUrl}
                      />
                    </Suspense>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '10px', zIndex: 10 }}>
                      <button 
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        style={{ 
                          background: 'rgba(0,0,0,0.5)', 
                          backdropFilter: 'blur(10px)', 
                          border: '1px solid rgba(255,255,255,0.2)', 
                          color: '#fff', 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
                      >
                        <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
                      </button>
                      <button 
                        onClick={() => { setShow3D(false); setIsFullScreen(false); }}
                        style={{ 
                          background: 'rgba(0,0,0,0.5)', 
                          backdropFilter: 'blur(10px)', 
                          border: '1px solid rgba(255,255,255,0.2)', 
                          color: '#fff', 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title="Close 3D View"
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#ff6b6b'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.color = '#fff'; }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Meta & Purchase Panel */}
            <div className="col-lg-6">
              <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Category & Ratings & Seller Badge */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <i className="fas fa-tag me-2" style={{ fontSize: '10px' }}></i>{product.category?.name || 'Furniture'}
                      </span>
                      {product.vendor_info && (
                        <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: '11px', fontWeight: 600, padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(167,139,250,0.3)' }}>
                          <i className="fas fa-store me-1"></i> {product.vendor_info.store_name}
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex">
                        {renderStars(Math.round(product.average_rating || 4.5))}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
                        ({product.review_count || reviews.length || 0} reviews)
                      </span>
                    </div>
                  </div>
                  
                  {/* Product Title */}
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 400, color: '#ffffff', lineHeight: 1.15, marginBottom: '20px' }}>
                    {product.name}
                  </h1>
                  
                  {/* Price Banner */}
                  <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
                          Guaranteed Price
                        </span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                          ₹{parseFloat(product.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-end">
                        <div style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                          <i className="fas fa-shipping-fast me-1"></i> Free Express Delivery
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                          <i className="fas fa-shield-alt me-1"></i> 5-Year Structural Warranty
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Description */}
                  <div className="mb-4">
                    <h5 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
                      Product Details
                    </h5>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                      {product.description}
                    </p>
                  </div>
                  
                  {/* Stock Availability Indicator */}
                  <div className="mb-4">
                    {product.stock > 0 ? (
                      <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <i className="fas fa-check-circle" style={{ color: '#4ade80', fontSize: '20px' }}></i>
                        <div>
                          <strong style={{ color: '#4ade80', fontSize: '13px' }}>In Stock</strong>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{product.stock} units available • Ready for dispatch</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <i className="fas fa-times-circle" style={{ color: '#f87171', fontSize: '20px' }}></i>
                        <div>
                          <strong style={{ color: '#f87171', fontSize: '13px' }}>Currently Out of Stock</strong>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Check back soon or explore similar items</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="d-grid gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.available || product.stock === 0}
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: (!product.available || product.stock === 0) ? 'not-allowed' : 'pointer',
                      opacity: (!product.available || product.stock === 0) ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Add to Cart — ₹{parseFloat(product.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </button>

                  <button
                    onClick={handleAddToWishlist}
                    style={{
                      background: 'transparent',
                      color: isInWishlist(product.id) ? '#f87171' : 'rgba(255,255,255,0.7)',
                      border: `1px solid ${isInWishlist(product.id) ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.18)'}`,
                      borderRadius: '10px',
                      padding: '14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <i className={isInWishlist(product.id) ? 'fas fa-heart me-2' : 'far fa-heart me-2'}></i>
                    {isInWishlist(product.id) ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Bar */}
      <section className="py-4" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-cube" style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '10px' }}></i>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Interactive 3D Preview</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.5 }}>Rotate, zoom, and inspect full 360° product details directly on screen.</div>
            </div>

            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-mobile-alt" style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '10px' }}></i>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Augmented Reality (AR)</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.5 }}>View this furniture in your actual room using your smartphone camera.</div>
            </div>

            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-magic" style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '10px' }}></i>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Room AI Compatible</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.5 }}>Auto-matches with room scans using our FurnitureZone AI designer.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-5" style={{ background: '#000000' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="text-center mb-5">
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '8px' }}>
              Verified Feedback
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 400, color: '#ffffff', margin: 0 }}>
              Customer Reviews
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '6px' }}>What buyers say about this furniture piece</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'stretch', marginBottom: '40px' }}>
            {/* Average Rating Card */}
            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, color: '#ffffff', lineHeight: 1, marginBottom: '8px' }}>
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <div className="d-flex justify-content-center mb-3">
                {renderStars(Math.round(reviewStats.averageRating || 0))}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
                Based on {reviewStats.totalReviews} customer reviews
              </div>
            </div>

            {/* Rating Breakdown */}
            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
                Rating Distribution
              </h4>
              <div className="d-grid gap-3">
                {reviewStats.distribution.map((item) => (
                  <div key={item.rating} className="d-flex align-items-center gap-3">
                    <div style={{ width: '60px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600 }}>
                      {item.rating} ★
                    </div>
                    <div className="progress flex-grow-1" style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.max(item.percent, item.count > 0 ? 6 : 0)}%`,
                          background: item.rating >= 4 ? '#4ade80' : item.rating === 3 ? '#facc15' : '#f87171',
                          height: '100%',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div style={{ width: '32px', textAlign: 'right', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Review Form */}
          {isAuthenticated && (
            <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#ffffff', marginBottom: '20px' }}>
                Write a Customer Review
              </h4>
              <form onSubmit={handleReviewSubmit}>
                <div className="row g-3">
                  <div className="col-md-6 mb-3">
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>
                      Rating
                    </label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', borderRadius: '8px', padding: '11px 14px', fontSize: '13px', width: '100%', outline: 'none' }}
                    >
                      {[5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''} ({'★'.repeat(num)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 mb-3">
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>
                      Your Review
                    </label>
                    <textarea
                      rows="4"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with quality, comfort, and delivery of this product..."
                      required
                      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', borderRadius: '8px', padding: '14px', fontSize: '13px', width: '100%', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                  <div className="col-12 text-end">
                    <button
                      type="submit"
                      style={{ background: '#ffffff', color: '#000000', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="d-grid gap-3">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                        {review.user?.first_name || review.user?.username} {review.user?.last_name || ''}
                      </h6>
                      <div className="d-flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                      {new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '13px', lineHeight: 1.65 }}>
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '44px 24px', textAlign: 'center' }}>
                <i className="fas fa-comments fa-2x mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}></i>
                <h5 style={{ color: '#ffffff', fontWeight: 400, fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '6px' }}>No Reviews Yet</h5>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Be the first customer to leave a review for this product!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
