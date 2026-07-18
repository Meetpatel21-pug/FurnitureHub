import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

const renderStars = (rating) => {
  const stars = [];
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  for (let i = 0; i < full; i++)        stars.push(<i key={`f${i}`}  className="fas fa-star" />);
  if (half)                              stars.push(<i key="h"        className="fas fa-star-half-alt" />);
  for (let i = stars.length; i < 5; i++) stars.push(<i key={`e${i}`} className="far fa-star" />);
  return stars;
};

const formatPrice = (price) => `₹${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const ProductCard = ({ product }) => {
  const { isAuthenticated }           = useAuth();
  const { addToCart }                 = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding]           = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.warning('Please login to add items to cart'); return; }
    setAdding(true);
    const result = await addToCart(product.id);
    setAdding(false);
    if (result.success) toast.success(`${product.name} added to cart!`);
    else toast.error(result.error);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.warning('Please login to save items'); return; }
    const result = await toggleWishlist(product.id);
    if (result.success) {
      toast.success(result.action === 'added'
        ? `${product.name} saved to wishlist!`
        : `${product.name} removed from wishlist`);
    } else toast.error(result.error);
  };

  const inWishlist  = isInWishlist(product.id);
  const rating      = product.average_rating || 4.2;
  const reviewCount = product.review_count   || 0;
  const categoryName = product.category?.name || product.category || 'Furniture';
  const isOutOfStock = !product.available || product.stock === 0;

  return (
    <div className="modern-product-card" id={`product-card-${product.id}`}>

      {/* ── Image ── */}
      <div className="product-image-container">
        <Link to={`/products/${product.slug}`} tabIndex={-1} aria-label={`View ${product.name}`}>
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop'}
            className="product-image"
            alt={product.name}
            loading="lazy"
          />
        </Link>

        {/* Category badge */}
        <span className="product-category-badge">{categoryName}</span>

        {/* Glass wishlist button */}
        <button
          className={`wishlist-btn${inWishlist ? ' active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          id={`wishlist-btn-${product.id}`}
        >
          <i className={inWishlist ? 'fas fa-heart' : 'far fa-heart'} />
        </button>

        {/* Out of stock badge */}
        {isOutOfStock && (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="product-content">
        <div className="product-category">{categoryName}</div>

        <h3 className="product-title">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="product-rating">
          <div className="stars">{renderStars(rating)}</div>
          {reviewCount > 0 && (
            <span className="rating-count">({reviewCount})</span>
          )}
        </div>

        <div className="product-price">
          <span className="current-price">{formatPrice(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="original-price">{formatPrice(product.original_price)}</span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            id={`add-to-cart-btn-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
          >
            {adding
              ? <><div className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />Adding…</>
              : isOutOfStock
              ? <><i className="fas fa-ban" />Out of Stock</>
              : <><i className="fas fa-shopping-bag" />Add to Cart</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;