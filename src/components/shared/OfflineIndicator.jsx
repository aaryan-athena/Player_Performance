import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useToast } from '../../contexts/ToastContext';

/**
 * Offline indicator component for network status feedback
 * Requirements: 7.5 - Offline indicators and graceful degradation
 */
const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { showWarning, showSuccess } = useToast();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      showWarning('You are currently offline. Some features may not be available.', {
        duration: 0, // Don't auto-dismiss
        position: 'top-center'
      });
    } else if (wasOffline && isOnline) {
      setShowBanner(false);
      showSuccess('Connection restored! You are back online.', {
        duration: 3000,
        position: 'top-center'
      });
    } else {
      setShowBanner(false);
    }
  }, [isOnline, wasOffline, showWarning, showSuccess]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>You're offline. Some features may not work properly.</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;