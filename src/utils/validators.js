// Validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateNumeric = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Sport-specific parameter validation
export const validateCricketParams = (params) => {
  const errors = {};
  
  if (!validateNumeric(params.runsScored, 0, 500)) {
    errors.runsScored = 'Runs scored must be between 0 and 500';
  }
  
  if (!validateNumeric(params.ballsFaced, 0, 600)) {
    errors.ballsFaced = 'Balls faced must be between 0 and 600';
  }
  
  if (!validateNumeric(params.wicketsTaken, 0, 10)) {
    errors.wicketsTaken = 'Wickets taken must be between 0 and 10';
  }
  
  if (!validateNumeric(params.catches, 0, 20)) {
    errors.catches = 'Catches must be between 0 and 20';
  }
  
  if (!validateNumeric(params.oversBowled, 0, 50)) {
    errors.oversBowled = 'Overs bowled must be between 0 and 50';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFootballParams = (params) => {
  const errors = {};
  
  if (!validateNumeric(params.goalsScored, 0, 20)) {
    errors.goalsScored = 'Goals scored must be between 0 and 20';
  }
  
  if (!validateNumeric(params.assists, 0, 20)) {
    errors.assists = 'Assists must be between 0 and 20';
  }
  
  if (!validateNumeric(params.passesCompleted, 0, 200)) {
    errors.passesCompleted = 'Passes completed must be between 0 and 200';
  }
  
  if (!validateNumeric(params.tacklesMade, 0, 50)) {
    errors.tacklesMade = 'Tackles made must be between 0 and 50';
  }
  
  if (!validateNumeric(params.minutesPlayed, 0, 120)) {
    errors.minutesPlayed = 'Minutes played must be between 0 and 120';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateBasketballParams = (params) => {
  const errors = {};
  
  if (!validateNumeric(params.pointsScored, 0, 100)) {
    errors.pointsScored = 'Points scored must be between 0 and 100';
  }
  
  if (!validateNumeric(params.rebounds, 0, 50)) {
    errors.rebounds = 'Rebounds must be between 0 and 50';
  }
  
  if (!validateNumeric(params.assists, 0, 30)) {
    errors.assists = 'Assists must be between 0 and 30';
  }
  
  if (!validateNumeric(params.steals, 0, 20)) {
    errors.steals = 'Steals must be between 0 and 20';
  }
  
  if (!validateNumeric(params.minutesPlayed, 0, 48)) {
    errors.minutesPlayed = 'Minutes played must be between 0 and 48';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Generic sport parameter validation using schema
export const validateSportParameters = (sport, parameters) => {
  const validators = {
    cricket: validateCricketParams,
    football: validateFootballParams,
    basketball: validateBasketballParams
  };

  const validator = validators[sport];
  if (!validator) {
    return {
      isValid: false,
      errors: { sport: 'Invalid sport type' }
    };
  }

  return validator(parameters);
};

// Match data validation
export const validateMatchData = (matchData) => {
  const errors = {};

  // Validate required fields
  if (!validateRequired(matchData.playerId)) {
    errors.playerId = 'Player ID is required';
  }

  if (!validateRequired(matchData.coachId)) {
    errors.coachId = 'Coach ID is required';
  }

  if (!validateRequired(matchData.sport)) {
    errors.sport = 'Sport is required';
  } else if (!['cricket', 'football', 'basketball'].includes(matchData.sport)) {
    errors.sport = 'Invalid sport type';
  }

  if (!matchData.parameters || typeof matchData.parameters !== 'object') {
    errors.parameters = 'Parameters are required';
  } else {
    // Validate sport-specific parameters
    const paramValidation = validateSportParameters(matchData.sport, matchData.parameters);
    if (!paramValidation.isValid) {
      errors.parameters = paramValidation.errors;
    }
  }

  // Validate date
  if (!matchData.date) {
    errors.date = 'Match date is required';
  } else {
    const matchDate = new Date(matchData.date);
    const now = new Date();
    if (isNaN(matchDate.getTime())) {
      errors.date = 'Invalid date format';
    } else if (matchDate > now) {
      errors.date = 'Match date cannot be in the future';
    }
  }

  // Validate calculated score if provided
  if (matchData.calculatedScore !== null && matchData.calculatedScore !== undefined) {
    if (!validateNumeric(matchData.calculatedScore, 0, 100)) {
      errors.calculatedScore = 'Calculated score must be between 0 and 100';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Player data validation
export const validatePlayerData = (playerData) => {
  const errors = {};

  if (!validateRequired(playerData.name)) {
    errors.name = 'Player name is required';
  }

  if (!validateEmail(playerData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!validateRequired(playerData.sport)) {
    errors.sport = 'Sport is required';
  } else if (!['cricket', 'football', 'basketball'].includes(playerData.sport)) {
    errors.sport = 'Invalid sport type';
  }

  if (!validateRequired(playerData.coachId)) {
    errors.coachId = 'Coach ID is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Rest recommendation validation
export const validateRestRecommendation = (restRecommendation) => {
  const errors = {};

  if (!validateNumeric(restRecommendation.hours, 0, 168)) { // Max 1 week
    errors.hours = 'Rest hours must be between 0 and 168';
  }

  if (!validateRequired(restRecommendation.description)) {
    errors.description = 'Rest description is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Suggestion validation
export const validateSuggestion = (suggestion) => {
  const errors = {};

  if (!validateRequired(suggestion.type)) {
    errors.type = 'Suggestion type is required';
  } else if (!['rest', 'training', 'technique', 'general'].includes(suggestion.type)) {
    errors.type = 'Invalid suggestion type';
  }

  if (!validateRequired(suggestion.message)) {
    errors.message = 'Suggestion message is required';
  }

  if (!validateRequired(suggestion.priority)) {
    errors.priority = 'Suggestion priority is required';
  } else if (!['high', 'medium', 'low'].includes(suggestion.priority)) {
    errors.priority = 'Invalid priority level';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Batch validation for multiple items
export const validateMatchDataBatch = (matchDataArray) => {
  const results = [];
  let hasErrors = false;

  matchDataArray.forEach((matchData, index) => {
    const validation = validateMatchData(matchData);
    results.push({
      index,
      ...validation
    });
    if (!validation.isValid) {
      hasErrors = true;
    }
  });

  return {
    isValid: !hasErrors,
    results
  };
};