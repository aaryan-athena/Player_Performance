import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

/**
 * Toast Context for global toast notifications
 * Requirements: 7.5, 8.4 - Global feedback system for user actions
 */
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration: options.duration || 5000,
      position: options.position || 'top-right',
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options) => {
    return addToast(message, 'success', options);
  }, [addToast]);

  const showError = useCallback((message, options) => {
    return addToast(message, 'error', { duration: 7000, ...options });
  }, [addToast]);

  const showWarning = useCallback((message, options) => {
    return addToast(message, 'warning', options);
  }, [addToast]);

  const showInfo = useCallback((message, options) => {
    return addToast(message, 'info', options);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={0} // Managed by context
          position={toast.position}
          onClose={() => removeToast(toast.id)}
          show={true}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastContext;