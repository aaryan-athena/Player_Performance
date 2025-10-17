/**
 * Utility functions for offline handling
 * Requirements: 7.5 - Graceful degradation and offline utilities
 */

// Check if the browser supports service workers for offline caching
export const supportsServiceWorker = () => {
  return 'serviceWorker' in navigator;
};

// Check if the browser supports local storage
export const supportsLocalStorage = () => {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Get storage quota information
export const getStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage,
        usagePercentage: (estimate.usage / estimate.quota) * 100
      };
    } catch (error) {
      console.error('Error getting storage quota:', error);
      return null;
    }
  }
  return null;
};

// Clear all offline data
export const clearOfflineStorage = () => {
  try {
    // Clear localStorage items related to offline functionality
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('offlineData') || key.startsWith('pendingActions'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    return true;
  } catch (error) {
    console.error('Error clearing offline storage:', error);
    return false;
  }
};

// Retry function with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: baseDelay * 2^attempt
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Check if an error is network-related
export const isNetworkError = (error) => {
  if (!error) return false;
  
  const networkErrorMessages = [
    'network error',
    'fetch error',
    'connection failed',
    'timeout',
    'no internet',
    'offline'
  ];
  
  const errorMessage = error.message?.toLowerCase() || '';
  return networkErrorMessages.some(msg => errorMessage.includes(msg));
};

// Create a debounced function for network requests
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function for limiting API calls
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Check if data is stale based on timestamp
export const isDataStale = (timestamp, maxAge = 5 * 60 * 1000) => {
  return Date.now() - timestamp > maxAge;
};

// Create a cache key from parameters
export const createCacheKey = (...params) => {
  return params.filter(p => p !== null && p !== undefined).join('_');
};

export default {
  supportsServiceWorker,
  supportsLocalStorage,
  getStorageQuota,
  clearOfflineStorage,
  retryWithBackoff,
  isNetworkError,
  debounce,
  throttle,
  formatBytes,
  isDataStale,
  createCacheKey
};