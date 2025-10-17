/**
 * Tests for match service integration
 * Requirements: 3.4, 3.5, 4.6 - Integration testing for calculation with data storage
 */

import { matchService } from '../matchService.js';
import { firestoreService } from '../firestoreService.js';
import { calculatePerformanceScore } from '../performanceCalculator.js';
import { generateComprehensiveSuggestions } from '../suggestionEngine.js';

// Mock the dependencies
jest.mock('../firestoreService.js');
jest.mock('../performanceCalculator.js');
jest.mock('../suggestionEngine.js');

describe('Match Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Submit Match Data', () => {
    test('should submit match data with calculated score and suggestions', async () => {
      // Mock data
      const matchData = {
        playerId: 'player123',
        coachId: 'coach456',
        sport: 'cricket',
        parameters: {
          runsScored: 50,
          ballsFaced: 40,
          wicketsTaken: 2,
          catches: 1,
          oversBowled: 5
        },
        date: new Date('2024-01-01')
      };

      const mockScore = 75;
      const mockSuggestions = {
        restRecommendation: { hours: 24, description: 'Take moderate rest' },
        suggestions: [
          { message: 'Good performance!', type: 'general', priority: 'medium' }
        ]
      };

      // Setup mocks
      calculatePerformanceScore.mockReturnValue(mockScore);
      generateComprehensiveSuggestions.mockReturnValue(mockSuggestions);
      firestoreService.query.mockResolvedValue([]); // No recent matches
      firestoreService.create.mockResolvedValue('match123');
      firestoreService.read.mockResolvedValue({
        playerId: 'player123',
        matchCount: 5,
        totalScore: 300,
        averageScore: 60
      });
      firestoreService.updatePlayerStats.mockResolvedValue();

      const result = await matchService.submitMatchData(matchData);

      // Verify performance calculation was called
      expect(calculatePerformanceScore).toHaveBeenCalledWith('cricket', matchData.parameters);

      // Verify suggestions were generated
      expect(generateComprehensiveSuggestions).toHaveBeenCalledWith(
        mockScore,
        'cricket',
        matchData.parameters,
        []
      );

      // Verify match was saved
      expect(firestoreService.create).toHaveBeenCalledWith('matches', expect.objectContaining({
        playerId: 'player123',
        coachId: 'coach456',
        sport: 'cricket',
        calculatedScore: mockScore,
        suggestions: ['Good performance!']
      }));

      // Verify player stats were updated
      expect(firestoreService.updatePlayerStats).toHaveBeenCalled();

      // Verify result structure
      expect(result).toHaveProperty('id', 'match123');
      expect(result).toHaveProperty('calculatedScore', mockScore);
      expect(result).toHaveProperty('suggestionPackage', mockSuggestions);
    });

    test('should handle validation errors', async () => {
      const invalidMatchData = {
        playerId: '', // Invalid: empty
        coachId: 'coach456',
        sport: 'invalid_sport',
        parameters: {},
        date: new Date('2025-01-01') // Future date
      };

      await expect(matchService.submitMatchData(invalidMatchData))
        .rejects.toThrow('Invalid match data');
    });

    test('should include recent scores in trend analysis', async () => {
      const matchData = {
        playerId: 'player123',
        coachId: 'coach456',
        sport: 'football',
        parameters: {
          goalsScored: 2,
          assists: 1,
          passesCompleted: 50,
          tacklesMade: 5,
          minutesPlayed: 90
        }
      };

      const recentMatches = [
        { calculatedScore: 70 },
        { calculatedScore: 75 },
        { calculatedScore: 68 }
      ];

      calculatePerformanceScore.mockReturnValue(80);
      generateComprehensiveSuggestions.mockReturnValue({
        restRecommendation: { hours: 12, description: 'Light rest' },
        suggestions: []
      });
      firestoreService.query.mockResolvedValue(recentMatches);
      firestoreService.create.mockResolvedValue('match456');
      firestoreService.read.mockResolvedValue({ matchCount: 0, totalScore: 0 });
      firestoreService.updatePlayerStats.mockResolvedValue();

      await matchService.submitMatchData(matchData);

      expect(generateComprehensiveSuggestions).toHaveBeenCalledWith(
        80,
        'football',
        matchData.parameters,
        [70, 75, 68]
      );
    });
  });

  describe('Player Statistics Update', () => {
    test('should update player statistics correctly', async () => {
      const playerId = 'player123';
      const newScore = 85;

      const currentPlayer = {
        matchCount: 4,
        totalScore: 280,
        averageScore: 70
      };

      firestoreService.read.mockResolvedValue(currentPlayer);
      firestoreService.updatePlayerStats.mockResolvedValue();

      await matchService.updatePlayerStatistics(playerId, newScore);

      expect(firestoreService.updatePlayerStats).toHaveBeenCalledWith(playerId, {
        currentScore: 85,
        matchCount: 5,
        totalScore: 365,
        averageScore: 73,
        lastMatchDate: expect.any(Date)
      });
    });

    test('should handle first match for new player', async () => {
      const playerId = 'player123';
      const newScore = 75;

      const newPlayer = {
        matchCount: 0,
        totalScore: 0
      };

      firestoreService.read.mockResolvedValue(newPlayer);
      firestoreService.updatePlayerStats.mockResolvedValue();

      await matchService.updatePlayerStatistics(playerId, newScore);

      expect(firestoreService.updatePlayerStats).toHaveBeenCalledWith(playerId, {
        currentScore: 75,
        matchCount: 1,
        totalScore: 75,
        averageScore: 75,
        lastMatchDate: expect.any(Date)
      });
    });
  });

  describe('Player Performance Summary', () => {
    test('should generate comprehensive performance summary', async () => {
      const playerId = 'player123';

      const playerData = {
        playerId: 'player123',
        name: 'John Doe',
        sport: 'basketball',
        matchCount: 8,
        averageScore: 72.5,
        currentScore: 80
      };

      const recentMatches = [
        { calculatedScore: 80, date: new Date('2024-01-05'), sport: 'basketball' },
        { calculatedScore: 75, date: new Date('2024-01-03'), sport: 'basketball' },
        { calculatedScore: 78, date: new Date('2024-01-01'), sport: 'basketball' },
        { calculatedScore: 70, date: new Date('2023-12-28'), sport: 'basketball' },
        { calculatedScore: 65, date: new Date('2023-12-25'), sport: 'basketball' }
      ];

      firestoreService.read.mockResolvedValue(playerData);
      firestoreService.query.mockResolvedValue(recentMatches);

      const summary = await matchService.getPlayerPerformanceSummary(playerId);

      expect(summary).toHaveProperty('name', 'John Doe');
      expect(summary).toHaveProperty('recentScores', [80, 75, 78, 70, 65]);
      expect(summary).toHaveProperty('trend', 'improving'); // Recent avg > older avg
      expect(summary).toHaveProperty('performanceHistory');
      expect(summary.performanceHistory).toHaveLength(5);
    });

    test('should calculate declining trend correctly', async () => {
      const playerId = 'player123';

      const playerData = { playerId: 'player123', name: 'Jane Doe' };
      const recentMatches = [
        { calculatedScore: 60 }, // Recent 3: avg = 63.33
        { calculatedScore: 65 },
        { calculatedScore: 65 },
        { calculatedScore: 80 }, // Older 3: avg = 78.33
        { calculatedScore: 75 },
        { calculatedScore: 80 }
      ];

      firestoreService.read.mockResolvedValue(playerData);
      firestoreService.query.mockResolvedValue(recentMatches);

      const summary = await matchService.getPlayerPerformanceSummary(playerId);

      expect(summary.trend).toBe('declining');
    });
  });

  describe('Team Performance Overview', () => {
    test('should generate team performance overview for coach', async () => {
      const coachId = 'coach123';

      const players = [
        { playerId: 'p1', name: 'Player 1', averageScore: 75 },
        { playerId: 'p2', name: 'Player 2', averageScore: 80 },
        { playerId: 'p3', name: 'Player 3', averageScore: 70 }
      ];

      const recentMatches = [
        { playerId: 'p1', calculatedScore: 78, sport: 'cricket', date: new Date() },
        { playerId: 'p2', calculatedScore: 82, sport: 'football', date: new Date() }
      ];

      firestoreService.getPlayersByCoach.mockResolvedValue(players);
      firestoreService.query.mockResolvedValue(recentMatches);

      const overview = await matchService.getTeamPerformanceOverview(coachId);

      expect(overview).toHaveProperty('totalPlayers', 3);
      expect(overview).toHaveProperty('totalMatches', 2);
      expect(overview).toHaveProperty('averageTeamScore', 75); // (75+80+70)/3
      expect(overview).toHaveProperty('topPerformer');
      expect(overview.topPerformer.name).toBe('Player 2'); // Highest average
      expect(overview).toHaveProperty('recentActivity');
      expect(overview.recentActivity).toHaveLength(2);
    });

    test('should handle team with no players', async () => {
      const coachId = 'coach123';

      firestoreService.getPlayersByCoach.mockResolvedValue([]);
      firestoreService.query.mockResolvedValue([]);

      const overview = await matchService.getTeamPerformanceOverview(coachId);

      expect(overview.totalPlayers).toBe(0);
      expect(overview.averageTeamScore).toBe(0);
      expect(overview.topPerformer).toBeNull();
    });
  });

  describe('Match Retrieval', () => {
    test('should get player recent matches', async () => {
      const playerId = 'player123';
      const mockMatches = [
        { id: 'm1', calculatedScore: 80 },
        { id: 'm2', calculatedScore: 75 }
      ];

      firestoreService.query.mockResolvedValue(mockMatches);

      const matches = await matchService.getPlayerRecentMatches(playerId, 5);

      expect(firestoreService.query).toHaveBeenCalledWith(
        'matches',
        [{ field: 'playerId', operator: '==', value: playerId }],
        'date',
        'desc',
        5
      );
      expect(matches).toEqual(mockMatches);
    });

    test('should get player matches with sport filter', async () => {
      const playerId = 'player123';
      const sport = 'cricket';

      firestoreService.query.mockResolvedValue([]);

      await matchService.getPlayerMatches(playerId, sport);

      expect(firestoreService.query).toHaveBeenCalledWith(
        'matches',
        [
          { field: 'playerId', operator: '==', value: playerId },
          { field: 'sport', operator: '==', value: sport }
        ],
        'date',
        'desc'
      );
    });

    test('should get coach matches', async () => {
      const coachId = 'coach123';

      firestoreService.query.mockResolvedValue([]);

      await matchService.getCoachMatches(coachId, 20);

      expect(firestoreService.query).toHaveBeenCalledWith(
        'matches',
        [{ field: 'coachId', operator: '==', value: coachId }],
        'date',
        'desc',
        20
      );
    });
  });

  describe('Match Deletion and Recalculation', () => {
    test('should delete match and recalculate player stats', async () => {
      const matchId = 'match123';
      const matchData = {
        id: matchId,
        playerId: 'player123',
        calculatedScore: 75
      };

      const remainingMatches = [
        { calculatedScore: 80 },
        { calculatedScore: 70 }
      ];

      firestoreService.read.mockResolvedValue(matchData);
      firestoreService.delete.mockResolvedValue();
      firestoreService.query.mockResolvedValue(remainingMatches);
      firestoreService.updatePlayerStats.mockResolvedValue();

      await matchService.deleteMatch(matchId);

      expect(firestoreService.delete).toHaveBeenCalledWith('matches', matchId);
      expect(firestoreService.updatePlayerStats).toHaveBeenCalledWith('player123', {
        currentScore: 80, // Most recent match score
        matchCount: 2,
        totalScore: 150, // 80 + 70
        averageScore: 75, // 150 / 2
        lastMatchDate: expect.any(Date)
      });
    });

    test('should reset stats when no matches remain', async () => {
      const playerId = 'player123';

      firestoreService.query.mockResolvedValue([]); // No matches
      firestoreService.updatePlayerStats.mockResolvedValue();

      await matchService.recalculatePlayerStatistics(playerId);

      expect(firestoreService.updatePlayerStats).toHaveBeenCalledWith(playerId, {
        currentScore: 0,
        matchCount: 0,
        totalScore: 0,
        averageScore: 0,
        lastMatchDate: null
      });
    });
  });

  describe('Real-time Listeners', () => {
    test('should set up player matches listener', () => {
      const playerId = 'player123';
      const callback = jest.fn();
      const unsubscribe = jest.fn();

      firestoreService.onQueryChange.mockReturnValue(unsubscribe);

      const result = matchService.onPlayerMatchesChange(playerId, callback);

      expect(firestoreService.onQueryChange).toHaveBeenCalledWith(
        'matches',
        [{ field: 'playerId', operator: '==', value: playerId }],
        callback,
        'date',
        'desc'
      );
      expect(result).toBe(unsubscribe);
    });

    test('should set up coach matches listener', () => {
      const coachId = 'coach123';
      const callback = jest.fn();
      const unsubscribe = jest.fn();

      firestoreService.onQueryChange.mockReturnValue(unsubscribe);

      const result = matchService.onCoachMatchesChange(coachId, callback);

      expect(firestoreService.onQueryChange).toHaveBeenCalledWith(
        'matches',
        [{ field: 'coachId', operator: '==', value: coachId }],
        callback,
        'date',
        'desc'
      );
      expect(result).toBe(unsubscribe);
    });
  });
});