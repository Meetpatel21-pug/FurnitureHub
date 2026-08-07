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

  const inWishlist   = isInWishlist(product.id);
  const rating       = product.average_rating || 4.2;
  const reviewCount  = product.review_count   || 0;
  const categoryName = product.category?.name || product.category || 'Furniture';
  const isOutOfStock = product.available === false || (product.stock !== undefined && product.stock <= 0);

  return (
    <div
      className="eastern-product-card"
      id={`product-card-${product.id}`}
      style={{
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* ── Image Container ── */}
      <div
        className="product-image-container"
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          background: 'var(--bg-muted)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <Link to={`/products/${product.slug}`} tabIndex={-1} aria-label={`View ${product.name}`}>
          <img
            src={product.image || product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop'}
            className="product-image"
            alt={product.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
        </Link>

        {/* Category tag */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#ffffff',
            background: '#000000',
            padding: '6px 12px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 2,
          }}
        >
          {categoryName}
        </span>

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn${inWishlist ? ' active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          id={`wishlist-btn-${product.id}`}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#ffffff',
            border: 'none',
            color: inWishlist ? '#e53e3e' : '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '15px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
            zIndex: 2,
          }}
        >
          <i className={inWishlist ? 'fas fa-heart' : 'far fa-heart'} />
        </button>

        {/* Out of Stock tag */}
        {isOutOfStock && (
          <span
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              fontSize: '10px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: '#111',
              color: '#fff',
              padding: '4px 10px',
            }}
          >
            Out of Stock
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '0 4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 400,
            lineHeight: 1.25,
            margin: '0 0 6px 0',
          }}
        >
          <Link
            to={`/products/${product.slug}`}
            style={{ color: 'var(--ink)', textDecoration: 'none' }}
          >
            {product.name}
          </Link>
        </h3>

        {/* Ratings & Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
            {formatPrice(product.price)}
            {product.original_price && product.original_price > product.price && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--ink-light)',
                  textDecoration: 'line-through',
                  marginLeft: '8px',
                }}
              >
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f59e0b' }}>
            <div className="stars">{renderStars(rating)}</div>
            {reviewCount > 0 && (
              <span style={{ color: 'var(--ink-light)', fontSize: '10px', marginLeft: '2px' }}>({reviewCount})</span>
            )}
          </div>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          id={`add-to-cart-btn-${product.id}`}
          aria-label={`Add ${product.name} to cart`}
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid var(--ink)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            opacity: isOutOfStock ? 0.5 : 1,
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isOutOfStock && !adding) {
              e.currentTarget.style.background = 'var(--ink)';
              e.currentTarget.style.color = 'var(--bg-white)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOutOfStock && !adding) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--ink)';
            }
          }}
        >
          {adding
            ? 'Adding…'
            : isOutOfStock
            ? 'Out of Stock'
            : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;