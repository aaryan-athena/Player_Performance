import { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '../services/firestoreService.js';

/**
 * Custom hook for Firestore operations
 * Provides state management and error handling for Firestore operations
 */
export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute a Firestore operation with loading and error handling
   * @param {Function} operation - Async function to execute
   * @returns {Promise<any>} Result of the operation
   */
  const executeOperation = useCallback(async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    executeOperation,
    // Direct access to firestoreService methods
    create: (collection, data, docId) => executeOperation(() => firestoreService.create(collection, data, docId)),
    read: (collection, docId) => executeOperation(() => firestoreService.read(collection, docId)),
    update: (collection, docId, data) => executeOperation(() => firestoreService.update(collection, docId, data)),
    delete: (collection, docId) => executeOperation(() => firestoreService.delete(collection, docId)),
    query: (collection, filters, orderBy, direction, limit) => 
      executeOperation(() => firestoreService.query(collection, filters, orderBy, direction, limit)),
    
    // User profile methods
    createUserProfile: (userId, userData) => executeOperation(() => firestoreService.createUserProfile(userId, userData)),
    getUserProfile: (userId) => executeOperation(() => firestoreService.getUserProfile(userId)),
    updateUserProfile: (userId, updates) => executeOperation(() => firestoreService.updateUserProfile(userId, updates)),
    getUsersByRole: (role) => executeOperation(() => firestoreService.getUsersByRole(role)),
    
    // Player-coach relationship methods
    assignPlayerToCoach: (playerId, coachId) => executeOperation(() => firestoreService.assignPlayerToCoach(playerId, coachId)),
    removePlayerFromCoach: (playerId) => executeOperation(() => firestoreService.removePlayerFromCoach(playerId)),
    getPlayersByCoach: (coachId) => executeOperation(() => firestoreService.getPlayersByCoach(coachId)),
    getPlayerDetails: (playerId) => executeOperation(() => firestoreService.getPlayerDetails(playerId)),
    updatePlayerStats: (playerId, stats) => executeOperation(() => firestoreService.updatePlayerStats(playerId, stats)),
    getUnassignedPlayers: () => executeOperation(() => firestoreService.getUnassignedPlayers()),
    
    // Batch operations
    batchWrite: (operations) => executeOperation(() => firestoreService.batchWrite(operations))
  };
};

/**
 * Hook for real-time document listening
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Object} Document data, loading state, and error
 */
export const useDocument = (collection, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collection || !docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = firestoreService.onDocumentChange(
      collection,
      docId,
      (docData, err) => {
        if (err) {
          setError(err);
        } else {
          setData(docData);
        }
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collection, docId]);

  return { data, loading, error };
};

/**
 * Hook for real-time query listening
 * @param {string} collection - Collection name
 * @param {Array} filters - Query filters
 * @param {string} orderByField - Field to order by
 * @param {string} orderDirection - Order direction
 * @returns {Object} Query results, loading state, and error
 */
export const useQuery = (collection, filters = [], orderByField = null, orderDirection = 'asc') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collection) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = firestoreService.onQueryChange(
      collection,
      filters,
      (queryData, err) => {
        if (err) {
          setError(err);
        } else {
          setData(queryData);
        }
        setLoading(false);
      },
      orderByField,
      orderDirection
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collection, JSON.stringify(filters), orderByField, orderDirection]);

  return { data, loading, error };
};

/**
 * Hook for player-coach relationships
 * @param {string} coachId - Coach ID
 * @returns {Object} Players data and management functions
 */
export const usePlayerManagement = (coachId) => {
  const [players, setPlayers] = useState([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { executeOperation } = useFirestore();

  // Load coach's players
  const loadPlayers = useCallback(async () => {
    if (!coachId) return;
    
    try {
      setLoading(true);
      const playersData = await firestoreService.getPlayersByCoach(coachId);
      setPlayers(playersData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  // Load unassigned players
  const loadUnassignedPlayers = useCallback(async () => {
    try {
      const unassigned = await firestoreService.getUnassignedPlayers();
      setUnassignedPlayers(unassigned);
    } catch (err) {
      setError(err);
    }
  }, []);

  // Assign player to coach
  const assignPlayer = useCallback(async (playerId) => {
    return executeOperation(async () => {
      await firestoreService.assignPlayerToCoach(playerId, coachId);
      await loadPlayers();
      await loadUnassignedPlayers();
    });
  }, [coachId, executeOperation, loadPlayers, loadUnassignedPlayers]);

  // Remove player from coach
  const removePlayer = useCallback(async (playerId) => {
    return executeOperation(async () => {
      await firestoreService.removePlayerFromCoach(playerId);
      await loadPlayers();
      await loadUnassignedPlayers();
    });
  }, [executeOperation, loadPlayers, loadUnassignedPlayers]);

  // Update player stats
  const updatePlayerStats = useCallback(async (playerId, stats) => {
    return executeOperation(async () => {
      await firestoreService.updatePlayerStats(playerId, stats);
      await loadPlayers();
    });
  }, [executeOperation, loadPlayers]);

  useEffect(() => {
    if (coachId) {
      loadPlayers();
    }
    loadUnassignedPlayers();
  }, [coachId, loadPlayers, loadUnassignedPlayers]);

  return {
    players,
    unassignedPlayers,
    loading,
    error,
    assignPlayer,
    removePlayer,
    updatePlayerStats,
    refreshPlayers: loadPlayers,
    refreshUnassigned: loadUnassignedPlayers
  };
};

export default useFirestore;