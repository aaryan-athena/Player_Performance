import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Offline Context for managing offline state and data caching
 * Requirements: 7.5 - Graceful degradation for offline use
 */
const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [offlineData, setOfflineData] = useState({});
  const [pendingActions, setPendingActions] = useState([]);

  // Load cached data from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('offlineData');
      if (cached) {
        setOfflineData(JSON.parse(cached));
      }

      const pending = localStorage.getItem('pendingActions');
      if (pending) {
        setPendingActions(JSON.parse(pending));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }, []);

  // Save data to localStorage when offline data changes
  useEffect(() => {
    try {
      localStorage.setItem('offlineData', JSON.stringify(offlineData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }, [offlineData]);

  // Save pending actions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }, [pendingActions]);

  // Process pending actions when coming back online
  useEffect(() => {
    if (isOnline && wasOffline && pendingActions.length > 0) {
      processPendingActions();
    }
  }, [isOnline, wasOffline, pendingActions]);

  const cacheData = useCallback((key, data) => {
    setOfflineData(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  const getCachedData = useCallback((key, maxAge = 5 * 60 * 1000) => { // 5 minutes default
    const cached = offlineData[key];
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > maxAge;
    if (isExpired) {
      // Remove expired data
      setOfflineData(prev => {
        const newData = { ...prev };
        delete newData[key];
        return newData;
      });
      return null;
    }

    return cached.data;
  }, [offlineData]);

  const addPendingAction = useCallback((action) => {
    const actionWithId = {
      ...action,
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    };

    setPendingActions(prev => [...prev, actionWithId]);
    return actionWithId.id;
  }, []);

  const removePendingAction = useCallback((actionId) => {
    setPendingActions(prev => prev.filter(action => action.id !== actionId));
  }, []);

  const processPendingActions = useCallback(async () => {
    const actionsToProcess = [...pendingActions];
    
    for (const action of actionsToProcess) {
      try {
        if (action.handler) {
          await action.handler(action.data);
          removePendingAction(action.id);
        }
      } catch (error) {
        console.error('Error processing pending action:', error);
        // Keep the action in the queue for retry
      }
    }
  }, [pendingActions, removePendingAction]);

  const clearOfflineData = useCallback(() => {
    setOfflineData({});
    setPendingActions([]);
    localStorage.removeItem('offlineData');
    localStorage.removeItem('pendingActions');
  }, []);

  const isDataStale = useCallback((key, maxAge = 5 * 60 * 1000) => {
    const cached = offlineData[key];
    if (!cached) return true;
    return Date.now() - cached.timestamp > maxAge;
  }, [offlineData]);

  const value = {
    isOnline,
    wasOffline,
    offlineData,
    pendingActions,
    cacheData,
    getCachedData,
    addPendingAction,
    removePendingAction,
    processPendingActions,
    clearOfflineData,
    isDataStale
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineContext;