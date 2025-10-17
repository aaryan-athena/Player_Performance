import React, { useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOffline } from '../../contexts/OfflineContext';

/**
 * Offline status component showing connection and pending actions
 * Requirements: 7.5 - Offline indicators and pending action status
 */
const OfflineStatus = ({ className = "" }) => {
  const { isOnline } = useNetworkStatus();
  const { pendingActions, processPendingActions } = useOffline();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSyncPending = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    setIsProcessing(true);
    try {
      await processPendingActions();
    } catch (error) {
      console.error('Error syncing pending actions:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`text-xs font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-yellow-700">
            {pendingActions.length} pending
          </span>
          
          {isOnline && (
            <button
              onClick={handleSyncPending}
              disabled={isProcessing}
              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
            >
              {isProcessing ? 'Syncing...' : 'Sync'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineStatus;