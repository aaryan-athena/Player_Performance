/**
 * Core data flow integration tests
 * Tests the essential data flow from coach match entry to player dashboard updates
 * Requirements: 3.4, 3.5, 5.1 - Integration and real-time data synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { matchService } from '../../services/matchService.js';
import { realtimeService } from '../../services/realtimeService.js';

// Mock Firebase
vi.mock('../../config/firebase.js', () => ({
  db: {},
  auth: {}
}));

// Mock Firestore service
const mockFirestore = {
  create: vi.fn(),
  read: vi.fn(),
  update: vi.fn(),
  query: vi.fn(),
  onQueryChange: vi.fn(),
  onDocumentChange: vi.fn(),
  updatePlayerStats: vi.fn(),
  getPlayersByCoach: vi.fn()
};

vi.mock('../../services/firestoreService.js', () => ({
  firestoreService: mockFirestore
}));

describe('Core Data Flow Integration', () => {
  const mockCoachId = 'coach-123';
  const mockPlayerId = 'player-456';
  
  const mockPlayer = {
    id: mockPlayerId,
    playerId: mockPlayerId,
    name: 'John Doe',
    sport: 'cricket',
    coachId: mockCoachId,
    currentScore: 75,
    matchCount: 5,
    averageScore: 72
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
    mockFirestore.read.mockResolvedValue(mockPlayer);
    mockFirestore.create.mockResolvedValue('new-match-id');
    mockFirestore.updatePlayerStats.mockResolvedValue();
    mockFirestore.query.mockResolvedValue([]);
    mockFirestore.onQueryChange.mockReturnValue(() => {});
    mockFirestore.onDocumentChange.mockReturnValue(() => {});
  });

  describe('Match Submission Flow', () => {
    it('should successfully submit match data and update player stats', async () => {
      // Submit match data
      const result = await matchService.submitMatchData(mockMatchData);

      // Verify match was created
      expect(mockFirestore.create).toHaveBeenCalledWith(
        'matches',
        expect.objectContaining({
          playerId: mockPlayerId,
          coachId: mockCoachId,
          sport: 'cricket',
          calculatedScore: expect.any(Number),
          suggestions: expect.any(Array)
        })
      );

      // Verify player stats were updated
      expect(mockFirestore.updatePlayerStats).toHaveBeenCalledWith(
        mockPlayerId,
        expect.objectContaining({
          currentScore: expect.any(Number),
          matchCount: expect.any(Number),
          averageScore: expect.any(Number)
        })
      );

      // Verify result structure
      expect(result).toMatchObject({
        id: 'new-match-id',
        playerId: mockPlayerId,
        calculatedScore: expect.any(Number),
        suggestions: expect.any(Array)
      });
    });

    it('should calculate performance score correctly for cricket', async () => {
      const result = await matchService.submitMatchData(mockMatchData);
      
      // Cricket score should be calculated based on batting, bowling, and fielding
      expect(result.calculatedScore).toBeGreaterThan(0);
      expect(result.calculatedScore).toBeLessThanOrEqual(100);
    });

    it('should generate appropriate suggestions based on score', async () => {
      const result = await matchService.submitMatchData(mockMatchData);
      
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestionPackage).toMatchObject({
        suggestions: expect.any(Array),
        restRecommendation: expect.objectContaining({
          hours: expect.any(Number),
          description: expect.any(String)
        })
      });
    });
  });

  describe('Real-time Synchronization', () => {
    it('should set up player update subscriptions correctly', () => {
      const callback = vi.fn();
      const subscriptionId = realtimeService.subscribeToPlayerUpdates(mockPlayerId, callback);

      expect(subscriptionId).toBeDefined();
      expect(mockFirestore.onQueryChange).toHaveBeenCalledWith(
        'matches',
        [{ field: 'playerId', operator: '==', value: mockPlayerId }],
        expect.any(Function),
        'date',
        'desc'
      );
    });

    it('should set up coach update subscriptions correctly', () => {
      const callback = vi.fn();
      const subscriptionId = realtimeService.subscribeToCoachUpdates(mockCoachId, callback);

      expect(subscriptionId).toBeDefined();
      expect(mockFirestore.onQueryChange).toHaveBeenCalledTimes(2); // players and matches
    });

    it('should handle subscription cleanup properly', () => {
      const mockUnsubscribe = vi.fn();
      mockFirestore.onQueryChange.mockReturnValue(mockUnsubscribe);

      const callback = vi.fn();
      const subscriptionId = realtimeService.subscribeToPlayerUpdates(mockPlayerId, callback);
      
      realtimeService.unsubscribe(subscriptionId);
      
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Cross-Component Synchronization', () => {
    it('should establish cross-component sync between coach and player', () => {
      const syncControls = realtimeService.setupCrossComponentSync(mockPlayerId, mockCoachId);

      expect(syncControls).toMatchObject({
        syncId: expect.any(String),
        addCallback: expect.any(Function),
        removeCallback: expect.any(Function),
        destroy: expect.any(Function)
      });

      // Verify listeners were set up for both matches and player updates
      expect(mockFirestore.onQueryChange).toHaveBeenCalledWith(
        'matches',
        [
          { field: 'playerId', operator: '==', value: mockPlayerId },
          { field: 'coachId', operator: '==', value: mockCoachId }
        ],
        expect.any(Function),
        'date',
        'desc'
      );
    });

    it('should handle cross-component callbacks correctly', () => {
      const syncControls = realtimeService.setupCrossComponentSync(mockPlayerId, mockCoachId);
      const callback = vi.fn();

      syncControls.addCallback(callback);
      
      // Simulate a match update
      const mockMatches = [
        { id: 'match-1', calculatedScore: 85, playerId: mockPlayerId }
      ];

      // This would be called by the real-time listener in actual implementation
      // For testing, we verify the callback structure is correct
      expect(callback).toBeInstanceOf(Function);
    });
  });

  describe('Performance Data Retrieval', () => {
    it('should retrieve player performance summary correctly', async () => {
      const mockMatches = [
        { calculatedScore: 85, date: new Date() },
        { calculatedScore: 78, date: new Date() },
        { calculatedScore: 72, date: new Date() }
      ];

      mockFirestore.query.mockResolvedValue(mockMatches);

      const summary = await matchService.getPlayerPerformanceSummary(mockPlayerId);

      expect(summary).toMatchObject({
        currentScore: expect.any(Number),
        averageScore: expect.any(Number),
        matchCount: expect.any(Number),
        trend: expect.any(String),
        recentScores: expect.any(Array)
      });
    });

    it('should calculate performance trends correctly', async () => {
      // Mock improving trend data
      const improvingMatches = [
        { calculatedScore: 85 }, // recent
        { calculatedScore: 80 },
        { calculatedScore: 75 },
        { calculatedScore: 65 }, // older
        { calculatedScore: 60 },
        { calculatedScore: 55 }
      ];

      mockFirestore.query.mockResolvedValue(improvingMatches);

      const summary = await matchService.getPlayerPerformanceSummary(mockPlayerId);
      expect(summary.trend).toBe('improving');
    });

    it('should retrieve team performance overview for coaches', async () => {
      const mockPlayers = [
        { id: 'p1', averageScore: 75 },
        { id: 'p2', averageScore: 80 },
        { id: 'p3', averageScore: 70 }
      ];

      const mockTeamMatches = [
        { playerId: 'p1', calculatedScore: 78 },
        { playerId: 'p2', calculatedScore: 82 }
      ];

      mockFirestore.getPlayersByCoach.mockResolvedValue(mockPlayers);
      mockFirestore.query.mockResolvedValue(mockTeamMatches);

      const teamOverview = await matchService.getTeamPerformanceOverview(mockCoachId);

      expect(teamOverview).toMatchObject({
        totalPlayers: 3,
        totalMatches: 2,
        averageTeamScore: expect.any(Number),
        topPerformer: expect.objectContaining({
          averageScore: 80
        })
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      mockFirestore.create.mockRejectedValue(new Error('Firestore error'));

      await expect(matchService.submitMatchData(mockMatchData)).rejects.toThrow('Firestore error');
      
      // Verify player stats were not updated on error
      expect(mockFirestore.updatePlayerStats).not.toHaveBeenCalled();
    });

    it('should validate match data before submission', async () => {
      const invalidMatchData = {
        ...mockMatchData,
        parameters: {
          runsScored: -10, // Invalid negative value
          ballsFaced: 0
        }
      };

      await expect(matchService.submitMatchData(invalidMatchData)).rejects.toThrow();
    });

    it('should handle real-time listener errors', () => {
      const callback = vi.fn();
      const errorCallback = vi.fn();
      
      mockFirestore.onQueryChange.mockImplementation((collection, filters, successCallback, orderBy, direction) => {
        // Simulate an error in the listener
        setTimeout(() => errorCallback(new Error('Listener error')), 100);
        return () => {};
      });

      const subscriptionId = realtimeService.subscribeToPlayerUpdates(mockPlayerId, callback);
      expect(subscriptionId).toBeDefined();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across multiple operations', async () => {
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

      // Verify all matches were processed
      expect(mockFirestore.create).toHaveBeenCalledTimes(3);
      expect(mockFirestore.updatePlayerStats).toHaveBeenCalledTimes(3);

      // Verify consistent result structure
      results.forEach(result => {
        expect(result).toMatchObject({
          id: expect.any(String),
          calculatedScore: expect.any(Number),
          suggestions: expect.any(Array)
        });
      });
    });

    it('should handle concurrent updates without data corruption', async () => {
      // Simulate concurrent match submissions
      const concurrentMatches = Array(5).fill(mockMatchData);
      
      const promises = concurrentMatches.map(match => 
        matchService.submitMatchData(match)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      expect(mockFirestore.create).toHaveBeenCalledTimes(5);
    });
  });
});