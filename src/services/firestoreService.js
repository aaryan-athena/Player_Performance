import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Firestore service for handling database operations
 * Provides base CRUD operations, user profile management, and player-coach relationships
 */
class FirestoreService {

  // ==================== BASE CRUD OPERATIONS ====================

  /**
   * Create a new document in a collection
   * @param {string} collectionName - Name of the collection
   * @param {Object} data - Data to store
   * @param {string} docId - Optional document ID, if not provided, auto-generated
   * @returns {Promise<string>} Document ID
   */
  async create(collectionName, data, docId = null) {
    try {
      const timestamp = serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      if (docId) {
        await setDoc(doc(db, collectionName, docId), docData);
        return docId;
      } else {
        const docRef = await addDoc(collection(db, collectionName), docData);
        return docRef.id;
      }
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Read a document by ID
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @returns {Promise<Object|null>} Document data or null if not found
   */
  async read(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error reading document ${docId} from ${collectionName}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Update a document
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @param {Object} data - Data to update
   * @returns {Promise<void>}
   */
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating document ${docId} in ${collectionName}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Delete a document
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @returns {Promise<void>}
   */
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Query documents with filters
   * @param {string} collectionName - Name of the collection
   * @param {Array} filters - Array of filter objects [{field, operator, value}]
   * @param {string} orderByField - Field to order by (optional)
   * @param {string} orderDirection - 'asc' or 'desc' (optional)
   * @param {number} limitCount - Number of documents to limit (optional)
   * @returns {Promise<Array>} Array of documents
   */
  async query(collectionName, filters = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    try {
      let q = collection(db, collectionName);

      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const documents = [];

      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return documents;
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Set up real-time listener for a document
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  onDocumentChange(collectionName, docId, callback) {
    try {
      const docRef = doc(db, collectionName, docId);

      return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          });
        } else {
          callback(null);
        }
      }, (error) => {
        console.error(`Error listening to document ${docId}:`, error);
        callback(null, this.handleFirestoreError(error));
      });
    } catch (error) {
      console.error(`Error setting up listener for ${docId}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Set up real-time listener for a query
   * @param {string} collectionName - Name of the collection
   * @param {Array} filters - Array of filter objects
   * @param {Function} callback - Callback function to handle updates
   * @param {string} orderByField - Field to order by (optional)
   * @param {string} orderDirection - 'asc' or 'desc' (optional)
   * @returns {Function} Unsubscribe function
   */
  onQueryChange(collectionName, filters = [], callback, orderByField = null, orderDirection = 'asc') {
    try {
      let q = collection(db, collectionName);

      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Skip orderBy to avoid index requirements - sort in memory instead
      return onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort in memory if orderByField is specified
        if (orderByField) {
          documents.sort((a, b) => {
            const aVal = a[orderByField];
            const bVal = b[orderByField];

            // Handle timestamp objects
            if (aVal?.toMillis && bVal?.toMillis) {
              const aTime = aVal.toMillis();
              const bTime = bVal.toMillis();
              return orderDirection === 'desc' ? bTime - aTime : aTime - bTime;
            }

            // Handle strings
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              const result = aVal.localeCompare(bVal);
              return orderDirection === 'desc' ? -result : result;
            }

            // Handle numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return orderDirection === 'desc' ? bVal - aVal : aVal - bVal;
            }

            // Default comparison
            return 0;
          });
        }

        callback(documents);
      }, (error) => {
        console.error(`Error listening to query:`, error);
        callback([], this.handleFirestoreError(error));
      });
    } catch (error) {
      console.error(`Error setting up query listener:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  // ==================== USER PROFILE MANAGEMENT ====================

  /**
   * Create or update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   * @returns {Promise<void>}
   */
  async createUserProfile(userId, userData) {
    try {
      return await this.create('users', userData, userId);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User profile data
   */
  async getUserProfile(userId) {
    try {
      return await this.read('users', userId);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Data to update
   * @returns {Promise<void>}
   */
  async updateUserProfile(userId, updates) {
    try {
      return await this.update('users', userId, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   * @param {string} role - User role ('coach' or 'player')
   * @returns {Promise<Array>} Array of users with specified role
   */
  async getUsersByRole(role) {
    try {
      const filters = [{ field: 'role', operator: '==', value: role }];
      // Query without ordering to avoid index requirement, then sort in memory
      const users = await this.query('users', filters);
      // Sort by createdAt in memory (newest first)
      return users.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error(`Error getting users by role ${role}:`, error);
      throw error;
    }
  }

  // ==================== PLAYER-COACH RELATIONSHIP MANAGEMENT ====================

  /**
   * Assign a player to a coach
   * @param {string} playerId - Player user ID
   * @param {string} coachId - Coach user ID
   * @returns {Promise<void>}
   */
  async assignPlayerToCoach(playerId, coachId) {
    try {
      // Update player's profile with coach assignment
      await this.updateUserProfile(playerId, { coachId });

      // Create player record in coach's players subcollection
      const playerProfile = await this.getUserProfile(playerId);
      if (!playerProfile) {
        throw new Error('Player profile not found');
      }

      const playerData = {
        playerId: playerId, // This is the actual user UID
        name: playerProfile.name,
        email: playerProfile.email,
        sport: playerProfile.sport,
        coachId: coachId,
        currentScore: 0,
        matchCount: 0,
        averageScore: 0,
        totalScore: 0
      };

      return await this.create('players', playerData, playerId);
    } catch (error) {
      console.error('Error assigning player to coach:', error);
      throw error;
    }
  }

  /**
   * Link a placeholder player record to an actual user account
   * Called when a player signs up with an email that was pre-registered by a coach
   * @param {string} email - Player email
   * @param {string} userId - Actual user UID from Firebase Auth
   * @returns {Promise<void>}
   */
  async linkPlayerToUser(email, userId) {
    try {
      // Find any player records with this email
      const filters = [{ field: 'email', operator: '==', value: email }];
      const playerRecords = await this.query('players', filters);
      
      if (playerRecords.length > 0) {
        // Get the first matching player record
        const playerRecord = playerRecords[0];
        
        // If the player record has a different ID than the user ID, we need to migrate
        if (playerRecord.id !== userId) {
          console.log(`Linking player record ${playerRecord.id} to user ${userId}`);
          
          // Create new player record with correct user ID
          const newPlayerData = {
            ...playerRecord,
            playerId: userId, // Update to actual user UID
            linkedFromPlaceholder: playerRecord.id // Keep reference to old ID
          };
          
          // Create the new record
          await this.create('players', newPlayerData, userId);
          
          // Update all matches to use the new player ID
          const matchFilters = [{ field: 'playerId', operator: '==', value: playerRecord.id }];
          const matches = await this.query('matches', matchFilters);
          
          // Update each match with the new player ID
          const batch = writeBatch(db);
          matches.forEach(match => {
            const matchRef = doc(db, 'matches', match.id);
            batch.update(matchRef, { playerId: userId });
          });
          await batch.commit();
          
          // Delete the old placeholder record
          await this.delete('players', playerRecord.id);
          
          console.log(`Successfully linked ${matches.length} matches to user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error linking player to user:', error);
      // Don't throw - this is a best-effort operation
    }
  }

  /**
   * Remove player from coach
   * @param {string} playerId - Player user ID
   * @returns {Promise<void>}
   */
  async removePlayerFromCoach(playerId) {
    try {
      // Remove coach assignment from player profile
      await this.updateUserProfile(playerId, { coachId: null });

      // Remove player record from players collection
      await this.delete('players', playerId);
    } catch (error) {
      console.error('Error removing player from coach:', error);
      throw error;
    }
  }

  /**
   * Get all players assigned to a coach
   * @param {string} coachId - Coach user ID
   * @returns {Promise<Array>} Array of players assigned to the coach
   */
  async getPlayersByCoach(coachId) {
    try {
      const filters = [{ field: 'coachId', operator: '==', value: coachId }];
      // Query without ordering to avoid index requirement, then sort in memory
      const players = await this.query('players', filters);
      // Sort by name in memory
      return players.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Error getting players by coach:', error);
      throw error;
    }
  }

  /**
   * Get player details including coach information
   * @param {string} playerId - Player user ID
   * @returns {Promise<Object|null>} Player details with coach info
   */
  async getPlayerDetails(playerId) {
    try {
      const player = await this.read('players', playerId);
      if (!player) {
        return null;
      }

      // Get coach information if assigned
      if (player.coachId) {
        const coach = await this.getUserProfile(player.coachId);
        player.coach = coach;
      }

      return player;
    } catch (error) {
      console.error('Error getting player details:', error);
      throw error;
    }
  }

  /**
   * Update player statistics
   * @param {string} playerId - Player user ID
   * @param {Object} stats - Statistics to update (currentScore, matchCount, etc.)
   * @returns {Promise<void>}
   */
  async updatePlayerStats(playerId, stats) {
    try {
      return await this.update('players', playerId, stats);
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw error;
    }
  }

  /**
   * Get unassigned players (players without a coach)
   * @returns {Promise<Array>} Array of unassigned players
   */
  async getUnassignedPlayers() {
    try {
      // Get all players first (only filter by role to avoid Firestore null/undefined issues)
      const filters = [
        { field: 'role', operator: '==', value: 'player' }
      ];
      const allPlayers = await this.query('users', filters);
      
      // Filter unassigned players in memory (handles null, undefined, and empty string cases)
      const unassignedPlayers = allPlayers.filter(player => {
        const coachId = player.coachId;
        return !coachId || coachId === null || coachId === undefined || coachId === '';
      });
      
      // Sort by createdAt in memory (newest first)
      return unassignedPlayers.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting unassigned players:', error);
      throw error;
    }
  }

  /**
   * Batch operations for multiple documents
   * @param {Array} operations - Array of operation objects
   * @returns {Promise<void>}
   */
  async batchWrite(operations) {
    try {
      const batch = writeBatch(db);

      operations.forEach(operation => {
        const { type, collection: collectionName, docId, data } = operation;
        const docRef = doc(db, collectionName, docId);

        switch (type) {
          case 'set':
            batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'update':
            batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Unknown batch operation type: ${type}`);
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error executing batch write:', error);
      throw this.handleFirestoreError(error);
    }
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Handle Firestore errors and return user-friendly messages
   * @param {Error} error - Firestore error object
   * @returns {Error} Formatted error with user-friendly message
   */
  handleFirestoreError(error) {
    let message = 'An unexpected database error occurred. Please try again.';

    switch (error.code) {
      case 'permission-denied':
        message = 'You do not have permission to perform this action.';
        break;
      case 'not-found':
        message = 'The requested data was not found.';
        break;
      case 'already-exists':
        message = 'This data already exists.';
        break;
      case 'resource-exhausted':
        message = 'Database quota exceeded. Please try again later.';
        break;
      case 'failed-precondition':
        message = 'Operation failed due to invalid conditions.';
        break;
      case 'aborted':
        message = 'Operation was aborted due to a conflict. Please try again.';
        break;
      case 'out-of-range':
        message = 'Invalid data range provided.';
        break;
      case 'unimplemented':
        message = 'This operation is not supported.';
        break;
      case 'internal':
        message = 'Internal server error. Please try again later.';
        break;
      case 'unavailable':
        message = 'Service is currently unavailable. Please check your connection.';
        break;
      case 'data-loss':
        message = 'Data loss detected. Please contact support.';
        break;
      case 'unauthenticated':
        message = 'You must be logged in to perform this action.';
        break;
      case 'invalid-argument':
        message = 'Invalid data provided. Please check your input.';
        break;
      case 'deadline-exceeded':
        message = 'Operation timed out. Please try again.';
        break;
      case 'cancelled':
        message = 'Operation was cancelled.';
        break;
      default:
        message = error.message || message;
    }

    const formattedError = new Error(message);
    formattedError.code = error.code;
    formattedError.originalError = error;
    return formattedError;
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
export default firestoreService;