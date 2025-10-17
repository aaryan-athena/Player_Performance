import { firestoreService } from './firestoreService';
import { useOffline } from '../contexts/OfflineContext';

/**
 * Enhanced Firestore service with offline support
 * Requirements: 7.5 - Graceful degradation for offline use
 */
export class OfflineFirestoreService {
  constructor() {
    this.offlineContext = null;
  }

  setOfflineContext(context) {
    this.offlineContext = context;
  }

  async getData(collection, docId, options = {}) {
    const { useCache = true, maxAge = 5 * 60 * 1000 } = options;
    const cacheKey = `${collection}_${docId}`;

    if (!this.offlineContext) {
      return firestoreService.getDocument(collection, docId);
    }

    const { isOnline, getCachedData, cacheData } = this.offlineContext;

    // If offline, try to get cached data
    if (!isOnline) {
      const cachedData = getCachedData(cacheKey, maxAge);
      if (cachedData) {
        return cachedData;
      }
      throw new Error('No cached data available offline');
    }

    // If online, fetch fresh data and cache it
    try {
      const data = await firestoreService.getDocument(collection, docId);
      if (useCache) {
        cacheData(cacheKey, data);
      }
      return data;
    } catch (error) {
      // If online request fails, fallback to cache
      if (useCache) {
        const cachedData = getCachedData(cacheKey, maxAge);
        if (cachedData) {
          return cachedData;
        }
      }
      throw error;
    }
  }

  async getCollection(collection, options = {}) {
    const { useCache = true, maxAge = 5 * 60 * 1000 } = options;
    const cacheKey = `collection_${collection}`;

    if (!this.offlineContext) {
      return firestoreService.getCollection(collection);
    }

    const { isOnline, getCachedData, cacheData } = this.offlineContext;

    // If offline, try to get cached data
    if (!isOnline) {
      const cachedData = getCachedData(cacheKey, maxAge);
      if (cachedData) {
        return cachedData;
      }
      throw new Error('No cached data available offline');
    }

    // If online, fetch fresh data and cache it
    try {
      const data = await firestoreService.getCollection(collection);
      if (useCache) {
        cacheData(cacheKey, data);
      }
      return data;
    } catch (error) {
      // If online request fails, fallback to cache
      if (useCache) {
        const cachedData = getCachedData(cacheKey, maxAge);
        if (cachedData) {
          return cachedData;
        }
      }
      throw error;
    }
  }

  async createDocument(collection, data, options = {}) {
    if (!this.offlineContext) {
      return firestoreService.createDocument(collection, data);
    }

    const { isOnline, addPendingAction } = this.offlineContext;

    if (!isOnline) {
      // Queue the action for when we're back online
      const actionId = addPendingAction({
        type: 'create',
        collection,
        data,
        handler: async (actionData) => {
          return firestoreService.createDocument(collection, actionData.data);
        }
      });

      // Return a temporary ID for optimistic updates
      return { id: `temp_${actionId}`, ...data };
    }

    // If online, execute immediately
    return firestoreService.createDocument(collection, data);
  }

  async updateDocument(collection, docId, data, options = {}) {
    if (!this.offlineContext) {
      return firestoreService.updateDocument(collection, docId, data);
    }

    const { isOnline, addPendingAction, cacheData } = this.offlineContext;

    if (!isOnline) {
      // Update local cache optimistically
      const cacheKey = `${collection}_${docId}`;
      cacheData(cacheKey, { id: docId, ...data });

      // Queue the action for when we're back online
      addPendingAction({
        type: 'update',
        collection,
        docId,
        data,
        handler: async (actionData) => {
          return firestoreService.updateDocument(collection, docId, actionData.data);
        }
      });

      return { id: docId, ...data };
    }

    // If online, execute immediately
    return firestoreService.updateDocument(collection, docId, data);
  }

  async deleteDocument(collection, docId, options = {}) {
    if (!this.offlineContext) {
      return firestoreService.deleteDocument(collection, docId);
    }

    const { isOnline, addPendingAction } = this.offlineContext;

    if (!isOnline) {
      // Queue the action for when we're back online
      addPendingAction({
        type: 'delete',
        collection,
        docId,
        handler: async () => {
          return firestoreService.deleteDocument(collection, docId);
        }
      });

      return { success: true };
    }

    // If online, execute immediately
    return firestoreService.deleteDocument(collection, docId);
  }
}

// Create a singleton instance
export const offlineFirestoreService = new OfflineFirestoreService();

// Hook to use the offline-aware Firestore service
export const useOfflineFirestore = () => {
  const offlineContext = useOffline();
  
  // Set the context in the service
  if (offlineContext) {
    offlineFirestoreService.setOfflineContext(offlineContext);
  }

  return offlineFirestoreService;
};

export default offlineFirestoreService;