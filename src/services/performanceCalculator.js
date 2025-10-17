/**
 * Performance calculation engine for sport-specific scoring
 * Requirements: 3.1, 3.2, 3.3 - Performance score calculation
 */

/**
 * Calculate cricket performance score based on batting, bowling, and fielding contributions
 * @param {Object} params - Cricket parameters
 * @param {number} params.runsScored - Runs scored by the player
 * @param {number} params.ballsFaced - Balls faced by the player
 * @param {number} params.wicketsTaken - Wickets taken by the player
 * @param {number} params.catches - Catches taken by the player
 * @param {number} params.oversBowled - Overs bowled by the player
 * @returns {number} Performance score (0-100)
 */
export const calculateCricketScore = (params) => {
  const { runsScored, ballsFaced, wicketsTaken, catches, oversBowled } = params;
  
  // Validate inputs
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid cricket parameters provided');
  }
  
  // Batting score calculation (strike rate based)
  let battingScore = 0;
  if (ballsFaced > 0) {
    const strikeRate = (runsScored / ballsFaced) * 100;
    // Normalize strike rate to 0-100 scale (100+ strike rate = full batting points)
    battingScore = Math.min(100, strikeRate);
  } else if (runsScored > 0) {
    // If runs scored but no balls faced recorded, give partial credit
    battingScore = Math.min(100, runsScored * 10);
  }
  
  // Bowling score calculation (wickets per over)
  let bowlingScore = 0;
  if (oversBowled > 0) {
    const wicketsPerOver = wicketsTaken / oversBowled;
    // Good bowling: 1 wicket per 3 overs = 33 points, scale accordingly
    bowlingScore = Math.min(100, wicketsPerOver * 100);
  } else if (wicketsTaken > 0) {
    // If wickets taken but no overs recorded, give partial credit
    bowlingScore = Math.min(100, wicketsTaken * 25);
  }
  
  // Fielding score calculation
  const fieldingScore = Math.min(100, catches * 20); // Each catch worth 20 points
  
  // Weighted combination: Batting 50%, Bowling 30%, Fielding 20%
  const totalScore = (battingScore * 0.5) + (bowlingScore * 0.3) + (fieldingScore * 0.2);
  
  return Math.round(Math.min(100, Math.max(0, totalScore)));
};

/**
 * Calculate football performance score based on goals, assists, passing, and defense
 * @param {Object} params - Football parameters
 * @param {number} params.goalsScored - Goals scored by the player
 * @param {number} params.assists - Assists made by the player
 * @param {number} params.passesCompleted - Passes completed by the player
 * @param {number} params.tacklesMade - Tackles made by the player
 * @param {number} params.minutesPlayed - Minutes played by the player
 * @returns {number} Performance score (0-100)
 */
export const calculateFootballScore = (params) => {
  const { goalsScored, assists, passesCompleted, tacklesMade, minutesPlayed } = params;
  
  // Validate inputs
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid football parameters provided');
  }
  
  // Prevent division by zero
  const safeMinutesPlayed = Math.max(minutesPlayed, 1);
  
  // Goal scoring (20 points per goal, normalized by minutes)
  const goalScore = (goalsScored / safeMinutesPlayed) * 90 * 20; // Per 90 minutes
  
  // Assist scoring (15 points per assist, normalized by minutes)
  const assistScore = (assists / safeMinutesPlayed) * 90 * 15; // Per 90 minutes
  
  // Passing accuracy (based on passes per minute, good player ~1 pass per minute)
  const passAccuracy = Math.min(30, (passesCompleted / safeMinutesPlayed) * 30);
  
  // Defensive contribution (tackles per minute, good defender ~0.5 tackles per minute)
  const defenseScore = Math.min(20, (tacklesMade / safeMinutesPlayed) * 90 * 0.22); // Per 90 minutes
  
  const totalScore = goalScore + assistScore + passAccuracy + defenseScore;
  
  return Math.round(Math.min(100, Math.max(0, totalScore)));
};

/**
 * Calculate basketball performance score based on points, rebounds, assists, and steals
 * @param {Object} params - Basketball parameters
 * @param {number} params.pointsScored - Points scored by the player
 * @param {number} params.rebounds - Rebounds by the player
 * @param {number} params.assists - Assists by the player
 * @param {number} params.steals - Steals by the player
 * @param {number} params.minutesPlayed - Minutes played by the player
 * @returns {number} Performance score (0-100)
 */
export const calculateBasketballScore = (params) => {
  const { pointsScored, rebounds, assists, steals, minutesPlayed } = params;
  
  // Validate inputs
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid basketball parameters provided');
  }
  
  // Prevent division by zero
  const safeMinutesPlayed = Math.max(minutesPlayed, 1);
  
  // Points per minute (normalized to 48 minutes, elite scorer ~1 point per minute)
  const pointsPerMinute = (pointsScored / safeMinutesPlayed) * 48;
  const pointScore = Math.min(40, pointsPerMinute * 0.83); // 40 points max for scoring
  
  // Rebounds (good rebounder gets ~10 per 48 minutes)
  const reboundScore = Math.min(25, (rebounds / safeMinutesPlayed) * 48 * 2.5);
  
  // Assists (good playmaker gets ~8 per 48 minutes)
  const assistScore = Math.min(25, (assists / safeMinutesPlayed) * 48 * 3.125);
  
  // Steals (good defender gets ~2 per 48 minutes)
  const stealScore = Math.min(10, (steals / safeMinutesPlayed) * 48 * 5);
  
  const totalScore = pointScore + reboundScore + assistScore + stealScore;
  
  return Math.round(Math.min(100, Math.max(0, totalScore)));
};

/**
 * Calculate performance score for any sport
 * @param {string} sport - Sport type ('cricket', 'football', 'basketball')
 * @param {Object} parameters - Sport-specific parameters
 * @returns {number} Performance score (0-100)
 */
export const calculatePerformanceScore = (sport, parameters) => {
  if (!sport || !parameters) {
    throw new Error('Sport and parameters are required');
  }
  
  switch (sport.toLowerCase()) {
    case 'cricket':
      return calculateCricketScore(parameters);
    case 'football':
      return calculateFootballScore(parameters);
    case 'basketball':
      return calculateBasketballScore(parameters);
    default:
      throw new Error(`Unsupported sport: ${sport}`);
  }
};

/**
 * Get performance score category based on score value
 * @param {number} score - Performance score (0-100)
 * @returns {Object} Score category information
 */
export const getPerformanceCategory = (score) => {
  if (score >= 90) {
    return { category: 'excellent', description: 'Outstanding performance', color: 'green' };
  } else if (score >= 80) {
    return { category: 'very-good', description: 'Very good performance', color: 'blue' };
  } else if (score >= 70) {
    return { category: 'good', description: 'Good performance', color: 'yellow' };
  } else if (score >= 60) {
    return { category: 'average', description: 'Average performance', color: 'orange' };
  } else {
    return { category: 'below-average', description: 'Below average performance', color: 'red' };
  }
};

/**
 * Calculate performance improvement/decline percentage
 * @param {number} currentScore - Current performance score
 * @param {number} previousScore - Previous performance score
 * @returns {Object} Change information
 */
export const calculatePerformanceChange = (currentScore, previousScore) => {
  if (!previousScore || previousScore === 0) {
    return { change: 0, percentage: 0, trend: 'stable' };
  }
  
  const change = currentScore - previousScore;
  const percentage = Math.round((change / previousScore) * 100);
  
  let trend = 'stable';
  if (change > 2) {
    trend = 'improving';
  } else if (change < -2) {
    trend = 'declining';
  }
  
  return { change, percentage, trend };
};