/**
 * Suggestion engine for generating personalized recommendations
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5 - Intelligent suggestion system
 */

import { createSuggestion, createRestRecommendation } from '../models/matchData.js';

/**
 * Generate rest recommendation based on performance score
 * @param {number} score - Performance score (0-100)
 * @param {string} sport - Sport type
 * @returns {Object} Rest recommendation object
 */
export const generateRestRecommendation = (score, sport = 'general') => {
  let hours, description;
  
  if (score < 60) {
    // Below 60% - Extended rest period
    hours = Math.floor(Math.random() * 24) + 48; // 48-72 hours
    description = `Your performance indicates fatigue. Take ${hours} hours of complete rest to recover properly. Focus on sleep, hydration, and light stretching.`;
  } else if (score >= 60 && score < 80) {
    // 60-80% - Moderate rest period
    hours = Math.floor(Math.random() * 24) + 24; // 24-48 hours
    description = `Good performance but room for improvement. Take ${hours} hours of moderate rest. Light activities like walking or yoga are beneficial.`;
  } else {
    // Above 80% - Light rest period
    hours = Math.floor(Math.random() * 12) + 12; // 12-24 hours
    description = `Excellent performance! Take ${hours} hours of light rest. You can engage in light training or active recovery activities.`;
  }
  
  return createRestRecommendation(hours, description);
};

/**
 * Generate training suggestions based on performance score and sport
 * @param {number} score - Performance score (0-100)
 * @param {string} sport - Sport type ('cricket', 'football', 'basketball')
 * @param {Object} parameters - Sport-specific parameters used in calculation
 * @returns {Array} Array of suggestion objects
 */
export const generateTrainingSuggestions = (score, sport, parameters) => {
  const suggestions = [];
  
  // General performance-based suggestions
  if (score >= 90) {
    suggestions.push(createSuggestion(
      'general',
      'Outstanding performance! Maintain your current training routine and focus on consistency.',
      'low'
    ));
  } else if (score >= 80) {
    suggestions.push(createSuggestion(
      'general',
      'Very good performance! Fine-tune specific skills to reach the next level.',
      'medium'
    ));
  } else if (score >= 70) {
    suggestions.push(createSuggestion(
      'general',
      'Good performance with room for improvement. Focus on consistent practice.',
      'medium'
    ));
  } else if (score >= 60) {
    suggestions.push(createSuggestion(
      'general',
      'Average performance. Identify weak areas and dedicate extra practice time.',
      'high'
    ));
  } else {
    suggestions.push(createSuggestion(
      'general',
      'Performance needs improvement. Consider working with a coach on fundamentals.',
      'high'
    ));
  }
  
  // Sport-specific suggestions
  switch (sport.toLowerCase()) {
    case 'cricket':
      suggestions.push(...generateCricketSuggestions(parameters, score));
      break;
    case 'football':
      suggestions.push(...generateFootballSuggestions(parameters, score));
      break;
    case 'basketball':
      suggestions.push(...generateBasketballSuggestions(parameters, score));
      break;
  }
  
  return suggestions;
};

/**
 * Generate cricket-specific training suggestions
 * @param {Object} parameters - Cricket parameters
 * @param {number} score - Performance score
 * @returns {Array} Array of cricket-specific suggestions
 */
const generateCricketSuggestions = (parameters, score) => {
  const suggestions = [];
  const { runsScored, ballsFaced, wicketsTaken, catches, oversBowled } = parameters;
  
  // Batting suggestions
  if (ballsFaced > 0) {
    const strikeRate = (runsScored / ballsFaced) * 100;
    if (strikeRate < 80) {
      suggestions.push(createSuggestion(
        'technique',
        'Work on batting technique and shot selection. Practice in the nets to improve strike rate.',
        'high'
      ));
    } else if (strikeRate > 150) {
      suggestions.push(createSuggestion(
        'technique',
        'Excellent strike rate! Focus on maintaining consistency and playing according to match situation.',
        'low'
      ));
    }
  }
  
  // Bowling suggestions
  if (oversBowled > 0) {
    const wicketsPerOver = wicketsTaken / oversBowled;
    if (wicketsPerOver < 0.2) {
      suggestions.push(createSuggestion(
        'technique',
        'Focus on bowling accuracy and variation. Practice different deliveries and work on line and length.',
        'high'
      ));
    } else if (wicketsPerOver > 0.5) {
      suggestions.push(createSuggestion(
        'technique',
        'Great bowling performance! Continue working on consistency and developing new variations.',
        'low'
      ));
    }
  }
  
  // Fielding suggestions
  if (catches === 0 && score < 70) {
    suggestions.push(createSuggestion(
      'technique',
      'Work on fielding skills. Practice catching drills and improve positioning.',
      'medium'
    ));
  } else if (catches >= 2) {
    suggestions.push(createSuggestion(
      'technique',
      'Excellent fielding! Your catching ability is a valuable asset to the team.',
      'low'
    ));
  }
  
  return suggestions;
};

/**
 * Generate football-specific training suggestions
 * @param {Object} parameters - Football parameters
 * @param {number} score - Performance score
 * @returns {Array} Array of football-specific suggestions
 */
const generateFootballSuggestions = (parameters, score) => {
  const suggestions = [];
  const { goalsScored, assists, passesCompleted, tacklesMade, minutesPlayed } = parameters;
  
  const safeMinutesPlayed = Math.max(minutesPlayed, 1);
  
  // Attacking suggestions
  if (goalsScored === 0 && score < 70) {
    suggestions.push(createSuggestion(
      'technique',
      'Work on finishing skills. Practice shooting from different angles and distances.',
      'high'
    ));
  } else if (goalsScored >= 2) {
    suggestions.push(createSuggestion(
      'technique',
      'Great goal-scoring performance! Continue working on movement in the box.',
      'low'
    ));
  }
  
  // Passing suggestions
  const passesPerMinute = passesCompleted / safeMinutesPlayed;
  if (passesPerMinute < 0.5) {
    suggestions.push(createSuggestion(
      'technique',
      'Improve passing accuracy and frequency. Work on short and long passing drills.',
      'medium'
    ));
  } else if (passesPerMinute > 1.0) {
    suggestions.push(createSuggestion(
      'technique',
      'Excellent passing game! Focus on creating more scoring opportunities.',
      'low'
    ));
  }
  
  // Defensive suggestions
  const tacklesPerMinute = tacklesMade / safeMinutesPlayed;
  if (tacklesPerMinute < 0.05 && score < 70) {
    suggestions.push(createSuggestion(
      'technique',
      'Work on defensive positioning and tackling technique. Practice 1v1 defending.',
      'medium'
    ));
  } else if (tacklesPerMinute > 0.1) {
    suggestions.push(createSuggestion(
      'technique',
      'Strong defensive performance! Continue working on reading the game.',
      'low'
    ));
  }
  
  // Assist suggestions
  if (assists === 0 && goalsScored === 0 && score < 60) {
    suggestions.push(createSuggestion(
      'technique',
      'Focus on creating chances for teammates. Work on vision and through balls.',
      'high'
    ));
  }
  
  return suggestions;
};

/**
 * Generate basketball-specific training suggestions
 * @param {Object} parameters - Basketball parameters
 * @param {number} score - Performance score
 * @returns {Array} Array of basketball-specific suggestions
 */
const generateBasketballSuggestions = (parameters, score) => {
  const suggestions = [];
  const { pointsScored, rebounds, assists, steals, minutesPlayed } = parameters;
  
  const safeMinutesPlayed = Math.max(minutesPlayed, 1);
  
  // Scoring suggestions
  const pointsPerMinute = pointsScored / safeMinutesPlayed;
  if (pointsPerMinute < 0.5) {
    suggestions.push(createSuggestion(
      'technique',
      'Work on shooting technique and shot selection. Practice free throws and mid-range shots.',
      'high'
    ));
  } else if (pointsPerMinute > 1.0) {
    suggestions.push(createSuggestion(
      'technique',
      'Excellent scoring efficiency! Focus on creating shots for teammates as well.',
      'low'
    ));
  }
  
  // Rebounding suggestions
  const reboundsPerMinute = rebounds / safeMinutesPlayed;
  if (reboundsPerMinute < 0.2) {
    suggestions.push(createSuggestion(
      'technique',
      'Improve rebounding by working on positioning and boxing out. Practice timing jumps.',
      'medium'
    ));
  } else if (reboundsPerMinute > 0.4) {
    suggestions.push(createSuggestion(
      'technique',
      'Great rebounding! Your presence in the paint is valuable to the team.',
      'low'
    ));
  }
  
  // Playmaking suggestions
  const assistsPerMinute = assists / safeMinutesPlayed;
  if (assistsPerMinute < 0.1 && score < 70) {
    suggestions.push(createSuggestion(
      'technique',
      'Work on court vision and passing skills. Practice different types of passes.',
      'medium'
    ));
  } else if (assistsPerMinute > 0.25) {
    suggestions.push(createSuggestion(
      'technique',
      'Excellent playmaking! Continue developing leadership on the court.',
      'low'
    ));
  }
  
  // Defensive suggestions
  const stealsPerMinute = steals / safeMinutesPlayed;
  if (stealsPerMinute < 0.02 && score < 70) {
    suggestions.push(createSuggestion(
      'technique',
      'Focus on defensive anticipation and active hands. Work on reading passing lanes.',
      'medium'
    ));
  } else if (stealsPerMinute > 0.08) {
    suggestions.push(createSuggestion(
      'technique',
      'Great defensive instincts! Balance aggression with smart positioning.',
      'low'
    ));
  }
  
  return suggestions;
};

/**
 * Analyze performance trend and generate trend-based suggestions
 * @param {Array} recentScores - Array of recent performance scores
 * @param {string} sport - Sport type
 * @returns {Array} Array of trend-based suggestions
 */
export const generateTrendBasedSuggestions = (recentScores, sport) => {
  const suggestions = [];
  
  if (!recentScores || recentScores.length < 2) {
    return suggestions;
  }
  
  // Calculate trend
  const recent = recentScores.slice(-3);
  const older = recentScores.slice(-6, -3);
  
  if (older.length === 0) {
    return suggestions;
  }
  
  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
  const difference = recentAvg - olderAvg;
  
  if (difference > 10) {
    // Significant improvement
    suggestions.push(createSuggestion(
      'general',
      'Excellent improvement trend! Your hard work is paying off. Maintain this momentum.',
      'low'
    ));
  } else if (difference > 5) {
    // Moderate improvement
    suggestions.push(createSuggestion(
      'general',
      'Good improvement trend! Continue your current training approach.',
      'low'
    ));
  } else if (difference < -10) {
    // Significant decline
    suggestions.push(createSuggestion(
      'general',
      'Performance has declined recently. Consider reviewing your training routine and getting adequate rest.',
      'high'
    ));
  } else if (difference < -5) {
    // Moderate decline
    suggestions.push(createSuggestion(
      'general',
      'Slight decline in performance. Focus on fundamentals and ensure proper recovery.',
      'medium'
    ));
  } else {
    // Stable performance
    suggestions.push(createSuggestion(
      'general',
      'Consistent performance! Consider adding new challenges to break through plateaus.',
      'medium'
    ));
  }
  
  return suggestions;
};

/**
 * Generate comprehensive suggestions for a player
 * @param {number} score - Current performance score
 * @param {string} sport - Sport type
 * @param {Object} parameters - Sport-specific parameters
 * @param {Array} recentScores - Array of recent scores for trend analysis
 * @returns {Object} Complete suggestion package
 */
export const generateComprehensiveSuggestions = (score, sport, parameters, recentScores = []) => {
  const restRecommendation = generateRestRecommendation(score, sport);
  const trainingSuggestions = generateTrainingSuggestions(score, sport, parameters);
  const trendSuggestions = generateTrendBasedSuggestions(recentScores, sport);
  
  return {
    restRecommendation,
    suggestions: [...trainingSuggestions, ...trendSuggestions],
    score,
    sport,
    generatedAt: new Date()
  };
};

/**
 * Get motivational message based on performance score
 * @param {number} score - Performance score (0-100)
 * @returns {string} Motivational message
 */
export const getMotivationalMessage = (score) => {
  if (score >= 90) {
    return "Outstanding performance! You're at the top of your game!";
  } else if (score >= 80) {
    return "Great job! You're performing at a high level!";
  } else if (score >= 70) {
    return "Good work! Keep pushing to reach the next level!";
  } else if (score >= 60) {
    return "Solid effort! Focus on improvement areas to boost your performance!";
  } else {
    return "Every champion was once a beginner. Keep working hard!";
  }
};