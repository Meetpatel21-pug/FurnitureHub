import React, { createContext, useContext, useEffect, useState } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await wishlistAPI.get();
      setWishlistItems(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product?.id === productId);
  };

  const addToWishlist = async (productId) => {
    try {
      await wishlistAPI.add(productId);
      await fetchWishlist();
      return { success: true, action: 'added' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to wishlist'
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      await fetchWishlist();
      return { success: true, action: 'removed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove from wishlist'
      };
    }
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    }

    return addToWishlist(productId);
  };

  const value = {
    wishlistItems,
    loading,
    fetchWishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};