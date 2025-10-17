/**
 * Tests for suggestion engine
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5 - Intelligent suggestion system testing
 */

import {
  generateRestRecommendation,
  generateTrainingSuggestions,
  generateTrendBasedSuggestions,
  generateComprehensiveSuggestions,
  getMotivationalMessage
} from '../suggestionEngine.js';

describe('Suggestion Engine', () => {
  describe('Rest Recommendation Generation', () => {
    test('should recommend extended rest for low performance', () => {
      const restRec = generateRestRecommendation(45);
      
      expect(restRec.hours).toBeGreaterThanOrEqual(48);
      expect(restRec.hours).toBeLessThanOrEqual(72);
      expect(restRec.description).toContain('complete rest');
      expect(restRec.createdAt).toBeInstanceOf(Date);
    });

    test('should recommend moderate rest for average performance', () => {
      const restRec = generateRestRecommendation(70);
      
      expect(restRec.hours).toBeGreaterThanOrEqual(24);
      expect(restRec.hours).toBeLessThanOrEqual(48);
      expect(restRec.description).toContain('moderate rest');
    });

    test('should recommend light rest for high performance', () => {
      const restRec = generateRestRecommendation(85);
      
      expect(restRec.hours).toBeGreaterThanOrEqual(12);
      expect(restRec.hours).toBeLessThanOrEqual(24);
      expect(restRec.description).toContain('light rest');
    });

    test('should handle edge cases', () => {
      const restRec60 = generateRestRecommendation(60);
      const restRec80 = generateRestRecommendation(80);
      
      expect(restRec60.hours).toBeGreaterThanOrEqual(24);
      expect(restRec80.hours).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Training Suggestions Generation', () => {
    describe('Cricket Suggestions', () => {
      test('should generate suggestions for poor batting performance', () => {
        const params = {
          runsScored: 10,
          ballsFaced: 20, // Low strike rate
          wicketsTaken: 0,
          catches: 0,
          oversBowled: 0
        };
        
        const suggestions = generateTrainingSuggestions(50, 'cricket', params);
        
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.some(s => s.message.includes('batting technique'))).toBe(true);
      });

      test('should generate suggestions for poor bowling performance', () => {
        const params = {
          runsScored: 0,
          ballsFaced: 0,
          wicketsTaken: 0,
          catches: 0,
          oversBowled: 10 // No wickets in 10 overs
        };
        
        const suggestions = generateTrainingSuggestions(40, 'cricket', params);
        
        expect(suggestions.some(s => s.message.includes('bowling accuracy'))).toBe(true);
      });

      test('should generate positive suggestions for good performance', () => {
        const params = {
          runsScored: 80,
          ballsFaced: 50, // Good strike rate
          wicketsTaken: 3,
          catches: 2,
          oversBowled: 8
        };
        
        const suggestions = generateTrainingSuggestions(90, 'cricket', params);
        
        expect(suggestions.some(s => s.message.includes('Outstanding'))).toBe(true);
      });
    });

    describe('Football Suggestions', () => {
      test('should generate suggestions for poor attacking performance', () => {
        const params = {
          goalsScored: 0,
          assists: 0,
          passesCompleted: 20,
          tacklesMade: 2,
          minutesPlayed: 90
        };
        
        const suggestions = generateTrainingSuggestions(45, 'football', params);
        
        expect(suggestions.some(s => s.message.includes('finishing skills') || s.message.includes('creating chances'))).toBe(true);
      });

      test('should generate suggestions for poor passing', () => {
        const params = {
          goalsScored: 1,
          assists: 0,
          passesCompleted: 15, // Low passes per minute
          tacklesMade: 1,
          minutesPlayed: 90
        };
        
        const suggestions = generateTrainingSuggestions(55, 'football', params);
        
        expect(suggestions.some(s => s.message.includes('passing accuracy'))).toBe(true);
      });

      test('should generate positive suggestions for good performance', () => {
        const params = {
          goalsScored: 2,
          assists: 2,
          passesCompleted: 80,
          tacklesMade: 6,
          minutesPlayed: 90
        };
        
        const suggestions = generateTrainingSuggestions(88, 'football', params);
        
        expect(suggestions.some(s => s.priority === 'low')).toBe(true);
      });
    });

    describe('Basketball Suggestions', () => {
      test('should generate suggestions for poor scoring', () => {
        const params = {
          pointsScored: 5,
          rebounds: 2,
          assists: 1,
          steals: 0,
          minutesPlayed: 30
        };
        
        const suggestions = generateTrainingSuggestions(40, 'basketball', params);
        
        expect(suggestions.some(s => s.message.includes('shooting technique'))).toBe(true);
      });

      test('should generate suggestions for poor rebounding', () => {
        const params = {
          pointsScored: 15,
          rebounds: 1, // Low rebounds
          assists: 3,
          steals: 1,
          minutesPlayed: 32
        };
        
        const suggestions = generateTrainingSuggestions(60, 'basketball', params);
        
        expect(suggestions.some(s => s.message.includes('rebounding'))).toBe(true);
      });

      test('should generate positive suggestions for excellent performance', () => {
        const params = {
          pointsScored: 25,
          rebounds: 10,
          assists: 8,
          steals: 3,
          minutesPlayed: 36
        };
        
        const suggestions = generateTrainingSuggestions(92, 'basketball', params);
        
        expect(suggestions.some(s => s.message.includes('Excellent') || s.message.includes('Great'))).toBe(true);
      });
    });

    test('should handle unsupported sport gracefully', () => {
      const params = { test: 1 };
      const suggestions = generateTrainingSuggestions(70, 'tennis', params);
      
      // Should still generate general suggestions
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'general')).toBe(true);
    });
  });

  describe('Trend-Based Suggestions', () => {
    test('should generate improvement suggestions for positive trend', () => {
      const recentScores = [60, 65, 70, 75, 80, 85];
      const suggestions = generateTrendBasedSuggestions(recentScores, 'cricket');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.message.includes('improvement'))).toBe(true);
    });

    test('should generate decline suggestions for negative trend', () => {
      const recentScores = [85, 80, 75, 70, 65, 55];
      const suggestions = generateTrendBasedSuggestions(recentScores, 'football');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.message.includes('declined'))).toBe(true);
      expect(suggestions.some(s => s.priority === 'high')).toBe(true);
    });

    test('should generate stability suggestions for stable trend', () => {
      const recentScores = [75, 76, 74, 75, 76, 74];
      const suggestions = generateTrendBasedSuggestions(recentScores, 'basketball');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.message.includes('Consistent'))).toBe(true);
    });

    test('should handle insufficient data', () => {
      const recentScores = [75];
      const suggestions = generateTrendBasedSuggestions(recentScores, 'cricket');
      
      expect(suggestions.length).toBe(0);
    });

    test('should handle empty or null scores', () => {
      const suggestions1 = generateTrendBasedSuggestions([], 'cricket');
      const suggestions2 = generateTrendBasedSuggestions(null, 'cricket');
      
      expect(suggestions1.length).toBe(0);
      expect(suggestions2.length).toBe(0);
    });
  });

  describe('Comprehensive Suggestions', () => {
    test('should generate complete suggestion package', () => {
      const params = {
        runsScored: 45,
        ballsFaced: 35,
        wicketsTaken: 1,
        catches: 1,
        oversBowled: 6
      };
      const recentScores = [70, 72, 68, 75, 73];
      
      const comprehensive = generateComprehensiveSuggestions(72, 'cricket', params, recentScores);
      
      expect(comprehensive).toHaveProperty('restRecommendation');
      expect(comprehensive).toHaveProperty('suggestions');
      expect(comprehensive).toHaveProperty('score', 72);
      expect(comprehensive).toHaveProperty('sport', 'cricket');
      expect(comprehensive).toHaveProperty('generatedAt');
      expect(comprehensive.generatedAt).toBeInstanceOf(Date);
      
      expect(comprehensive.restRecommendation).toHaveProperty('hours');
      expect(comprehensive.suggestions).toBeInstanceOf(Array);
      expect(comprehensive.suggestions.length).toBeGreaterThan(0);
    });

    test('should work without recent scores', () => {
      const params = {
        goalsScored: 1,
        assists: 1,
        passesCompleted: 40,
        tacklesMade: 3,
        minutesPlayed: 90
      };
      
      const comprehensive = generateComprehensiveSuggestions(65, 'football', params);
      
      expect(comprehensive.suggestions.length).toBeGreaterThan(0);
      expect(comprehensive.restRecommendation).toBeDefined();
    });
  });

  describe('Motivational Messages', () => {
    test('should return appropriate message for excellent performance', () => {
      const message = getMotivationalMessage(95);
      expect(message).toContain('Outstanding');
    });

    test('should return appropriate message for very good performance', () => {
      const message = getMotivationalMessage(85);
      expect(message).toContain('Great job');
    });

    test('should return appropriate message for good performance', () => {
      const message = getMotivationalMessage(75);
      expect(message).toContain('Good work');
    });

    test('should return appropriate message for average performance', () => {
      const message = getMotivationalMessage(65);
      expect(message).toContain('Solid effort');
    });

    test('should return appropriate message for poor performance', () => {
      const message = getMotivationalMessage(45);
      expect(message).toContain('champion');
    });

    test('should handle edge cases', () => {
      const message90 = getMotivationalMessage(90);
      const message80 = getMotivationalMessage(80);
      const message70 = getMotivationalMessage(70);
      const message60 = getMotivationalMessage(60);
      
      expect(message90).toContain('Outstanding');
      expect(message80).toContain('Great job');
      expect(message70).toContain('Good work');
      expect(message60).toContain('Solid effort');
    });
  });
});