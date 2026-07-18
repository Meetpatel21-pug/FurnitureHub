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
      
      console.log('Products response:', data);
      console.log('Selected category:', category);
      console.log('Products with categories:', data.results?.map(p => ({name: p.name, category: p.category})) || data?.map(p => ({name: p.name, category: p.category})));
      
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
      
      // Add default categories if none exist
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
      <div className="products-loading">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white">Loading Products...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="container py-4" style={{marginTop: '80px'}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-white mb-1">
              {search ? `Search: "${search}"` : 
               category ? categories.find(c => c.slug === category)?.name || 'Products' : 
               'All Products'}
            </h2>
            <p className="text-muted mb-0">{products.length} products found</p>
          </div>
          
          {/* Category Dropdown */}
          <div className="dropdown">
            <button className="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i className="fas fa-filter me-2"></i>
              {category ? categories.find(c => c.slug === category)?.name || 'Category' : 'All Categories'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() => handleCategoryFilter('')}>
                  <i className="fas fa-th-large me-2"></i>All Products
                </button>
              </li>
              {Array.isArray(categories) && categories.map(cat => (
                <li key={cat.id}>
                  <button className="dropdown-item" onClick={() => handleCategoryFilter(cat.slug)}>
                    <i className={`${cat.icon} me-2`}></i>{cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="container mb-4">
        <div className="category-tabs">
          <button 
            className={`category-tab ${!category ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('')}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`category-tab ${category === cat.slug ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products by Category */}
      <section className="pb-5">
        <div className="container position-relative">
          {products.length === 0 ? (
            <div className="text-center py-5">
              <div className="empty-state">
                <i className="fas fa-search fa-4x text-muted mb-4"></i>
                <h3 className="text-white mb-3">No Products Found</h3>
                <p className="text-muted mb-4">Try adjusting your search or browse different categories</p>
                <button 
                  className="btn btn-gradient px-4 py-2"
                  onClick={() => handleCategoryFilter('')}
                >
                  View All Products
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container mt-5">
                  <nav>
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <ChatBot showAfterScroll={false} />
    </div>
  );
};

export default Products;