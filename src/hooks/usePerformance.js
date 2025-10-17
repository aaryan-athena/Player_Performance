import { useState, useEffect, useCallback, useRef } from 'react';
import { matchService } from '../services/matchService.js';
import { realtimeService } from '../services/realtimeService.js';

/**
 * Custom hook for managing player performance data
 * @param {string} playerId - Player ID
 * @returns {Object} Performance data and management functions
 */
export const usePerformance = (playerId) => {
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load player performance summary
   */
  const loadPerformanceSummary = useCallback(async () => {
    if (!playerId) return;
    
    try {
      setLoading(true);
      setError(null);
      const summary = await matchService.getPlayerPerformanceSummary(playerId);
      setPerformanceSummary(summary);
    } catch (err) {
      console.error('Error loading performance summary:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  /**
   * Load recent matches for the player
   */
  const loadRecentMatches = useCallback(async (limit = 10) => {
    if (!playerId) return;
    
    try {
      setError(null);
      const matches = await matchService.getPlayerRecentMatches(playerId, limit);
      setRecentMatches(matches);
    } catch (err) {
      console.error('Error loading recent matches:', err);
      setError(err);
    }
  }, [playerId]);

  /**
   * Load all matches for the player with optional sport filter
   */
  const loadAllMatches = useCallback(async (sport = null) => {
    if (!playerId) return;
    
    try {
      setError(null);
      const matches = await matchService.getPlayerMatches(playerId, sport);
      setAllMatches(matches);
    } catch (err) {
      console.error('Error loading all matches:', err);
      setError(err);
    }
  }, [playerId]);

  /**
   * Refresh all performance data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadPerformanceSummary(),
      loadRecentMatches(),
      loadAllMatches()
    ]);
  }, [loadPerformanceSummary, loadRecentMatches, loadAllMatches]);

  /**
   * Get performance trend data for charts
   */
  const getPerformanceTrend = useCallback(() => {
    if (!recentMatches || recentMatches.length === 0) return [];
    
    return recentMatches
      .slice()
      .reverse() // Show chronological order for charts
      .map(match => ({
        date: match.date,
        score: match.calculatedScore,
        sport: match.sport
      }));
  }, [recentMatches]);

  /**
   * Get matches filtered by sport
   */
  const getMatchesBySport = useCallback((sport) => {
    return allMatches.filter(match => match.sport === sport);
  }, [allMatches]);

  /**
   * Get latest suggestions from recent matches
   */
  const getLatestSuggestions = useCallback(() => {
    if (!recentMatches || recentMatches.length === 0) return [];
    
    const latestMatch = recentMatches[0];
    return {
      suggestions: latestMatch.suggestions || [],
      restRecommendation: latestMatch.restRecommendation || null,
      matchDate: latestMatch.date
    };
  }, [recentMatches]);

  // Load initial data when playerId changes
  useEffect(() => {
    if (playerId) {
      refreshData();
    }
  }, [playerId, refreshData]);

  // Set up real-time listener for match updates with enhanced synchronization
  useEffect(() => {
    if (!playerId) return;

    let subscriptionId;
    
    try {
      // Use enhanced real-time service for better synchronization
      subscriptionId = realtimeService.subscribeToPlayerUpdates(playerId, (update) => {
        switch (update.type) {
          case 'matches_updated':
            setRecentMatches(update.data.slice(0, 10));
            setAllMatches(update.data);
            
            // Trigger performance summary reload for significant changes
            if (update.data.length > 0) {
              loadPerformanceSummary();
            }
            break;
            
          case 'player_updated':
            if (update.data) {
              setPerformanceSummary(prev => ({
                ...prev,
                ...update.data
              }));
            }
            break;
            
          default:
            console.log('Unknown update type:', update.type);
        }
      });
    } catch (error) {
      console.error('Error setting up real-time updates:', error);
      setError(error);
    }

    return () => {
      if (subscriptionId) {
        realtimeService.unsubscribe(subscriptionId);
      }
    };
  }, [playerId, loadPerformanceSummary]);

  return {
    // Data
    performanceSummary,
    recentMatches,
    allMatches,
    loading,
    error,
    
    // Computed data
    performanceTrend: getPerformanceTrend(),
    latestSuggestions: getLatestSuggestions(),
    
    // Actions
    refreshData,
    loadRecentMatches,
    loadAllMatches,
    getMatchesBySport,
    
    // Utilities
    clearError: () => setError(null)
  };
};

/**
 * Hook for getting performance statistics
 * @param {Array} matches - Array of match data
 * @returns {Object} Calculated statistics
 */
export const usePerformanceStats = (matches = []) => {
  return {
    totalMatches: matches.length,
    averageScore: matches.length > 0 
      ? Math.round((matches.reduce((sum, match) => sum + (match.calculatedScore || 0), 0) / matches.length) * 100) / 100
      : 0,
    highestScore: matches.length > 0 
      ? Math.max(...matches.map(match => match.calculatedScore || 0))
      : 0,
    lowestScore: matches.length > 0 
      ? Math.min(...matches.map(match => match.calculatedScore || 0))
      : 0,
    recentTrend: matches.length >= 3 ? (() => {
      const recent3 = matches.slice(0, 3);
      const older3 = matches.slice(3, 6);
      
      if (older3.length === 0) return 'insufficient_data';
      
      const recentAvg = recent3.reduce((sum, match) => sum + (match.calculatedScore || 0), 0) / recent3.length;
      const olderAvg = older3.reduce((sum, match) => sum + (match.calculatedScore || 0), 0) / older3.length;
      const difference = recentAvg - olderAvg;
      
      if (difference > 5) return 'improving';
      if (difference < -5) return 'declining';
      return 'stable';
    })() : 'insufficient_data'
  };
};

export default usePerformance;