import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import ChatBot from '../components/ChatBot';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [category, search, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        ...(category && { category }),
        ...(search && { search }),
        page: currentPage
      };

      const response = await productsAPI.getAll(params);
      const data = response.data;

      if (data.results) {
        setProducts(data.results);
        setTotalPages(Math.ceil(data.count / 12));
      } else {
        setProducts(Array.isArray(data) ? data : []);
        setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / 12));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      const fetchedCategories = Array.isArray(response.data) ? response.data : [];

      const defaultCategories = fetchedCategories.length > 0 ? fetchedCategories : [
        { id: 1, name: 'Living Room', slug: 'living-room' },
        { id: 2, name: 'Bedroom', slug: 'bedroom' },
        { id: 3, name: 'Dining Room', slug: 'dining-room' },
        { id: 4, name: 'Office', slug: 'office' },
        { id: 5, name: 'Storage', slug: 'storage' }
      ];

      setCategories(defaultCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { id: 1, name: 'Living Room', slug: 'living-room' },
        { id: 2, name: 'Bedroom', slug: 'bedroom' },
        { id: 3, name: 'Dining Room', slug: 'dining-room' },
        { id: 4, name: 'Office', slug: 'office' },
        { id: 5, name: 'Storage', slug: 'storage' }
      ]);
    }
  };

  const handleCategoryFilter = (categorySlug) => {
    const newParams = new URLSearchParams(searchParams);
    if (categorySlug) {
      newParams.set('category', categorySlug);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="products-loading" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="spinner-border text-dark mb-3" role="status" style={{ width: '2rem', height: '2rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--ink)' }}>Loading Products...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page" style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '120px' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>

        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-flex-end mb-4 border-bottom pb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-light)', display: 'block', marginBottom: '6px' }}>
              CATALOGUE
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 300, color: 'var(--ink)', margin: 0 }}>
              {search ? `Search: "${search}"` :
               category ? categories.find(c => c.slug === category)?.name || 'Products' :
               'All Collection'}
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-light)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>
            ALL ({products.length})
          </div>
        </div>

        {/* Category Tabs — Eastern Edition minimalist filter links */}
        <div className="mb-5" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div className="d-flex flex-wrap gap-4 align-items-center">
            <button
              onClick={() => handleCategoryFilter('')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '12px',
                fontWeight: !category ? 700 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: !category ? 'var(--ink)' : 'var(--ink-light)',
                cursor: 'pointer',
                borderBottom: !category ? '2px solid var(--ink)' : '2px solid transparent',
                paddingBottom: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              ALL PRODUCTS
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.slug)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '12px',
                  fontWeight: category === cat.slug ? 700 : 400,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: category === cat.slug ? 'var(--ink)' : 'var(--ink-light)',
                  cursor: 'pointer',
                  borderBottom: category === cat.slug ? '2px solid var(--ink)' : '2px solid transparent',
                  paddingBottom: '4px',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-5">
            <div className="empty-state py-5">
              <i className="fas fa-search fa-3x text-muted mb-4" style={{ opacity: 0.5 }}></i>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--ink)', marginBottom: '12px' }}>No Products Found</h3>
              <p style={{ color: 'var(--ink-light)', fontSize: '13px', marginBottom: '24px' }}>Try adjusting your search or selecting a different category.</p>
              <button
                onClick={() => handleCategoryFilter('')}
                style={{
                  padding: '12px 28px',
                  background: 'var(--ink)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                View All Collection
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '48px 30px',
              }}
            >
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-5 pt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.4 : 1,
                  }}
                >
                  &larr; PREVIOUS
                </button>
                <span style={{ fontSize: '12px', color: 'var(--ink-light)', margin: '0 12px' }}>
                  PAGE {currentPage} OF {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.4 : 1,
                  }}
                >
                  NEXT &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ChatBot showAfterScroll={false} />
    </div>
  );
};

export default Products;