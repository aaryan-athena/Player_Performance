/**
 * Real-time data synchronization service
 * Manages real-time listeners and ensures data consistency across components
 * Requirements: 3.4, 3.5, 5.1 - Real-time data synchronization
 */

import { firestoreService } from './firestoreService.js';

/**
 * Real-time service for managing data synchronization
 */
class RealtimeService {
  constructor() {
    this.listeners = new Map();
    this.subscriptions = new Map();
  }

  /**
   * Subscribe to player performance updates
   * @param {string} playerId - Player ID
   * @param {Function} callback - Callback function for updates
   * @returns {string} Subscription ID
   */
  subscribeToPlayerUpdates(playerId, callback) {
    const subscriptionId = `player-${playerId}-${Date.now()}`;
    
    try {
      // Set up listener for player matches
      const matchesUnsubscribe = firestoreService.onQueryChange(
        'matches',
        [{ field: 'playerId', operator: '==', value: playerId }],
        (matches) => {
          callback({
            type: 'matches_updated',
            playerId,
            data: matches
          });
        },
        'date',
        'desc'
      );

      // Set up listener for player profile updates
      const playerUnsubscribe = firestoreService.onDocumentChange(
        'players',
        playerId,
        (playerData) => {
          callback({
            type: 'player_updated',
            playerId,
            data: playerData
          });
        }
      );

      // Store unsubscribe functions
      this.subscriptions.set(subscriptionId, {
        matches: matchesUnsubscribe,
        player: playerUnsubscribe
      });

      return subscriptionId;
    } catch (error) {
      console.error('Error setting up player subscription:', error);
      throw error;
    }
  }

  /**
   * Subscribe to coach team updates
   * @param {string} coachId - Coach ID
   * @param {Function} callback - Callback function for updates
   * @returns {string} Subscription ID
   */
  subscribeToCoachUpdates(coachId, callback) {
    const subscriptionId = `coach-${coachId}-${Date.now()}`;
    
    try {
      // Set up listener for coach's players
      const playersUnsubscribe = firestoreService.onQueryChange(
        'players',
        [{ field: 'coachId', operator: '==', value: coachId }],
        (players) => {
          callback({
            type: 'players_updated',
            coachId,
            data: players
          });
        },
        'name',
        'asc'
      );

      // Set up listener for all matches by coach
      const matchesUnsubscribe = firestoreService.onQueryChange(
        'matches',
        [{ field: 'coachId', operator: '==', value: coachId }],
        (matches) => {
          callback({
            type: 'team_matches_updated',
            coachId,
            data: matches
          });
        },
        'date',
        'desc'
      );

      // Store unsubscribe functions
      this.subscriptions.set(subscriptionId, {
        players: playersUnsubscribe,
        matches: matchesUnsubscribe
      });

      return subscriptionId;
    } catch (error) {
      console.error('Error setting up coach subscription:', error);
      throw error;
    }
  }

  /**
   * Subscribe to specific match updates
   * @param {string} matchId - Match ID
   * @param {Function} callback - Callback function for updates
   * @returns {string} Subscription ID
   */
  subscribeToMatchUpdates(matchId, callback) {
    const subscriptionId = `match-${matchId}-${Date.now()}`;
    
    try {
      const unsubscribe = firestoreService.onDocumentChange(
        'matches',
        matchId,
        (matchData) => {
          callback({
            type: 'match_updated',
            matchId,
            data: matchData
          });
        }
      );

      this.subscriptions.set(subscriptionId, { match: unsubscribe });
      return subscriptionId;
    } catch (error) {
      console.error('Error setting up match subscription:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from updates
   * @param {string} subscriptionId - Subscription ID to unsubscribe
   */
  unsubscribe(subscriptionId) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        // Call all unsubscribe functions
        Object.values(subscription).forEach(unsubscribeFn => {
          if (typeof unsubscribeFn === 'function') {
            unsubscribeFn();
          }
        });
        
        this.subscriptions.delete(subscriptionId);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  }

  /**
   * Unsubscribe all listeners
   */
  unsubscribeAll() {
    try {
      this.subscriptions.forEach((subscription, subscriptionId) => {
        this.unsubscribe(subscriptionId);
      });
      this.subscriptions.clear();
    } catch (error) {
      console.error('Error unsubscribing all:', error);
    }
  }

  /**
   * Get active subscription count
   * @returns {number} Number of active subscriptions
   */
  getActiveSubscriptionCount() {
    return this.subscriptions.size;
  }

  /**
   * Check if a subscription is active
   * @param {string} subscriptionId - Subscription ID
   * @returns {boolean} True if subscription is active
   */
  isSubscriptionActive(subscriptionId) {
    return this.subscriptions.has(subscriptionId);
  }

  /**
   * Broadcast update to multiple subscribers
   * @param {string} type - Update type
   * @param {Object} data - Update data
   */
  broadcastUpdate(type, data) {
    try {
      // This could be extended to support broadcasting to multiple listeners
      // For now, individual subscriptions handle their own updates
      console.log(`Broadcasting update: ${type}`, data);
    } catch (error) {
      console.error('Error broadcasting update:', error);
    }
  }

  /**
   * Set up cross-component data synchronization
   * Ensures that when coach adds match data, player dashboard updates immediately
   * @param {string} playerId - Player ID
   * @param {string} coachId - Coach ID
   * @returns {Object} Synchronization controls
   */
  setupCrossComponentSync(playerId, coachId) {
    const syncId = `sync-${playerId}-${coachId}-${Date.now()}`;
    const callbacks = [];

    try {
      // Listen for new matches added by coach
      const matchListener = firestoreService.onQueryChange(
        'matches',
        [
          { field: 'playerId', operator: '==', value: playerId },
          { field: 'coachId', operator: '==', value: coachId }
        ],
        (matches) => {
          // Notify all registered callbacks
          callbacks.forEach(callback => {
            callback({
              type: 'cross_component_sync',
              event: 'match_added',
              playerId,
              coachId,
              matches
            });
          });
        },
        'date',
        'desc'
      );

      // Listen for player stats updates
      const playerListener = firestoreService.onDocumentChange(
        'players',
        playerId,
        (playerData) => {
          callbacks.forEach(callback => {
            callback({
              type: 'cross_component_sync',
              event: 'player_stats_updated',
              playerId,
              coachId,
              playerData
            });
          });
        }
      );

      return {
        syncId,
        addCallback: (callback) => {
          callbacks.push(callback);
        },
        removeCallback: (callback) => {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        },
        destroy: () => {
          matchListener();
          playerListener();
          callbacks.length = 0;
        }
      };
    } catch (error) {
      console.error('Error setting up cross-component sync:', error);
      throw error;
    }
  }

  /**
   * Optimize real-time performance by batching updates
   * @param {Function} callback - Callback to debounce
   * @param {number} delay - Debounce delay in milliseconds
   * @returns {Function} Debounced callback
   */
  debounceUpdates(callback, delay = 300) {
    let timeoutId;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback.apply(this, args);
      }, delay);
    };
  }

  /**
   * Handle connection state changes
   * @param {Function} onOnline - Callback for when connection is restored
   * @param {Function} onOffline - Callback for when connection is lost
   */
  handleConnectionState(onOnline, onOffline) {
    const handleOnline = () => {
      console.log('Connection restored - resyncing data');
      if (onOnline) onOnline();
    };

    const handleOffline = () => {
      console.log('Connection lost - entering offline mode');
      if (onOffline) onOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService;