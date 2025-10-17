/**
 * Match data structure and related models
 * Requirements: 2.4, 2.5, 7.1 - Match data structure and storage
 */

// Match data structure
export const createMatchData = ({
  playerId,
  coachId,
  sport,
  parameters,
  date = new Date(),
  calculatedScore = null,
  suggestions = [],
  restRecommendation = null
}) => {
  return {
    id: null, // Will be set by Firestore
    playerId,
    coachId,
    sport,
    date: date instanceof Date ? date : new Date(date),
    parameters,
    calculatedScore,
    suggestions,
    restRecommendation,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Rest recommendation structure
export const createRestRecommendation = (hours, description) => {
  return {
    hours,
    description,
    createdAt: new Date()
  };
};

// Match summary structure for display
export const createMatchSummary = (matchData) => {
  return {
    id: matchData.id,
    date: matchData.date,
    sport: matchData.sport,
    score: matchData.calculatedScore,
    hasRestRecommendation: !!matchData.restRecommendation,
    suggestionCount: matchData.suggestions?.length || 0
  };
};

// Player performance summary structure
export const createPlayerPerformanceSummary = ({
  playerId,
  playerName,
  sport,
  totalMatches = 0,
  averageScore = 0,
  currentScore = 0,
  lastMatchDate = null,
  trend = 'stable' // 'improving', 'declining', 'stable'
}) => {
  return {
    playerId,
    playerName,
    sport,
    totalMatches,
    averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
    currentScore: Math.round(currentScore * 100) / 100,
    lastMatchDate,
    trend,
    updatedAt: new Date()
  };
};

// Suggestion structure
export const createSuggestion = (type, message, priority = 'medium') => {
  return {
    type, // 'rest', 'training', 'technique', 'general'
    message,
    priority, // 'high', 'medium', 'low'
    createdAt: new Date()
  };
};

// Match validation schema
export const matchDataSchema = {
  playerId: { type: 'string', required: true },
  coachId: { type: 'string', required: true },
  sport: { type: 'string', required: true, enum: ['cricket', 'football', 'basketball'] },
  parameters: { type: 'object', required: true },
  date: { type: 'date', required: true },
  calculatedScore: { type: 'number', min: 0, max: 100, required: false },
  suggestions: { type: 'array', required: false },
  restRecommendation: { type: 'object', required: false }
};

// Performance trend calculation helpers
export const calculatePerformanceTrend = (recentScores) => {
  if (!recentScores || recentScores.length < 2) {
    return 'stable';
  }

  const recent = recentScores.slice(-3); // Last 3 matches
  const older = recentScores.slice(-6, -3); // Previous 3 matches

  if (older.length === 0) {
    return 'stable';
  }

  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (difference > 5) {
    return 'improving';
  } else if (difference < -5) {
    return 'declining';
  } else {
    return 'stable';
  }
};

// Match filtering and sorting utilities
export const sortMatchesByDate = (matches, ascending = false) => {
  return [...matches].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const filterMatchesBySport = (matches, sport) => {
  return matches.filter(match => match.sport === sport);
};

export const filterMatchesByDateRange = (matches, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return matches.filter(match => {
    const matchDate = new Date(match.date);
    return matchDate >= start && matchDate <= end;
  });
};