import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const collections = [
  {
    title: 'Table',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80',
    link: '/products?category=dining-room',
  },
  {
    title: 'Chair',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    link: '/products?category=office',
  },
  {
    title: 'Sofa',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    link: '/products?category=living-room',
  },
  {
    title: 'Bed',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
    link: '/products?category=bedroom',
  },
  {
    title: 'Storage',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
    link: '/products?category=storage',
  },
  {
    title: 'Bathroom',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80',
    link: '/products?category=bathroom',
  },
  {
    title: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    link: '/products?category=kitchen',
  },
  {
    title: 'Dining Table',
    image: 'https://images.unsplash.com/photo-1615876234886-fdba0f5c8155?w=800&q=80',
    link: '/products?category=dining-table',
  },
];

// Duplicate for infinite scroll effect
const repeatedCollections = [...collections, ...collections, ...collections];

const CollectionSlider = ({ title = "SHOP OUR COLLECTIONS", description = "The importance of heritage, locality, and sustainability is the grounding vision for Eastern Edition." }) => {
  const sliderRef = useRef(null);
  const isHovered = useRef(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationId;
    const step = 0.8; // Scroll speed

    // Set initial scroll to middle set so we can scroll left/right infinitely if needed
    // But for a simple right-scrolling infinite loop, starting at 0 and resetting when hitting the second set is best.
    const maxScroll = slider.scrollWidth / 3;

    const scrollLoop = () => {
      if (!isHovered.current) {
        slider.scrollLeft += step;
        if (slider.scrollLeft >= maxScroll) {
          slider.scrollLeft -= maxScroll;
        }
      }
      animationId = requestAnimationFrame(scrollLoop);
    };

    animationId = requestAnimationFrame(scrollLoop);

    const onMouseEnter = () => { isHovered.current = true; };
    const onMouseLeave = () => { isHovered.current = false; };

    slider.addEventListener('mouseenter', onMouseEnter);
    slider.addEventListener('mouseleave', onMouseLeave);
    
    // Also handle touch for mobile
    slider.addEventListener('touchstart', onMouseEnter, { passive: true });
    slider.addEventListener('touchend', onMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      slider.removeEventListener('mouseenter', onMouseEnter);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('touchstart', onMouseEnter);
      slider.removeEventListener('touchend', onMouseLeave);
    };
  }, []);

  return (
    <section style={{ padding: '40px 0', background: 'var(--bg-base)' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        {title && (
          <div className="mb-5">
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                marginBottom: '10px',
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--ink-muted)',
                  margin: 0,
                  maxWidth: '750px',
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <div
          ref={sliderRef}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            overflowX: 'hidden', // Hide scrollbar, use JS to scroll
            gap: '20px',
            paddingBottom: '20px',
            cursor: 'grab'
          }}
        >
          {repeatedCollections.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              style={{ textDecoration: 'none', color: 'inherit', flex: '0 0 auto', width: '280px' }}
              className="collection-card-item"
            >
              <div
                style={{
                  position: 'relative',
                  background: 'var(--bg-surface)',
                  aspectRatio: '3 / 4',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease',
                  borderRadius: '8px',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                  className="collection-card-img"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionSlider;
