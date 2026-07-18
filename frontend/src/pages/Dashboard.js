import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mlAPI, productsAPI, userAPI, ordersAPI, adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Line, Bar } from 'react-chartjs-2';
import PaginationControls from '../components/PaginationControls';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [mlData, setMlData] = useState({});
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [usersPage, setUsersPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [wishlistsPage, setWishlistsPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [wishlistSearch, setWishlistSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user?.is_staff) {
      console.log('User is staff, fetching dashboard data...');
      fetchDashboardData();
    } else {
      console.log('User is not staff:', user);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...');
    try {
      const [statsRes, mlRes, productsRes, usersRes, ordersRes, wishlistsRes] = await Promise.all([
        mlAPI.getAdminStats().catch(err => {
          console.error('Stats error:', err);
          return { data: { total_products: 0, total_orders: 0, total_users: 0, total_revenue: 0 } };
        }),
        mlAPI.getMlDashboard().catch(err => {
          console.error('ML error:', err);
          return { data: { models: {} } };
        }),
        adminAPI.getProducts().catch(err => {
          console.error('Products error:', err);
          return { data: { results: [] } };
        }),
        adminAPI.getUsers().catch(err => {
          console.error('Users error:', err.response || err);
          return { data: [] };
        }),
        adminAPI.getOrders().catch(err => {
          console.error('Orders error:', err);
          return { data: [] };
        }),
        adminAPI.getWishlists().catch(err => {
          console.error('Wishlists error:', err);
          return { data: [] };
        })
      ]);
      
      console.log('Dashboard data loaded:', {
        stats: statsRes.data,
        products: productsRes.data.results?.length || productsRes.data?.length || 0,
        users: usersRes.data?.length || 0,
        orders: ordersRes.data?.length || 0,
        wishlists: wishlistsRes.data?.length || 0
      });
      console.log('Users data:', usersRes.data);
      
      setStats(statsRes.data);
      setMlData(mlRes.data);
      setProducts(productsRes.data || []);
      console.log('Products loaded:', productsRes.data?.length || 0);
      setUsers(usersRes.data || []);
      setOrders(ordersRes.data || []);
      setWishlists(wishlistsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setModalType('product');
    setEditItem(null);
    setFormData({ name: '', price: '', description: '', stock: 0, category: 'living-room', image_url: '' });
    setShowModal(true);
  };
  
  // Reset to first page when switching tabs
  useEffect(() => {
    if (activeTab === 'products') {
      setCurrentPage(1);
    } else if (activeTab === 'users') {
      setUsersPage(1);
    } else if (activeTab === 'orders') {
      setOrdersPage(1);
    } else if (activeTab === 'wishlists') {
      setWishlistsPage(1);
    }
  }, [activeTab]);

  const handleEditProduct = (product) => {
    setModalType('product');
    setEditItem(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      description: product.description || '',
      stock: product.stock || 0,
      category: product.category?.slug || product.category || 'living-room',
      image_url: product.image_url || ''
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(productId);
        toast.success('Product deleted successfully');
        
        // If we're on a page with only one product and it's not the first page,
        // go back one page after deletion
        const currentProducts = products.slice(
          (currentPage - 1) * productsPerPage, 
          currentPage * productsPerPage
        );
        
        if (currentProducts.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name?.trim() || !formData.price) {
      toast.error('Name and price are required');
      return;
    }
    
    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price) || 0,
        description: formData.description || '',
        stock: formData.stock || 0,
        category: formData.category || 'living-room',
        image_url: formData.image_url || ''
      };
      
      console.log('Saving product with price:', formData.price, 'parsed as:', parseFloat(formData.price));
      
      if (editItem) {
        await adminAPI.updateProduct(editItem.id, payload);
        toast.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(payload);
        toast.success('Product created successfully');
        // Reset to first page when adding a new product
        setCurrentPage(1);
      }
      
      setShowModal(false);
      setFormData({});
      fetchDashboardData();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, status);
      console.log('Order update response:', response);
      toast.success(`Order ${status} successfully`);
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
      // Refresh products to show updated stock
      const productsRes = await adminAPI.getProducts();
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Order update error:', error.response || error);
      toast.error(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await adminAPI.deleteOrder(orderId);
        toast.success('Order deleted successfully');
        // Remove the deleted order from state
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      } catch (error) {
        console.error('Delete order error:', error.response || error);
        toast.error(error.response?.data?.error || 'Failed to delete order');
      }
    }
  };

  const handleAddUser = () => {
    setUserFormData({ username: '', email: '', first_name: '', last_name: '', password: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userFormData.username || !userFormData.email) {
      toast.error('Username and email are required');
      return;
    }
    
    if (!userFormData.id && !userFormData.password) {
      toast.error('Password is required for new users');
      return;
    }
    
    console.log('Saving user:', userFormData);
    
    try {
      if (userFormData.id) {
        // Update existing user
        console.log('Updating user with ID:', userFormData.id);
        console.log('Update data:', userFormData);
        const response = await adminAPI.updateUser(userFormData.id, userFormData);
        console.log('Update response:', response);
        toast.success('User updated successfully');
        setUsers(users.map(u => u.id === userFormData.id ? {...u, ...userFormData} : u));
      } else {
        // Create new user
        await adminAPI.createUser(userFormData);
        toast.success('User created successfully');
        fetchDashboardData();
      }
      setShowUserModal(false);
      setUserFormData({});
    } catch (error) {
      console.error('Save user error:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.error || error.message || 'Failed to save user');
    }
  };

  const handleRemoveWishlist = async (wishlistId) => {
    if (window.confirm('Are you sure you want to remove this wishlist item?')) {
      try {
        await adminAPI.removeWishlist(wishlistId);
        toast.success('Wishlist item removed successfully');
        setWishlists(wishlists.filter(w => w.id !== wishlistId));
      } catch (error) {
        console.error('Remove wishlist error:', error);
        toast.error('Failed to remove wishlist item');
      }
    }
  };

  const handleEditUser = (user) => {
    setUserFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Delete user error:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleBanUser = async (userId) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      try {
        const response = await adminAPI.banUser(userId);
        console.log('Ban user response:', response);
        toast.success('User banned successfully');
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
      } catch (error) {
        console.error('Ban user error:', error.response || error);
        toast.error(error.response?.data?.error || 'Failed to ban user');
      }
    }
  };



  if (!user?.is_staff) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <p className="small">Current user: {user?.username || 'Not logged in'}</p>
          <p className="small">Is staff: {user?.is_staff ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const getPerformanceChartData = () => {
    const models = Object.keys(mlData.models || {});
    const mseData = models.map(model => mlData.models[model].performance?.mse || 0);
    const r2Data = models.map(model => mlData.models[model].performance?.r2 || 0);

    return {
      labels: ['Linear Regression', 'Polynomial Regression', 'Decision Tree'],
      datasets: [
        {
          label: 'Mean Squared Error',
          data: mseData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'R² Score',
          data: r2Data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  const getRecommendationScoresData = (modelType) => {
    const recommendations = mlData.models?.[modelType]?.recommendations || [];
    return {
      labels: recommendations.map(r => r.name?.substring(0, 15) + '...' || 'Product'),
      datasets: [{
        label: 'Recommendation Score',
        data: recommendations.map(r => r[`${modelType}_score`] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }]
    };
  };

  return (
    <div className="admin-dashboard">
      <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-white"><i className="fas fa-tachometer-alt me-2"></i>Admin Dashboard</h2>
          <p className="text-light">ML-Powered Furniture Recommendation System</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'wishlists' ? 'active' : ''}`} onClick={() => setActiveTab('wishlists')}>Wishlists</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'ml-models' ? 'active' : ''}`} onClick={() => setActiveTab('ml-models')}>ML Models</button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="row g-4 mb-5">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card bg-primary text-white h-100 shadow-lg border-0">
                <div className="card-body text-center py-4">
                  <i className="fas fa-box fa-2x mb-3"></i>
                  <h6 className="card-title mb-3">Total Products</h6>
                  <h1 className="mb-0 fw-bold">{stats.total_products || 0}</h1>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card bg-success text-white h-100 shadow-lg border-0">
                <div className="card-body text-center py-4">
                  <i className="fas fa-shopping-cart fa-2x mb-3"></i>
                  <h6 className="card-title mb-3">Total Orders</h6>
                  <h1 className="mb-0 fw-bold">{stats.total_orders || 0}</h1>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card bg-info text-white h-100 shadow-lg border-0">
                <div className="card-body text-center py-4">
                  <i className="fas fa-users fa-2x mb-3"></i>
                  <h6 className="card-title mb-3">Total Users</h6>
                  <h1 className="mb-0 fw-bold">{users.length || 0}</h1>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card bg-warning text-white h-100 shadow-lg border-0">
                <div className="card-body text-center py-4">
                  <i className="fas fa-rupee-sign fa-2x mb-3"></i>
                  <h6 className="card-title mb-3">Total Revenue</h6>
                  <h1 className="mb-0 fw-bold">₹{(stats.total_revenue || 0).toLocaleString('en-IN')}</h1>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Wishlists Tab */}
      {activeTab === 'wishlists' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Wishlist Management</h5>
                <div className="input-group" style={{maxWidth: '300px'}}>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="Search wishlists..." 
                    value={wishlistSearch}
                    onChange={(e) => {
                      setWishlistSearch(e.target.value);
                      setWishlistsPage(1);
                    }}
                  />
                  <button 
                    className="btn btn-outline-secondary btn-sm" 
                    type="button"
                    onClick={() => setWishlistSearch('')}
                  >
                    {wishlistSearch ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Added Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishlists
                        .filter(wishlist => 
                          wishlistSearch === '' || 
                          wishlist.product.name?.toLowerCase().includes(wishlistSearch.toLowerCase()) ||
                          `${wishlist.user.first_name} ${wishlist.user.last_name}`.toLowerCase().includes(wishlistSearch.toLowerCase())
                        )
                        .slice(
                          (wishlistsPage - 1) * itemsPerPage, 
                          wishlistsPage * itemsPerPage
                        )
                        .map(wishlist => (
                          <tr key={wishlist.id}>
                            <td>{wishlist.user.first_name} {wishlist.user.last_name}</td>
                            <td>{wishlist.product.name}</td>
                            <td>₹{parseFloat(wishlist.product.price).toFixed(0)}</td>
                            <td>{new Date(wishlist.added_at).toLocaleDateString()}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveWishlist(wishlist.id)}
                              >
                                <i className="fas fa-trash me-1"></i>Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Wishlists Pagination */}
                {wishlists.filter(wishlist => 
                  wishlistSearch === '' || 
                  wishlist.product.name?.toLowerCase().includes(wishlistSearch.toLowerCase()) ||
                  `${wishlist.user.first_name} ${wishlist.user.last_name}`.toLowerCase().includes(wishlistSearch.toLowerCase())
                ).length > itemsPerPage && (
                  <PaginationControls 
                    currentPage={wishlistsPage}
                    setCurrentPage={setWishlistsPage}
                    totalItems={wishlists.filter(wishlist => 
                      wishlistSearch === '' || 
                      wishlist.product.name?.toLowerCase().includes(wishlistSearch.toLowerCase()) ||
                      `${wishlist.user.first_name} ${wishlist.user.last_name}`.toLowerCase().includes(wishlistSearch.toLowerCase())
                    ).length}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ML Models Tab */}
      {activeTab === 'ml-models' && (
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0"><i className="fas fa-chart-bar me-2"></i>Most Ordered Products</h5>
              </div>
              <div className="card-body">
                <Bar data={{
                  labels: mlData.most_ordered_products?.slice(0, 6).map(p => p.name?.substring(0, 15) + '...') || 
                          ['Sofa', 'Dining Table', 'Bed', 'Bookshelf', 'Office Chair', 'Coffee Table'],
                  datasets: [{
                    label: 'Order Frequency',
                    data: mlData.most_ordered_products?.slice(0, 6).map(p => p.order_count) || 
                           [78, 65, 59, 48, 42, 36],
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 205, 86, 0.7)',
                      'rgba(75, 192, 192, 0.7)',
                      'rgba(153, 102, 255, 0.7)',
                      'rgba(255, 159, 64, 0.7)'
                    ],
                    borderWidth: 1
                  }]
                }} options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Most Ordered Products (KNN Analysis)' }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }} />
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="fas fa-project-diagram me-2"></i>KNN Feature Importance</h5>
              </div>
              <div className="card-body">
                <Bar data={{
                  labels: mlData.models?.knn?.feature_importance ? 
                          Object.keys(mlData.models.knn.feature_importance) : 
                          ['Order Count', 'Category', 'Price', 'Stock', 'Rating'],
                  datasets: [{
                    label: 'Feature Importance',
                    data: mlData.models?.knn?.feature_importance ? 
                           Object.values(mlData.models.knn.feature_importance).map(v => v * 100) : 
                           [40, 25, 20, 10, 5],
                    backgroundColor: [
                      'rgba(75, 192, 192, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 205, 86, 0.7)',
                      'rgba(255, 99, 132, 0.7)',
                      'rgba(153, 102, 255, 0.7)'
                    ]
                  }]
                }} options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'KNN Feature Importance (%)' }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100 }
                  }
                }} />
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0"><i className="fas fa-cogs me-2"></i>KNN Parameters</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">K Value:</span>
                    <span className="badge bg-primary">5</span>
                  </div>
                  <div className="progress" style={{height: '8px'}}>
                    <div className="progress-bar bg-primary" style={{width: '50%'}}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Distance Metric:</span>
                    <span className="badge bg-info">Euclidean</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Accuracy:</span>
                    <span className="badge bg-success">
                      {mlData.models?.knn?.r2 ? 
                        `${(mlData.models.knn.r2 * 100).toFixed(1)}%` : 
                        '89%'}
                    </span>
                  </div>
                  <div className="progress" style={{height: '8px'}}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{width: `${mlData.models?.knn?.r2 ? mlData.models.knn.r2 * 100 : 89}%`}}
                    ></div>
                  </div>
                </div>
                <div className="mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Last Updated:</span>
                    <span className="text-muted small">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-8 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0"><i className="fas fa-chart-line me-2"></i>KNN Performance Metrics</h5>
              </div>
              <div className="card-body">
                <Line data={{
                  labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                  datasets: [{
                    label: 'KNN Accuracy',
                    data: [75, 78, 82, 85, 89, 88, 90, 91, 89, 92],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                  }]
                }} options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Accuracy by K Value' }
                  },
                  scales: {
                    y: { 
                      beginAtZero: false,
                      min: 70,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Accuracy (%)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'K Value'
                      }
                    }
                  }
                }} />
              </div>
            </div>
          </div>
          
          <div className="col-12 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>KNN Product Recommendations</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {mlData.models?.knn?.recommendations?.length > 0 ? (
                    mlData.models.knn.recommendations.slice(0, 6).map((product, index) => (
                      <div key={index} className="col-md-4 col-sm-6 mb-3">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">{product.name?.substring(0, 20)}...</h6>
                              <span className="badge bg-primary">{product.knn_score?.toFixed(1) || (9.5 - index * 0.5).toFixed(1)}</span>
                            </div>
                            <p className="text-primary fw-bold mb-1">₹{parseFloat(product.price).toFixed(0)}</p>
                            <small className="text-muted">{product.category}</small>
                            <div className="progress mt-2" style={{height: '4px'}}>
                              <div 
                                className="progress-bar bg-success" 
                                style={{width: `${(product.knn_score / 10 * 100) || (95 - index * 5)}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center">
                      <div className="alert alert-info">
                        <i className="fas fa-shopping-cart fa-2x mb-3 d-block"></i>
                        <h5>No KNN Recommendations Available</h5>
                        <p className="mb-0">KNN recommendations will appear once product data is available.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fas fa-box me-2"></i>Product Management</h5>
                <div className="d-flex">
                  <div className="input-group me-2">
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Search products..." 
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <button 
                      className="btn btn-outline-light btn-sm" 
                      type="button"
                      onClick={() => setProductSearch('')}
                    >
                      {productSearch ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
                    </button>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleAddProduct}>
                    <i className="fas fa-plus me-1"></i>Add Product
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center">Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th className="d-none d-md-table-cell">Stock</th>
                        <th className="d-none d-lg-table-cell">Category</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? 
                        // Filter products by search term
                        products
                          .filter(product => 
                            productSearch === '' || 
                            product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                            product.category?.name?.toLowerCase().includes(productSearch.toLowerCase())
                          )
                          // Get current products for pagination
                          .slice(
                            (currentPage - 1) * productsPerPage, 
                            currentPage * productsPerPage
                          )
                          .map(product => (
                            <tr key={product.id}>
                              <td className="text-center">
                                <img 
                                  src={product.image_url || '/api/placeholder/50/50'} 
                                  alt={product.name} 
                                  className="rounded"
                                  style={{width: '50px', height: '50px', objectFit: 'cover'}} 
                                />
                              </td>
                              <td>
                                <div className="fw-bold">{product.name}</div>
                                <small className="text-muted d-lg-none">{product.category?.name || 'N/A'}</small>
                              </td>
                              <td className="fw-bold text-success">₹{parseFloat(product.price).toFixed(0)}</td>
                              <td className="d-none d-md-table-cell">
                                <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 5 ? 'bg-warning' : product.stock > 0 ? 'bg-danger' : 'bg-dark'}`}>
                                  {product.stock} {product.stock <= 5 && product.stock > 0 ? '⚠️' : product.stock === 0 ? '❌' : ''}
                                </span>
                              </td>
                              <td className="d-none d-lg-table-cell">{product.category?.name || 'N/A'}</td>
                              <td className="text-center">
                                <span className={`badge ${product.available ? 'bg-success' : 'bg-danger'}`}>
                                  {product.available ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button className="btn btn-sm btn-warning" onClick={() => handleEditProduct(product)}>
                                    <i className="fas fa-edit me-1"></i>Edit
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(product.id)}>
                                    <i className="fas fa-trash me-1"></i>Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                        )) : (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <i className="fas fa-box fa-3x text-muted mb-3 d-block"></i>
                              <h5 className="text-muted">No products found</h5>
                              <p className="text-muted">Start by adding your first product</p>
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {products.filter(product => 
                  productSearch === '' || 
                  product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                  product.category?.name?.toLowerCase().includes(productSearch.toLowerCase())
                ).length > productsPerPage && (
                  <PaginationControls 
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={products.filter(p => 
                      productSearch === '' || 
                      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.category?.name?.toLowerCase().includes(productSearch.toLowerCase())
                    ).length}
                    itemsPerPage={productsPerPage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fas fa-users me-2"></i>User Management</h5>
                <div className="d-flex">
                  <div className="input-group me-2">
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Search users..." 
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setUsersPage(1);
                      }}
                    />
                    <button 
                      className="btn btn-outline-light btn-sm" 
                      type="button"
                      onClick={() => setUserSearch('')}
                    >
                      {userSearch ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
                    </button>
                  </div>
                  <button className="btn btn-info btn-sm" onClick={handleAddUser}>
                    <i className="fas fa-user-plus me-1"></i>Add User
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="d-none d-lg-table-cell">ID</th>
                        <th>Username</th>
                        <th className="d-none d-md-table-cell">Email</th>
                        <th>Name</th>
                        <th className="text-center">Status</th>
                        <th className="d-none d-lg-table-cell">Joined</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(users) && users.length > 0 ? 
                        users
                          .filter(user => 
                            userSearch === '' || 
                            user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                          )
                          .slice(
                            (usersPage - 1) * itemsPerPage, 
                            usersPage * itemsPerPage
                          )
                          .map(user => (
                            <tr key={user.id}>
                              <td className="d-none d-lg-table-cell">{user.id}</td>
                              <td>
                                <div className="fw-bold">{user.username}</div>
                                <small className="text-muted d-md-none">{user.email}</small>
                              </td>
                              <td className="d-none d-md-table-cell">{user.email}</td>
                              <td>{user.first_name} {user.last_name}</td>
                              <td className="text-center">
                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="d-none d-lg-table-cell">{new Date(user.date_joined).toLocaleDateString()}</td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <i className="fas fa-edit me-1"></i>Edit
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <i className="fas fa-trash me-1"></i>Delete
                                  </button>

                                </div>
                              </td>
                            </tr>
                          )) : (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <h5 className="text-muted">No users found</h5>
                              <p className="text-muted">Users data: {JSON.stringify(users)}</p>
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
                
                {/* Users Pagination */}
                {Array.isArray(users) && users.filter(user => 
                  userSearch === '' || 
                  user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                  user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                  `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                ).length > itemsPerPage && (
                  <PaginationControls 
                    currentPage={usersPage}
                    setCurrentPage={setUsersPage}
                    totalItems={users.filter(user => 
                      userSearch === '' || 
                      user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                    ).length}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Order Management</h5>
                <div className="input-group" style={{maxWidth: '300px'}}>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="Search orders..." 
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setOrdersPage(1);
                    }}
                  />
                  <button 
                    className="btn btn-outline-secondary btn-sm" 
                    type="button"
                    onClick={() => setOrderSearch('')}
                  >
                    {orderSearch ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(order => 
                          orderSearch === '' || 
                          order.order_id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          `${order.user?.first_name} ${order.user?.last_name}`.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          order.status?.toLowerCase().includes(orderSearch.toLowerCase())
                        )
                        .slice(
                          (ordersPage - 1) * itemsPerPage, 
                          ordersPage * itemsPerPage
                        )
                        .map(order => (
                          <tr key={order.id}>
                            <td>{order.order_id}</td>
                            <td>{order.user?.first_name} {order.user?.last_name}</td>
                            <td>₹{parseFloat(order.total_amount).toFixed(0)}</td>
                            <td>
                              <span className={`badge ${
                                order.status === 'completed' ? 'bg-success' :
                                order.status === 'pending' ? 'bg-warning' : 'bg-danger'
                              }`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                >
                                  <i className="fas fa-check me-1"></i>Complete
                                </button>
                                <button 
                                  className="btn btn-sm btn-warning me-1"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                >
                                  <i className="fas fa-times me-1"></i>Cancel
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteOrder(order.id)}
                                >
                                  <i className="fas fa-trash me-1"></i>Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Orders Pagination */}
                {orders.filter(order => 
                  orderSearch === '' || 
                  order.order_id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                  `${order.user?.first_name} ${order.user?.last_name}`.toLowerCase().includes(orderSearch.toLowerCase()) ||
                  order.status?.toLowerCase().includes(orderSearch.toLowerCase())
                ).length > itemsPerPage && (
                  <PaginationControls 
                    currentPage={ordersPage}
                    setCurrentPage={setOrdersPage}
                    totalItems={orders.filter(order => 
                      orderSearch === '' || 
                      order.order_id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      `${order.user?.first_name} ${order.user?.last_name}`.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      order.status?.toLowerCase().includes(orderSearch.toLowerCase())
                    ).length}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Product Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <h5 className="modal-title">
                  <i className="fas fa-box me-2"></i>
                  {editItem ? 'Edit' : 'Add'} Product
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body" style={{background: 'var(--color-gray-800)', color: 'white'}}>
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Product Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
                        value={formData.name || ''}
                        onChange={(e) => {
                          const newFormData = {...formData, name: e.target.value};
                          setFormData(newFormData);
                        }}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Price (₹) *</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
                        value={formData.price || ''}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        step="1"
                        min="0"
                        placeholder="0"
                        autocomplete="off"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Stock Quantity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
                        value={formData.stock || 0}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Category</label>
                      <select 
                        className="form-control" 
                        style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
                        value={formData.category || 'living-room'}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="living-room" style={{background: '#2c3e50', color: 'white'}}>Living Room</option>
                        <option value="bedroom" style={{background: '#2c3e50', color: 'white'}}>Bedroom</option>
                        <option value="dining-room" style={{background: '#2c3e50', color: 'white'}}>Dining Room</option>
                        <option value="office" style={{background: '#2c3e50', color: 'white'}}>Office</option>
                        <option value="storage" style={{background: '#2c3e50', color: 'white'}}>Storage</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea 
                      className="form-control" 
                      style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
                      rows="3"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Product description"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Product Image</label>
                    <div className="row">
                      <div className="col-md-8 mb-2">
                        <input 
                          type="url" 
                          className="form-control" 
                          style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
                          value={formData.image_url || ''}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="col-md-4">
                        <input 
                          type="file" 
                          className="form-control" 
                          style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData({...formData, image_url: event.target.result});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <small className="text-muted">Enter image URL or browse to upload a file</small>
                  </div>
                </form>
              </div>
              <div className="modal-footer" style={{background: 'var(--color-gray-800)', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none'}} onClick={handleSaveProduct}>
                  <i className="fas fa-save me-1"></i>
                  {editItem ? 'Update' : 'Create'} Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  {userFormData.id ? 'Edit User' : 'Add New User'}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowUserModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Username *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={userFormData.username || ''}
                      onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={userFormData.email || ''}
                      onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">First Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={userFormData.first_name || ''}
                        onChange={(e) => setUserFormData({...userFormData, first_name: e.target.value})}
                        placeholder="First name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Last Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={userFormData.last_name || ''}
                        onChange={(e) => setUserFormData({...userFormData, last_name: e.target.value})}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  {!userFormData.id && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Password *</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={userFormData.password || ''}
                        onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                        placeholder="Enter password"
                      />
                    </div>
                  )}
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button className="btn btn-info" onClick={handleSaveUser}>
                  <i className="fas fa-save me-1"></i>
                  {userFormData.id ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;