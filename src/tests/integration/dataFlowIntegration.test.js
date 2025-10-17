/**
 * Integration tests for complete data flow from coach match entry to player dashboard
 * Requirements: 3.4, 3.5, 5.1 - Test complete user workflows and real-time data synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { matchService } from '../../services/matchService.js';
import { firestoreService } from '../../services/firestoreService.js';
import { usePerformance } from '../../hooks/usePerformance.js';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock Firebase
vi.mock('../../config/firebase.js', () => ({
  db: {},
  auth: {}
}));

// Mock Firestore operations
const mockFirestoreOperations = {
  create: vi.fn(),
  read: vi.fn(),
  update: vi.fn(),
  query: vi.fn(),
  onQueryChange: vi.fn(),
  updatePlayerStats: vi.fn(),
  getPlayersByCoach: vi.fn()
};

vi.mock('../../services/firestoreService.js', () => ({
  firestoreService: mockFirestoreOperations
}));

describe('Data Flow Integration Tests', () => {
  const mockCoachId = 'coach-123';
  const mockPlayerId = 'player-456';
  const mockPlayerData = {
    id: mockPlayerId,
    playerId: mockPlayerId,
    name: 'John Doe',
    email: 'john@example.com',
    sport: 'cricket',
    coachId: mockCoachId,
    currentScore: 75,
    matchCount: 5,
    averageScore: 72,
    totalScore: 360
  };

  const mockMatchData = {
    playerId: mockPlayerId,
    coachId: mockCoachId,
    sport: 'cricket',
    parameters: {
      runsScored: 85,
      ballsFaced: 120,
      wicketsTaken: 2,
      catches: 1,
      oversBowled: 8
    },
    date: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    mockFirestoreOperations.read.mockImplementation((collection, id) => {
      if (collection === 'players' && id === mockPlayerId) {
        return Promise.resolve(mockPlayerData);
      }
      return Promise.resolve(null);
    });

    mockFirestoreOperations.query.mockImplementation((collection, filters) => {
      if (collection === 'matches') {
        return Promise.resolve([
          {
            id: 'match-1',
            playerId: mockPlayerId,
            coachId: mockCoachId,
            sport: 'cricket',
            calculatedScore: 78,
            date: { seconds: Date.now() / 1000 },
            suggestions: ['Great batting performance!', 'Work on bowling accuracy']
          }
        ]);
      }
      return Promise.resolve([]);
    });

    mockFirestoreOperations.create.mockResolvedValue('new-match-id');
    mockFirestoreOperations.updatePlayerStats.mockResolvedValue();
    mockFirestoreOperations.getPlayersByCoach.mockResolvedValue([mockPlayerData]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Coach Match Entry to Player Dashboard Flow', () => {
    it('should complete full workflow from match submission to player data update', async () => {
      // Step 1: Coach submits match data
      const matchResult = await matchService.submitMatchData(mockMatchData);

      // Verify match was created with calculated score
      expect(mockFirestoreOperations.create).toHaveBeenCalledWith(
        'matches',
        expect.objectContaining({
          playerId: mockPlayerId,
          coachId: mockCoachId,
          sport: 'cricket',
          calculatedScore: expect.any(Number),
          suggestions: expect.any(Array)
        })
      );

      // Verify player statistics were updated
      expect(mockFirestoreOperations.updatePlayerStats).toHaveBeenCalledWith(
        mockPlayerId,
        expect.objectContaining({
          currentScore: expect.any(Number),
          matchCount: expect.any(Number),
          averageScore: expect.any(Number)
        })
      );

      // Verify match result contains all required data
      expect(matchResult).toMatchObject({
        id: 'new-match-id',
        playerId: mockPlayerId,
        coachId: mockCoachId,
        sport: 'cricket',
        calculatedScore: expect.any(Number),
        suggestions: expect.any(Array),
        suggestionPackage: expect.objectContaining({
          suggestions: expect.any(Array),
          restRecommendation: expect.any(Object)
        })
      });
    });

    it('should handle real-time updates in player dashboard', async () => {
      let realtimeCallback;
      
      // Mock real-time listener setup
      mockFirestoreOperations.onQueryChange.mockImplementation((collection, filters, callback) => {
        realtimeCallback = callback;
        return () => {}; // unsubscribe function
      });

      // Render usePerformance hook
      const { result } = renderHook(() => usePerformance(mockPlayerId));

      // Wait for initial data load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate new match data from real-time listener
      const newMatchData = [
        {
          id: 'match-2',
          playerId: mockPlayerId,
          coachId: mockCoachId,
          sport: 'cricket',
          calculatedScore: 85,
          date: { seconds: Date.now() / 1000 },
          suggestions: ['Excellent performance!']
        },
        {
          id: 'match-1',
          playerId: mockPlayerId,
          coachId: mockCoachId,
          sport: 'cricket',
          calculatedScore: 78,
          date: { seconds: (Date.now() - 86400000) / 1000 },
          suggestions: ['Good effort']
        }
      ];

      act(() => {
        realtimeCallback(newMatchData);
      });

      // Verify hook state updated with new data
      expect(result.current.recentMatches).toHaveLength(2);
      expect(result.current.recentMatches[0].calculatedScore).toBe(85);
      expect(result.current.allMatches).toHaveLength(2);
    });

    it('should maintain data consistency across multiple operations', async () => {
      // Submit multiple matches for the same player
      const matches = [
        { ...mockMatchData, parameters: { ...mockMatchData.parameters, runsScored: 50 } },
        { ...mockMatchData, parameters: { ...mockMatchData.parameters, runsScored: 75 } },
        { ...mockMatchData, parameters: { ...mockMatchData.parameters, runsScored: 100 } }
      ];

      const results = [];
      for (const match of matches) {
        const result = await matchService.submitMatchData(match);
        results.push(result);
      }

      // Verify all matches were created
      expect(mockFirestoreOperations.create).toHaveBeenCalledTimes(3);

      // Verify player stats were updated for each match
      expect(mockFirestoreOperations.updatePlayerStats).toHaveBeenCalledTimes(3);

      // Verify each result has consistent structure
      results.forEach(result => {
        expect(result).toMatchObject({
          id: expect.any(String),
          playerId: mockPlayerId,
          coachId: mockCoachId,
          calculatedScore: expect.any(Number),
          suggestions: expect.any(Array)
        });
      });
    });

    it('should handle error scenarios gracefully', async () => {
      // Mock Firestore error
      mockFirestoreOperations.create.mockRejectedValueOnce(new Error('Network error'));

      // Attempt to submit match data
      await expect(matchService.submitMatchData(mockMatchData)).rejects.toThrow('Network error');

      // Verify player stats were not updated on error
      expect(mockFirestoreOperations.updatePlayerStats).not.toHaveBeenCalled();
    });
  });

  describe('Performance Data Synchronization', () => {
    it('should synchronize performance summary with latest match data', async () => {
      // Mock performance summary data
      const mockSummary = {
        ...mockPlayerData,
        recentScores: [85, 78, 72, 69, 75],
        trend: 'improving',
        performanceHistory: [
          { date: { seconds: Date.now() / 1000 }, score: 85, sport: 'cricket' }
        ]
      };

      mockFirestoreOperations.query.mockResolvedValueOnce([
        { id: 'match-1', calculatedScore: 85, date: { seconds: Date.now() / 1000 } },
        { id: 'match-2', calculatedScore: 78, date: { seconds: (Date.now() - 86400000) / 1000 } }
      ]);

      const summary = await matchService.getPlayerPerformanceSummary(mockPlayerId);

      expect(summary).toMatchObject({
        currentScore: expect.any(Number),
        averageScore: expect.any(Number),
        matchCount: expect.any(Number),
        trend: expect.any(String),
        recentScores: expect.any(Array)
      });
    });

    it('should calculate correct performance trends', async () => {
      // Mock matches with improving trend
      const improvingMatches = [
        { calculatedScore: 85 }, // most recent
        { calculatedScore: 80 },
        { calculatedScore: 75 },
        { calculatedScore: 65 }, // older
        { calculatedScore: 60 },
        { calculatedScore: 55 }
      ];

      mockFirestoreOperations.query.mockResolvedValueOnce(improvingMatches);

      const summary = await matchService.getPlayerPerformanceSummary(mockPlayerId);

      expect(summary.trend).toBe('improving');
    });

    it('should handle empty match history gracefully', async () => {
      mockFirestoreOperations.query.mockResolvedValueOnce([]);

      const summary = await matchService.getPlayerPerformanceSummary(mockPlayerId);

      expect(summary).toMatchObject({
        ...mockPlayerData,
        recentScores: [],
        trend: 'stable',
        performanceHistory: []
      });
    });
  });

  describe('Coach Dashboard Integration', () => {
    it('should provide team overview with aggregated player data', async () => {
      const mockPlayers = [
        { ...mockPlayerData, id: 'player-1', averageScore: 75 },
        { ...mockPlayerData, id: 'player-2', averageScore: 80 },
        { ...mockPlayerData, id: 'player-3', averageScore: 70 }
      ];

      const mockMatches = [
        { playerId: 'player-1', calculatedScore: 78, date: { seconds: Date.now() / 1000 } },
        { playerId: 'player-2', calculatedScore: 82, date: { seconds: Date.now() / 1000 } }
      ];

      mockFirestoreOperations.getPlayersByCoach.mockResolvedValueOnce(mockPlayers);
      mockFirestoreOperations.query.mockResolvedValueOnce(mockMatches);

      const teamOverview = await matchService.getTeamPerformanceOverview(mockCoachId);

      expect(teamOverview).toMatchObject({
        totalPlayers: 3,
        totalMatches: 2,
        averageTeamScore: expect.any(Number),
        topPerformer: expect.objectContaining({
          averageScore: 80
        }),
        recentActivity: expect.any(Array)
      });
    });
  });

  describe('Real-time Data Flow', () => {
    it('should establish real-time listeners correctly', () => {
      const mockUnsubscribe = vi.fn();
      mockFirestoreOperations.onQueryChange.mockReturnValue(mockUnsubscribe);

      const { result, unmount } = renderHook(() => usePerformance(mockPlayerId));

      // Verify listener was set up
      expect(mockFirestoreOperations.onQueryChange).toHaveBeenCalledWith(
        'matches',
        [{ field: 'playerId', operator: '==', value: mockPlayerId }],
        expect.any(Function),
        'date',
        'desc'
      );

      // Verify cleanup on unmount
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle real-time updates without data loss', async () => {
      let realtimeCallback;
      mockFirestoreOperations.onQueryChange.mockImplementation((collection, filters, callback) => {
        realtimeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => usePerformance(mockPlayerId));

      // Initial data
      const initialMatches = [
        { id: 'match-1', calculatedScore: 75, date: { seconds: Date.now() / 1000 } }
      ];

      act(() => {
        realtimeCallback(initialMatches);
      });

      expect(result.current.recentMatches).toHaveLength(1);

      // Add new match via real-time update
      const updatedMatches = [
        { id: 'match-2', calculatedScore: 80, date: { seconds: Date.now() / 1000 } },
        ...initialMatches
      ];

      act(() => {
        realtimeCallback(updatedMatches);
      });

      expect(result.current.recentMatches).toHaveLength(2);
      expect(result.current.recentMatches[0].calculatedScore).toBe(80);
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should validate match data before processing', async () => {
      const invalidMatchData = {
        ...mockMatchData,
        parameters: {
          runsScored: -10, // Invalid negative value
          ballsFaced: 0
        }
      };

      await expect(matchService.submitMatchData(invalidMatchData)).rejects.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      mockFirestoreOperations.create.mockRejectedValueOnce(
        Object.assign(new Error('Network error'), { code: 'unavailable' })
      );

      await expect(matchService.submitMatchData(mockMatchData)).rejects.toThrow('Network error');
    });

    it('should maintain data integrity on partial failures', async () => {
      // Mock successful match creation but failed stats update
      mockFirestoreOperations.create.mockResolvedValueOnce('match-id');
      mockFirestoreOperations.updatePlayerStats.mockRejectedValueOnce(new Error('Stats update failed'));

      await expect(matchService.submitMatchData(mockMatchData)).rejects.toThrow('Stats update failed');

      // Verify match was still created
      expect(mockFirestoreOperations.create).toHaveBeenCalled();
    });
  });
});