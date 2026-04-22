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
 * @param {number} params.runsConceded - Runs conceded while bowling
 * @param {number} params.catches - Catches taken by the player
 * @param {number} params.oversBowled - Overs bowled by the player
 * @returns {number} Performance score (0-100)
 */
export const calculateCricketScore = (params) => {
  const { runsScored, ballsFaced, wicketsTaken, runsConceded, catches, oversBowled } = params;

  // Validate inputs
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid cricket parameters provided');
  }

  // Batting score: strike rate normalized to 0-100
  let battingScore = 0;
  if (ballsFaced > 0) {
    const strikeRate = (runsScored / ballsFaced) * 100;
    battingScore = Math.min(100, strikeRate);
  }

  // Bowling score: wicket rate + economy rate combined
  let bowlingScore = 0;
  if (oversBowled > 0) {
    const wicketsPerOver = wicketsTaken / oversBowled;
    const wicketScore = Math.min(100, (wicketsPerOver / 0.5) * 100);

    const economy = runsConceded / oversBowled;
    const economyScore = ((12 - economy) / (12 - 3)) * 100;

    bowlingScore = (0.6 * wicketScore) + (0.4 * economyScore);
  }

  // Fielding score
  const fieldingScore = Math.min(100, catches * 20);

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

  // All stats normalized per 90 minutes
  const goalsScore = (goalsScored / safeMinutesPlayed) * 90 * 20;
  const assistsScore = (assists / safeMinutesPlayed) * 90 * 15;
  const passingScore = Math.min(30, (passesCompleted / safeMinutesPlayed) * 30);
  const tacklesScore = Math.min(20, (tacklesMade / safeMinutesPlayed) * 90 * 0.22);

  const attack = goalsScore;
  const playmaking = assistsScore + passingScore;
  const defense = tacklesScore;

  const totalScore = (0.4 * attack) + (0.3 * playmaking) + (0.3 * defense);

  return Math.round(Math.min(100, Math.max(0, totalScore)));
};

/**
 * Calculate basketball performance score based on points, rebounds, assists, steals, and field goal %
 * @param {Object} params - Basketball parameters
 * @param {number} params.pointsScored - Points scored by the player
 * @param {number} params.rebounds - Rebounds by the player
 * @param {number} params.assists - Assists by the player
 * @param {number} params.steals - Steals by the player
 * @param {number} params.minutesPlayed - Minutes played by the player
 * @param {number} params.fieldGoalPercentage - Field goal percentage (0-1)
 * @returns {number} Performance score (0-100)
 */
export const calculateBasketballScore = (params) => {
  const { pointsScored, rebounds, assists, steals, minutesPlayed, fieldGoalPercentage } = params;

  // Validate inputs
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid basketball parameters provided');
  }

  // Prevent division by zero
  const safeMinutesPlayed = Math.max(minutesPlayed, 1);

  // All stats normalized per 48 minutes
  const pointScore = Math.min(40, (pointsScored / safeMinutesPlayed) * 48 * 1);
  const reboundScore = Math.min(25, (rebounds / safeMinutesPlayed) * 48 * 2.5);
  const assistScore = Math.min(25, (assists / safeMinutesPlayed) * 48 * 3.125);
  const stealScore = Math.min(10, (steals / safeMinutesPlayed) * 48 * 5);

  const efficiencyScore = (fieldGoalPercentage || 0) * 100;

  const totalScore = pointScore + reboundScore + assistScore + stealScore + (0.2 * efficiencyScore);

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
  const change = currentScore - previousScore;
  const percentage = previousScore === 0
    ? 100
    : Math.round((change / previousScore) * 100);

  let trend = 'stable';
  if (percentage > 5) {
    trend = 'improving';
  } else if (percentage < -5) {
    trend = 'declining';
  }

  return { change, percentage, trend };
};