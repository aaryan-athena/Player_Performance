/**
 * Tests for performance calculation engine
 * Requirements: 3.1, 3.2, 3.3 - Performance score calculation testing
 */

import {
  calculateCricketScore,
  calculateFootballScore,
  calculateBasketballScore,
  calculatePerformanceScore,
  getPerformanceCategory,
  calculatePerformanceChange
} from '../performanceCalculator.js';

describe('Performance Calculator', () => {
  describe('Cricket Score Calculation', () => {
    test('should calculate cricket score with all parameters', () => {
      const params = {
        runsScored: 50,
        ballsFaced: 40,
        wicketsTaken: 2,
        catches: 1,
        oversBowled: 10
      };
      
      const score = calculateCricketScore(params);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should handle high strike rate batting performance', () => {
      const params = {
        runsScored: 100,
        ballsFaced: 60, // Strike rate of 166.67
        wicketsTaken: 0,
        catches: 0,
        oversBowled: 0
      };
      
      const score = calculateCricketScore(params);
      expect(score).toBeGreaterThan(80); // Should be high due to excellent batting
    });

    test('should handle excellent bowling performance', () => {
      const params = {
        runsScored: 0,
        ballsFaced: 0,
        wicketsTaken: 5,
        catches: 0,
        oversBowled: 10
      };
      
      const score = calculateCricketScore(params);
      expect(score).toBeGreaterThan(10); // Should get points for bowling
    });

    test('should handle fielding performance', () => {
      const params = {
        runsScored: 0,
        ballsFaced: 0,
        wicketsTaken: 0,
        catches: 3,
        oversBowled: 0
      };
      
      const score = calculateCricketScore(params);
      expect(score).toBeGreaterThan(0); // Should get points for catches
    });

    test('should throw error for invalid parameters', () => {
      expect(() => calculateCricketScore(null)).toThrow();
      expect(() => calculateCricketScore('invalid')).toThrow();
    });
  });

  describe('Football Score Calculation', () => {
    test('should calculate football score with all parameters', () => {
      const params = {
        goalsScored: 2,
        assists: 1,
        passesCompleted: 45,
        tacklesMade: 5,
        minutesPlayed: 90
      };
      
      const score = calculateFootballScore(params);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should handle high goal scoring performance', () => {
      const params = {
        goalsScored: 3,
        assists: 0,
        passesCompleted: 20,
        tacklesMade: 0,
        minutesPlayed: 90
      };
      
      const score = calculateFootballScore(params);
      expect(score).toBeGreaterThan(50); // Should be high due to goals
    });

    test('should handle playmaker performance', () => {
      const params = {
        goalsScored: 0,
        assists: 3,
        passesCompleted: 80,
        tacklesMade: 2,
        minutesPlayed: 90
      };
      
      const score = calculateFootballScore(params);
      expect(score).toBeGreaterThan(30); // Should get points for assists and passing
    });

    test('should handle defensive performance', () => {
      const params = {
        goalsScored: 0,
        assists: 0,
        passesCompleted: 40,
        tacklesMade: 8,
        minutesPlayed: 90
      };
      
      const score = calculateFootballScore(params);
      expect(score).toBeGreaterThan(0); // Should get points for tackles
    });

    test('should handle short playing time', () => {
      const params = {
        goalsScored: 1,
        assists: 0,
        passesCompleted: 10,
        tacklesMade: 1,
        minutesPlayed: 30
      };
      
      const score = calculateFootballScore(params);
      expect(score).toBeGreaterThan(0);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => calculateFootballScore(null)).toThrow();
      expect(() => calculateFootballScore('invalid')).toThrow();
    });
  });

  describe('Basketball Score Calculation', () => {
    test('should calculate basketball score with all parameters', () => {
      const params = {
        pointsScored: 20,
        rebounds: 8,
        assists: 5,
        steals: 2,
        minutesPlayed: 32
      };
      
      const score = calculateBasketballScore(params);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should handle high scoring performance', () => {
      const params = {
        pointsScored: 35,
        rebounds: 2,
        assists: 1,
        steals: 0,
        minutesPlayed: 36
      };
      
      const score = calculateBasketballScore(params);
      expect(score).toBeGreaterThan(30); // Should be high due to scoring
    });

    test('should handle rebounding specialist', () => {
      const params = {
        pointsScored: 8,
        rebounds: 15,
        assists: 2,
        steals: 1,
        minutesPlayed: 32
      };
      
      const score = calculateBasketballScore(params);
      expect(score).toBeGreaterThan(20); // Should get points for rebounds
    });

    test('should handle playmaker performance', () => {
      const params = {
        pointsScored: 12,
        rebounds: 4,
        assists: 10,
        steals: 3,
        minutesPlayed: 36
      };
      
      const score = calculateBasketballScore(params);
      expect(score).toBeGreaterThan(25); // Should get points for assists and steals
    });

    test('should handle limited playing time', () => {
      const params = {
        pointsScored: 10,
        rebounds: 3,
        assists: 2,
        steals: 1,
        minutesPlayed: 15
      };
      
      const score = calculateBasketballScore(params);
      expect(score).toBeGreaterThan(0);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => calculateBasketballScore(null)).toThrow();
      expect(() => calculateBasketballScore('invalid')).toThrow();
    });
  });

  describe('Generic Performance Score Calculation', () => {
    test('should calculate score for cricket', () => {
      const params = {
        runsScored: 30,
        ballsFaced: 25,
        wicketsTaken: 1,
        catches: 1,
        oversBowled: 5
      };
      
      const score = calculatePerformanceScore('cricket', params);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should calculate score for football', () => {
      const params = {
        goalsScored: 1,
        assists: 1,
        passesCompleted: 30,
        tacklesMade: 3,
        minutesPlayed: 90
      };
      
      const score = calculatePerformanceScore('football', params);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should calculate score for basketball', () => {
      const params = {
        pointsScored: 15,
        rebounds: 5,
        assists: 3,
        steals: 1,
        minutesPlayed: 24
      };
      
      const score = calculatePerformanceScore('basketball', params);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should handle case insensitive sport names', () => {
      const params = {
        runsScored: 20,
        ballsFaced: 15,
        wicketsTaken: 0,
        catches: 0,
        oversBowled: 0
      };
      
      const score1 = calculatePerformanceScore('CRICKET', params);
      const score2 = calculatePerformanceScore('Cricket', params);
      const score3 = calculatePerformanceScore('cricket', params);
      
      expect(score1).toBe(score2);
      expect(score2).toBe(score3);
    });

    test('should throw error for unsupported sport', () => {
      const params = { test: 1 };
      expect(() => calculatePerformanceScore('tennis', params)).toThrow();
    });

    test('should throw error for missing parameters', () => {
      expect(() => calculatePerformanceScore('cricket', null)).toThrow();
      expect(() => calculatePerformanceScore(null, {})).toThrow();
    });
  });

  describe('Performance Category', () => {
    test('should categorize excellent performance', () => {
      const category = getPerformanceCategory(95);
      expect(category.category).toBe('excellent');
      expect(category.color).toBe('green');
    });

    test('should categorize very good performance', () => {
      const category = getPerformanceCategory(85);
      expect(category.category).toBe('very-good');
      expect(category.color).toBe('blue');
    });

    test('should categorize good performance', () => {
      const category = getPerformanceCategory(75);
      expect(category.category).toBe('good');
      expect(category.color).toBe('yellow');
    });

    test('should categorize average performance', () => {
      const category = getPerformanceCategory(65);
      expect(category.category).toBe('average');
      expect(category.color).toBe('orange');
    });

    test('should categorize below average performance', () => {
      const category = getPerformanceCategory(45);
      expect(category.category).toBe('below-average');
      expect(category.color).toBe('red');
    });
  });

  describe('Performance Change Calculation', () => {
    test('should calculate improvement', () => {
      const change = calculatePerformanceChange(80, 70);
      expect(change.change).toBe(10);
      expect(change.percentage).toBeGreaterThan(0);
      expect(change.trend).toBe('improving');
    });

    test('should calculate decline', () => {
      const change = calculatePerformanceChange(60, 75);
      expect(change.change).toBe(-15);
      expect(change.percentage).toBeLessThan(0);
      expect(change.trend).toBe('declining');
    });

    test('should calculate stable performance', () => {
      const change = calculatePerformanceChange(75, 74);
      expect(change.change).toBe(1);
      expect(change.trend).toBe('stable');
    });

    test('should handle no previous score', () => {
      const change = calculatePerformanceChange(80, 0);
      expect(change.change).toBe(0);
      expect(change.percentage).toBe(0);
      expect(change.trend).toBe('stable');
    });

    test('should handle null previous score', () => {
      const change = calculatePerformanceChange(80, null);
      expect(change.change).toBe(0);
      expect(change.percentage).toBe(0);
      expect(change.trend).toBe('stable');
    });
  });
});