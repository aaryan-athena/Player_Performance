import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for managing loading states and user feedback
 * Requirements: 7.5, 8.4 - Loading states and feedback for async operations
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useToast();

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
    showError(errorMessage);
  }, [showError]);

  const executeAsync = useCallback(async (
    asyncFunction, 
    options = {}
  ) => {
    const {
      loadingMessage,
      successMessage,
      errorMessage = 'An error occurred',
      showSuccessToast = false,
      showErrorToast = true
    } = options;

    try {
      startLoading();
      const result = await asyncFunction();
      
      if (successMessage && showSuccessToast) {
        showSuccess(successMessage);
      }
      
      return result;
    } catch (err) {
      const finalErrorMessage = errorMessage || err.message || 'An error occurred';
      
      if (showErrorToast) {
        setLoadingError(finalErrorMessage);
      } else {
        setError(finalErrorMessage);
        setIsLoading(false);
      }
      
      throw err;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, setLoadingError, showSuccess]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    executeAsync,
    reset
  };
};

// Hook for managing multiple loading states
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});
  const { showError, showSuccess } = useToast();

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const executeAsync = useCallback(async (
    key,
    asyncFunction,
    options = {}
  ) => {
    const {
      successMessage,
      errorMessage = 'An error occurred',
      showSuccessToast = false,
      showErrorToast = true
    } = options;

    try {
      setLoading(key, true);
      const result = await asyncFunction();
      
      if (successMessage && showSuccessToast) {
        showSuccess(successMessage);
      }
      
      return result;
    } catch (err) {
      const finalErrorMessage = errorMessage || err.message || 'An error occurred';
      
      if (showErrorToast) {
        showError(finalErrorMessage);
      }
      
      throw err;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading, showError, showSuccess]);

  const reset = useCallback((key) => {
    if (key) {
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } else {
      setLoadingStates({});
    }
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    executeAsync,
    reset
  };
};

export default useLoading;