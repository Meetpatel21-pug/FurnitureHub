import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const recentReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

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
      fetchProduct(); // Refresh to get updated reviews
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
          className={`fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', paddingTop: '100px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading Product...</h4>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '100px'}}>
      {/* Product Hero Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <Suspense
                fallback={
                  <div className="furniture-viewer-surface shadow-lg">
                    <div className="furniture-viewer-loader">
                      <div className="spinner-border text-info mb-3" role="status" aria-label="Loading 3D viewer" />
                      <h5 className="mb-2 text-dark">Loading 3D furniture viewer</h5>
                      <p className="text-muted mb-0">Preparing model and lighting...</p>
                    </div>
                  </div>
                }
              >
                <FurnitureViewer
                  name={product.name}
                  category={product.category?.name}
                  modelUrl={modelUrl}
                  posterUrl={previewImageUrl}
                  fallbackImage={previewImageUrl}
                  className="shadow-lg"
                />
              </Suspense>
            </div>
            <div className="col-lg-6">
              <div className="modern-product-card h-100">
                <div className="product-content p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-primary text-white px-3 py-2 rounded-pill me-3">
                      <i className="fas fa-tag me-1"></i>{product.category?.name || 'Furniture'}
                    </span>
                    <div className="product-rating">
                      <div className="stars me-2">
                        {renderStars(Math.round(product.average_rating || 4.5))}
                      </div>
                      <span className="rating-count text-muted">({product.review_count || Math.floor(Math.random() * 8) + 2})</span>
                    </div>
                  </div>
                  
                  <h1 className="product-title mb-4 display-4 fw-bold text-dark">{product.name}</h1>
                  
                  <div className="price-section mb-4 p-3 bg-light rounded-3">
                    <div className="d-flex align-items-center">
                      <span className="current-price display-4 fw-bold text-success me-3">₹{parseFloat(product.price).toFixed(0)}</span>
                      <div>
                        <small className="text-muted d-block">Best Price Guaranteed</small>
                        <small className="text-success"><i className="fas fa-shipping-fast me-1"></i>Free Delivery</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="description-section mb-4">
                    <h5 className="text-dark mb-2">Product Details</h5>
                    <p className="text-muted" style={{fontSize: '1.1rem', lineHeight: '1.6'}}>{product.description}</p>
                  </div>
                  
                  <div className="stock-section mb-4">
                    {product.stock > 0 ? (
                      <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="fas fa-check-circle fa-lg me-3 text-success"></i>
                        <div>
                          <strong>In Stock</strong>
                          <div className="small">{product.stock} units available • Ready to ship</div>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="fas fa-times-circle fa-lg me-3 text-danger"></i>
                        <div>
                          <strong>Out of Stock</strong>
                          <div className="small">Notify me when available</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="action-section">
                    <div className="d-grid gap-3">
                      <button
                        className="btn btn-dark btn-lg py-3 fw-bold"
                        onClick={handleAddToCart}
                        disabled={!product.available || product.stock === 0}
                        style={{fontSize: '1.1rem'}}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>
                        Add to Cart - ₹{parseFloat(product.price).toFixed(0)}
                      </button>
                      <button
                        className={`btn btn-outline-dark btn-lg w-100 py-3 ${isInWishlist(product.id) ? 'wishlist-active' : ''}`}
                        onClick={handleAddToWishlist}
                      >
                        <i className={isInWishlist(product.id) ? 'fas fa-heart me-2' : 'far fa-heart me-2'}></i>
                        {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 bg-white border-top border-bottom">
        <div className="container">
          <div className="row g-3 text-center">
            <div className="col-md-4">
              <div className="p-3 rounded-4 bg-light h-100">
                <div className="fw-bold mb-1">Desktop</div>
                <div className="text-muted small">Interact with the embedded 3D model and place the item in the room designer.</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded-4 bg-light h-100">
                <div className="fw-bold mb-1">Mobile</div>
                <div className="text-muted small">Tap the AR launcher on supported devices or stay in 3D preview mode.</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded-4 bg-light h-100">
                <div className="fw-bold mb-1">Saved visual assets</div>
                <div className="text-muted small">Product models and dimensions now flow from the backend serializer.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-5" style={{background: 'white'}}>
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.16em', color: '#0f766e' }}>Customer Stories</p>
            <h2 className="fw-bold text-dark">Customer Ratings & Reviews</h2>
            <p className="text-muted">What our customers say about this product</p>
          </div>

          <div className="row g-4 align-items-stretch mb-5">
            <div className="col-lg-4">
              <div className="modern-product-card h-100 bg-white border shadow-sm">
                <div className="product-content p-4 text-center">
                  <div className="rounded-4 p-4 mb-3" style={{ background: 'var(--grad-accent)', color: '#fff' }}>
                    <div className="display-4 fw-bold mb-1">{reviewStats.averageRating.toFixed(1)}</div>
                    <div className="d-flex justify-content-center gap-1 fs-5">
                      {renderStars(Math.round(reviewStats.averageRating || 0))}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between text-muted small px-2">
                    <span>{reviewStats.totalReviews} reviews</span>
                    <span>{Math.round(reviewStats.averageRating * 20) || 0}% positive</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="modern-product-card h-100 bg-white border shadow-sm">
                <div className="product-content p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="product-title mb-0 text-dark">Rating Breakdown</h4>
                    <span className="text-muted small">Based on approved reviews</span>
                  </div>
                  <div className="d-grid gap-3">
                    {reviewStats.distribution.map((item) => (
                      <div key={item.rating} className="d-flex align-items-center gap-3">
                        <div style={{ width: '84px' }} className="text-dark fw-semibold">
                          {item.rating} star{item.rating > 1 ? 's' : ''}
                        </div>
                        <div className="progress flex-grow-1" style={{ height: '10px', background: '#e9ecef' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${Math.max(item.percent, item.count > 0 ? 8 : 0)}%`, background: item.rating >= 4 ? 'var(--accent)' : item.rating === 3 ? '#f59e0b' : '#ef4444' }}
                            aria-valuenow={item.percent}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                        <div style={{ width: '44px' }} className="text-end text-muted">
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Review Form */}
          {isAuthenticated && (
            <div className="modern-product-card mb-5">
              <div className="product-content">
                <h4 className="product-title mb-4 text-dark">Write a Review</h4>
                <form onSubmit={handleReviewSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-dark">Rating</label>
                      <select
                        className="form-control border-dark"
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                        style={{color: '#333'}}
                      >
                        {[5,4,3,2,1].map(num => (
                          <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-dark">Comment</label>
                      <textarea
                        className="form-control border-dark"
                        rows="4"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        style={{color: '#333'}}
                        placeholder="Share your experience with this product..."
                        required
                      ></textarea>
                    </div>
                    <div className="col-12 text-center">
                      <button type="submit" className="btn btn-dark btn-lg px-5 py-3">
                        <i className="fas fa-star me-2"></i>Submit Review
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="row g-3">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="col-12">
                  <div className="modern-product-card" style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}>
                    <div className="product-content p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="product-title mb-1" style={{ color: 'var(--ink)' }}>{review.user?.first_name || review.user?.username} {review.user?.last_name || ''}</h6>
                          <div className="product-rating">
                            <div className="stars">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <small className="text-muted" style={{ fontSize: '12px' }}>{new Date(review.created_at).toLocaleDateString()}</small>
                      </div>
                      <p style={{ color: 'var(--ink-muted)', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <div className="modern-product-card" style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}>
                  <div className="product-content p-4">
                    <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                    <h5 className="product-title text-dark">No Reviews Yet</h5>
                    <p className="text-muted">Be the first to review this product and help other customers!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
