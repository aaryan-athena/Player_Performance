/**
 * Test file for data models and validation utilities
 * Requirements: 2.4, 2.5, 7.1 - Data model validation
 */

import {
  createMatchData,
  createRestRecommendation,
  createMatchSummary,
  createPlayerPerformanceSummary,
  createSuggestion,
  calculatePerformanceTrend,
  sortMatchesByDate,
  filterMatchesBySport,
  filterMatchesByDateRange,
  sportParameterSchemas,
  defaultSportParameters,
  sportParameterLabels
} from '../index.js';

import {
  validateSportParameters,
  validateMatchData,
  validatePlayerData,
  validateRestRecommendation,
  validateSuggestion,
  validateMatchDataBatch
} from '../../utils/validators.js';

describe('Sport Parameter Models', () => {
  test('should have schemas for all three sports', () => {
    expect(sportParameterSchemas).toHaveProperty('cricket');
    expect(sportParameterSchemas).toHaveProperty('football');
    expect(sportParameterSchemas).toHaveProperty('basketball');
  });

  test('should have default parameters for all sports', () => {
    expect(defaultSportParameters.cricket).toBeDefined();
    expect(defaultSportParameters.football).toBeDefined();
    expect(defaultSportParameters.basketball).toBeDefined();
  });

  test('should have parameter labels for all sports', () => {
    expect(sportParameterLabels.cricket).toBeDefined();
    expect(sportParameterLabels.football).toBeDefined();
    expect(sportParameterLabels.basketball).toBeDefined();
  });
});

describe('Match Data Models', () => {
  test('should create valid match data structure', () => {
    const matchData = createMatchData({
      playerId: 'player123',
      coachId: 'coach456',
      sport: 'cricket',
      parameters: {
        runsScored: 50,
        ballsFaced: 40,
        wicketsTaken: 2,
        catches: 1,
        oversBowled: 5
      }
    });

    expect(matchData).toHaveProperty('playerId', 'player123');
    expect(matchData).toHaveProperty('coachId', 'coach456');
    expect(matchData).toHaveProperty('sport', 'cricket');
    expect(matchData).toHaveProperty('parameters');
    expect(matchData).toHaveProperty('createdAt');
    expect(matchData).toHaveProperty('updatedAt');
  });

  test('should create rest recommendation', () => {
    const restRec = createRestRecommendation(24, 'Take a day off to recover');
    
    expect(restRec).toHaveProperty('hours', 24);
    expect(restRec).toHaveProperty('description', 'Take a day off to recover');
    expect(restRec).toHaveProperty('createdAt');
  });

  test('should create match summary', () => {
    const matchData = createMatchData({
      playerId: 'player123',
      coachId: 'coach456',
      sport: 'football',
      parameters: { goalsScored: 2 },
      calculatedScore: 85,
      suggestions: ['Great performance!']
    });

    const summary = createMatchSummary(matchData);
    
    expect(summary).toHaveProperty('sport', 'football');
    expect(summary).toHaveProperty('score', 85);
    expect(summary).toHaveProperty('suggestionCount', 1);
  });

  test('should create player performance summary', () => {
    const summary = createPlayerPerformanceSummary({
      playerId: 'player123',
      playerName: 'John Doe',
      sport: 'basketball',
      totalMatches: 10,
      averageScore: 75.5,
      currentScore: 80
    });

    expect(summary).toHaveProperty('playerId', 'player123');
    expect(summary).toHaveProperty('playerName', 'John Doe');
    expect(summary).toHaveProperty('averageScore', 75.5);
    expect(summary).toHaveProperty('trend', 'stable');
  });

  test('should create suggestion', () => {
    const suggestion = createSuggestion('rest', 'Take 24 hours rest', 'high');
    
    expect(suggestion).toHaveProperty('type', 'rest');
    expect(suggestion).toHaveProperty('message', 'Take 24 hours rest');
    expect(suggestion).toHaveProperty('priority', 'high');
    expect(suggestion).toHaveProperty('createdAt');
  });
});

describe('Performance Trend Calculation', () => {
  test('should calculate improving trend', () => {
    const scores = [60, 65, 70, 75, 80, 85];
    const trend = calculatePerformanceTrend(scores);
    expect(trend).toBe('improving');
  });

  test('should calculate declining trend', () => {
    const scores = [85, 80, 75, 70, 65, 60];
    const trend = calculatePerformanceTrend(scores);
    expect(trend).toBe('declining');
  });

  test('should calculate stable trend', () => {
    const scores = [75, 76, 74, 75, 76, 74];
    const trend = calculatePerformanceTrend(scores);
    expect(trend).toBe('stable');
  });

  test('should return stable for insufficient data', () => {
    const scores = [75];
    const trend = calculatePerformanceTrend(scores);
    expect(trend).toBe('stable');
  });
});

describe('Match Filtering and Sorting', () => {
  const sampleMatches = [
    { id: '1', sport: 'cricket', date: new Date('2024-01-01'), score: 80 },
    { id: '2', sport: 'football', date: new Date('2024-01-02'), score: 75 },
    { id: '3', sport: 'cricket', date: new Date('2024-01-03'), score: 85 }
  ];

  test('should sort matches by date', () => {
    const sorted = sortMatchesByDate(sampleMatches);
    expect(sorted[0].id).toBe('3'); // Most recent first
    expect(sorted[2].id).toBe('1'); // Oldest last
  });

  test('should filter matches by sport', () => {
    const cricketMatches = filterMatchesBySport(sampleMatches, 'cricket');
    expect(cricketMatches).toHaveLength(2);
    expect(cricketMatches.every(match => match.sport === 'cricket')).toBe(true);
  });

  test('should filter matches by date range', () => {
    const filtered = filterMatchesByDateRange(
      sampleMatches,
      new Date('2024-01-01'),
      new Date('2024-01-02')
    );
    expect(filtered).toHaveLength(2);
  });
});

describe('Data Validation', () => {
  test('should validate cricket parameters correctly', () => {
    const validParams = {
      runsScored: 50,
      ballsFaced: 40,
      wicketsTaken: 2,
      catches: 1,
      oversBowled: 5
    };

    const result = validateSportParameters('cricket', validParams);
    expect(result.isValid).toBe(true);
  });

  test('should reject invalid cricket parameters', () => {
    const invalidParams = {
      runsScored: -10, // Invalid: negative
      ballsFaced: 40,
      wicketsTaken: 15, // Invalid: too high
      catches: 1,
      oversBowled: 5
    };

    const result = validateSportParameters('cricket', invalidParams);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('runsScored');
    expect(result.errors).toHaveProperty('wicketsTaken');
  });

  test('should validate match data correctly', () => {
    const validMatchData = {
      playerId: 'player123',
      coachId: 'coach456',
      sport: 'football',
      parameters: {
        goalsScored: 2,
        assists: 1,
        passesCompleted: 50,
        tacklesMade: 5,
        minutesPlayed: 90
      },
      date: new Date('2024-01-01')
    };

    const result = validateMatchData(validMatchData);
    expect(result.isValid).toBe(true);
  });

  test('should reject invalid match data', () => {
    const invalidMatchData = {
      playerId: '', // Invalid: empty
      coachId: 'coach456',
      sport: 'invalid_sport', // Invalid: not supported
      parameters: {},
      date: new Date('2025-01-01') // Invalid: future date
    };

    const result = validateMatchData(invalidMatchData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('playerId');
    expect(result.errors).toHaveProperty('sport');
    expect(result.errors).toHaveProperty('date');
  });

  test('should validate player data correctly', () => {
    const validPlayerData = {
      name: 'John Doe',
      email: 'john@example.com',
      sport: 'basketball',
      coachId: 'coach123'
    };

    const result = validatePlayerData(validPlayerData);
    expect(result.isValid).toBe(true);
  });

  test('should validate rest recommendation', () => {
    const validRest = {
      hours: 24,
      description: 'Take a day off'
    };

    const result = validateRestRecommendation(validRest);
    expect(result.isValid).toBe(true);
  });

  test('should validate suggestion', () => {
    const validSuggestion = {
      type: 'training',
      message: 'Focus on passing accuracy',
      priority: 'medium'
    };

    const result = validateSuggestion(validSuggestion);
    expect(result.isValid).toBe(true);
  });

  test('should validate batch match data', () => {
    const matchDataArray = [
      {
        playerId: 'player1',
        coachId: 'coach1',
        sport: 'cricket',
        parameters: { runsScored: 50, ballsFaced: 40, wicketsTaken: 2, catches: 1, oversBowled: 5 },
        date: new Date('2024-01-01')
      },
      {
        playerId: '', // Invalid
        coachId: 'coach1',
        sport: 'football',
        parameters: { goalsScored: 2, assists: 1, passesCompleted: 50, tacklesMade: 5, minutesPlayed: 90 },
        date: new Date('2024-01-02')
      }
    ];

    const result = validateMatchDataBatch(matchDataArray);
    expect(result.isValid).toBe(false);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].isValid).toBe(true);
    expect(result.results[1].isValid).toBe(false);
  });
});