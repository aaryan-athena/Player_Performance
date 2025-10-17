/**
 * Match service for handling match data submission with integrated performance calculation
 * Requirements: 3.4, 3.5, 4.6 - Integration of calculation with data storage
 */

import { firestoreService } from './firestoreService.js';
import { calculatePerformanceScore } from './performanceCalculator.js';
import { generateComprehensiveSuggestions } from './suggestionEngine.js';
import { createMatchData } from '../models/matchData.js';
import { validateMatchData, validateSportParameters } from '../utils/validators.js';

/**
 * Match service class for handling match operations with performance calculation
 */
class MatchService {

  /**
   * Submit match data with automatic performance calculation and suggestion generation
   * @param {Object} matchData - Match data object
   * @param {string} matchData.playerId - Player ID
   * @param {string} matchData.coachId - Coach ID
   * @param {string} matchData.sport - Sport type
   * @param {Object} matchData.parameters - Sport-specific parameters
   * @param {Date} matchData.date - Match date (optional, defaults to now)
   * @returns {Promise<Object>} Created match with calculated score and suggestions
   */
  async submitMatchData(matchData) {
    try {
      // Validate match data structure
      const matchValidation = validateMatchData(matchData);
      if (!matchValidation.isValid) {
        throw new Error(`Invalid match data: ${Object.values(matchValidation.errors).join(', ')}`);
      }

      // Validate sport-specific parameters
      const paramValidation = validateSportParameters(matchData.sport, matchData.parameters);
      if (!paramValidation.isValid) {
        throw new Error(`Invalid sport parameters: ${Object.values(paramValidation.errors).join(', ')}`);
      }

      // Calculate performance score
      const calculatedScore = calculatePerformanceScore(matchData.sport, matchData.parameters);

      // Get recent scores for trend analysis
      const recentMatches = await this.getPlayerRecentMatches(matchData.playerId, 10);
      const recentScores = recentMatches.map(match => match.calculatedScore).filter(score => score !== null);

      // Generate comprehensive suggestions
      const suggestionPackage = generateComprehensiveSuggestions(
        calculatedScore,
        matchData.sport,
        matchData.parameters,
        recentScores
      );

      // Create complete match data object
      const completeMatchData = createMatchData({
        ...matchData,
        calculatedScore,
        suggestions: suggestionPackage.suggestions.map(s => s.message),
        restRecommendation: suggestionPackage.restRecommendation
      });

      // Save match data to Firestore
      const matchId = await firestoreService.create('matches', completeMatchData);

      // Update player statistics
      await this.updatePlayerStatistics(matchData.playerId, calculatedScore);

      // Return complete match data with ID
      return {
        id: matchId,
        ...completeMatchData,
        suggestionPackage
      };

    } catch (error) {
      console.error('Error submitting match data:', error);
      throw error;
    }
  }

  /**
   * Get recent matches for a player using email-based mapping
   * @param {string} playerId - Player ID (user UID)
   * @param {number} limit - Number of recent matches to retrieve
   * @returns {Promise<Array>} Array of recent matches
   */
  async getPlayerRecentMatches(playerId, limit = 10) {
    try {
      // Get player's email from their user profile
      const userProfile = await firestoreService.getUserProfile(playerId);
      if (!userProfile || !userProfile.email) {
        console.warn('No user profile or email found for player:', playerId);
        return [];
      }

      const playerEmail = userProfile.email;

      // Query matches using email (more reliable than ID)
      const emailFilters = [{ field: 'playerEmail', operator: '==', value: playerEmail }];
      let matches = await firestoreService.query('matches', emailFilters);

      // Fallback: also try with playerId for older matches that might not have email
      if (matches.length === 0) {
        const idFilters = [{ field: 'playerId', operator: '==', value: playerId }];
        matches = await firestoreService.query('matches', idFilters);
      }

      console.log(`Found ${matches.length} matches for ${playerEmail}`);

      // Sort by date in memory (newest first) and apply limit
      return matches
        .sort((a, b) => {
          const aTime = a.date?.toMillis?.() || 0;
          const bTime = b.date?.toMillis?.() || 0;
          return bTime - aTime;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting player recent matches:', error);
      throw error;
    }
  }

  /**
   * Get all matches for a player using email-based mapping
   * @param {string} playerId - Player ID (user UID)
   * @param {string} sport - Optional sport filter
   * @returns {Promise<Array>} Array of player matches
   */
  async getPlayerMatches(playerId, sport = null) {
    try {
      // Get player's email from their user profile
      const userProfile = await firestoreService.getUserProfile(playerId);
      if (!userProfile || !userProfile.email) {
        console.warn('No user profile or email found for player:', playerId);
        return [];
      }

      const playerEmail = userProfile.email;

      // Query matches using email (more reliable than ID)
      const emailFilters = [{ field: 'playerEmail', operator: '==', value: playerEmail }];
      if (sport) {
        emailFilters.push({ field: 'sport', operator: '==', value: sport });
      }

      let matches = await firestoreService.query('matches', emailFilters);

      // Fallback: also try with playerId for older matches that might not have email
      if (matches.length === 0) {
        const idFilters = [{ field: 'playerId', operator: '==', value: playerId }];
        if (sport) {
          idFilters.push({ field: 'sport', operator: '==', value: sport });
        }
        matches = await firestoreService.query('matches', idFilters);
      }

      console.log(`Found ${matches.length} matches for ${playerEmail}${sport ? ` (${sport})` : ''}`);

      // Sort by date in memory (newest first)
      return matches.sort((a, b) => {
        const aTime = a.date?.toMillis?.() || 0;
        const bTime = b.date?.toMillis?.() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting player matches:', error);
      throw error;
    }
  }

  /**
   * Get matches for all players of a coach
   * @param {string} coachId - Coach ID
   * @param {number} limit - Optional limit for number of matches
   * @returns {Promise<Array>} Array of matches for coach's players
   */
  async getCoachMatches(coachId, limit = null) {
    try {
      const filters = [{ field: 'coachId', operator: '==', value: coachId }];
      // Query without ordering to avoid index requirement, then sort and limit in memory
      const matches = await firestoreService.query('matches', filters);
      // Sort by date in memory (newest first)
      const sortedMatches = matches.sort((a, b) => {
        const aTime = a.date?.toMillis?.() || 0;
        const bTime = b.date?.toMillis?.() || 0;
        return bTime - aTime;
      });
      // Apply limit if specified
      return limit ? sortedMatches.slice(0, limit) : sortedMatches;
    } catch (error) {
      console.error('Error getting coach matches:', error);
      throw error;
    }
  }

  /**
   * Get match by ID with full details
   * @param {string} matchId - Match ID
   * @returns {Promise<Object|null>} Match data or null if not found
   */
  async getMatchById(matchId) {
    try {
      return await firestoreService.read('matches', matchId);
    } catch (error) {
      console.error('Error getting match by ID:', error);
      throw error;
    }
  }

  /**
   * Update player statistics after a new match
   * @param {string} playerId - Player ID
   * @param {number} newScore - New performance score
   * @returns {Promise<void>}
   */
  async updatePlayerStatistics(playerId, newScore) {
    try {
      // Get current player stats
      const player = await firestoreService.read('players', playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      // Calculate new statistics
      const currentMatchCount = player.matchCount || 0;
      const currentTotalScore = player.totalScore || 0;

      const newMatchCount = currentMatchCount + 1;
      const newTotalScore = currentTotalScore + newScore;
      const newAverageScore = newTotalScore / newMatchCount;

      // Update player statistics
      const updatedStats = {
        currentScore: newScore,
        matchCount: newMatchCount,
        totalScore: newTotalScore,
        averageScore: Math.round(newAverageScore * 100) / 100, // Round to 2 decimal places
        lastMatchDate: new Date()
      };

      await firestoreService.updatePlayerStats(playerId, updatedStats);

    } catch (error) {
      console.error('Error updating player statistics:', error);
      throw error;
    }
  }

  /**
   * Get player performance summary with trend analysis using email-based mapping
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} Player performance summary
   */
  async getPlayerPerformanceSummary(playerId) {
    try {
      // Get user profile first (contains email)
      const userProfile = await firestoreService.read('users', playerId);
      if (!userProfile) {
        throw new Error('Player not found');
      }

      // Try to get player stats from players collection
      let player = await firestoreService.read('players', playerId);

      // If not found in players collection, create basic player object
      if (!player) {
        player = {
          id: playerId,
          playerId: playerId,
          name: userProfile.name,
          email: userProfile.email,
          sport: userProfile.sport,
          coachId: userProfile.coachId || null,
          currentScore: 0,
          matchCount: 0,
          averageScore: 0,
          totalScore: 0
        };
      }

      // Get recent matches using email-based query
      const recentMatches = await this.getPlayerRecentMatches(playerId, 10);
      const recentScores = recentMatches.map(match => match.calculatedScore).filter(score => score !== null);

      console.log(`Performance summary for ${userProfile.email}: ${recentMatches.length} matches, ${recentScores.length} scores`);

      // Calculate trend
      let trend = 'stable';
      if (recentScores.length >= 4) {
        const recent3 = recentScores.slice(0, 3);
        const older3 = recentScores.slice(3, 6);

        if (older3.length > 0) {
          const recentAvg = recent3.reduce((sum, score) => sum + score, 0) / recent3.length;
          const olderAvg = older3.reduce((sum, score) => sum + score, 0) / older3.length;
          const difference = recentAvg - olderAvg;

          if (difference > 5) {
            trend = 'improving';
          } else if (difference < -5) {
            trend = 'declining';
          }
        }
      }

      // Update calculated values based on actual match data if available
      if (recentScores.length > 0) {
        player.currentScore = recentScores[0] || 0;
        player.averageScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        player.matchCount = recentMatches.length;
      }

      return {
        ...player,
        recentScores: recentScores.slice(0, 5), // Last 5 scores
        trend,
        performanceHistory: recentMatches.slice(0, 5).map(match => ({
          date: match.date,
          score: match.calculatedScore,
          sport: match.sport
        }))
      };

    } catch (error) {
      console.error('Error getting player performance summary:', error);
      throw error;
    }
  }

  /**
   * Get team performance overview for a coach
   * @param {string} coachId - Coach ID
   * @returns {Promise<Object>} Team performance overview
   */
  async getTeamPerformanceOverview(coachId) {
    try {
      // Get all players for the coach
      const players = await firestoreService.getPlayersByCoach(coachId);

      // Get recent matches for all players
      const recentMatches = await this.getCoachMatches(coachId, 50);

      // Calculate team statistics
      const teamStats = {
        totalPlayers: players.length,
        totalMatches: recentMatches.length,
        averageTeamScore: 0,
        topPerformer: null,
        recentActivity: []
      };

      if (players.length > 0) {
        // Calculate average team score
        const totalScore = players.reduce((sum, player) => sum + (player.averageScore || 0), 0);
        teamStats.averageTeamScore = Math.round((totalScore / players.length) * 100) / 100;

        // Find top performer
        teamStats.topPerformer = players.reduce((top, player) => {
          return (player.averageScore || 0) > (top?.averageScore || 0) ? player : top;
        }, null);

        // Get recent activity (last 10 matches)
        teamStats.recentActivity = recentMatches.slice(0, 10).map(match => {
          const player = players.find(p => p.playerId === match.playerId);
          return {
            playerName: player?.name || 'Unknown',
            sport: match.sport,
            score: match.calculatedScore,
            date: match.date
          };
        });
      }

      return teamStats;

    } catch (error) {
      console.error('Error getting team performance overview:', error);
      throw error;
    }
  }

  /**
   * Delete a match and update player statistics
   * @param {string} matchId - Match ID
   * @returns {Promise<void>}
   */
  async deleteMatch(matchId) {
    try {
      // Get match data before deletion
      const match = await this.getMatchById(matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      // Delete the match
      await firestoreService.delete('matches', matchId);

      // Recalculate player statistics
      await this.recalculatePlayerStatistics(match.playerId);

    } catch (error) {
      console.error('Error deleting match:', error);
      throw error;
    }
  }

  /**
   * Recalculate player statistics from all matches
   * @param {string} playerId - Player ID
   * @returns {Promise<void>}
   */
  async recalculatePlayerStatistics(playerId) {
    try {
      // Get all matches for the player
      const matches = await this.getPlayerMatches(playerId);

      if (matches.length === 0) {
        // No matches, reset stats
        const resetStats = {
          currentScore: 0,
          matchCount: 0,
          totalScore: 0,
          averageScore: 0,
          lastMatchDate: null
        };

        await firestoreService.updatePlayerStats(playerId, resetStats);
        return;
      }

      // Calculate statistics from all matches
      const validScores = matches.map(m => m.calculatedScore).filter(score => score !== null);
      const totalScore = validScores.reduce((sum, score) => sum + score, 0);
      const averageScore = validScores.length > 0 ? totalScore / validScores.length : 0;
      const lastMatch = matches[0]; // Most recent match (sorted by date desc)

      const updatedStats = {
        currentScore: lastMatch.calculatedScore || 0,
        matchCount: matches.length,
        totalScore: totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        lastMatchDate: lastMatch.date
      };

      await firestoreService.updatePlayerStats(playerId, updatedStats);

    } catch (error) {
      console.error('Error recalculating player statistics:', error);
      throw error;
    }
  }

  /**
   * Set up real-time listener for player matches
   * @param {string} playerId - Player ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  onPlayerMatchesChange(playerId, callback) {
    try {
      const filters = [{ field: 'playerId', operator: '==', value: playerId }];
      return firestoreService.onQueryChange('matches', filters, callback, 'date', 'desc');
    } catch (error) {
      console.error('Error setting up player matches listener:', error);
      throw error;
    }
  }

  /**
   * Set up real-time listener for coach matches
   * @param {string} coachId - Coach ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  onCoachMatchesChange(coachId, callback) {
    try {
      const filters = [{ field: 'coachId', operator: '==', value: coachId }];
      return firestoreService.onQueryChange('matches', filters, callback, 'date', 'desc');
    } catch (error) {
      console.error('Error setting up coach matches listener:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const matchService = new MatchService();
export default matchService;