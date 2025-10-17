/**
 * Sport-specific parameter definitions and interfaces
 * Requirements: 2.4, 2.5 - Multi-sport parameter management
 */

// Cricket parameter structure
export const cricketParameterSchema = {
  runsScored: { type: 'number', min: 0, max: 500, required: true },
  ballsFaced: { type: 'number', min: 0, max: 600, required: true },
  wicketsTaken: { type: 'number', min: 0, max: 10, required: true },
  catches: { type: 'number', min: 0, max: 20, required: true },
  oversBowled: { type: 'number', min: 0, max: 50, required: true }
};

// Football parameter structure
export const footballParameterSchema = {
  goalsScored: { type: 'number', min: 0, max: 20, required: true },
  assists: { type: 'number', min: 0, max: 20, required: true },
  passesCompleted: { type: 'number', min: 0, max: 1000, required: true },
  tacklesMade: { type: 'number', min: 0, max: 50, required: true },
  minutesPlayed: { type: 'number', min: 0, max: 120, required: true }
};

// Basketball parameter structure
export const basketballParameterSchema = {
  pointsScored: { type: 'number', min: 0, max: 100, required: true },
  rebounds: { type: 'number', min: 0, max: 50, required: true },
  assists: { type: 'number', min: 0, max: 30, required: true },
  steals: { type: 'number', min: 0, max: 20, required: true },
  minutesPlayed: { type: 'number', min: 0, max: 48, required: true }
};

// Sport parameter schemas mapping
export const sportParameterSchemas = {
  cricket: cricketParameterSchema,
  football: footballParameterSchema,
  basketball: basketballParameterSchema
};

// Default parameter values for each sport
export const defaultCricketParameters = {
  runsScored: 0,
  ballsFaced: 0,
  wicketsTaken: 0,
  catches: 0,
  oversBowled: 0
};

export const defaultFootballParameters = {
  goalsScored: 0,
  assists: 0,
  passesCompleted: 0,
  tacklesMade: 0,
  minutesPlayed: 0
};

export const defaultBasketballParameters = {
  pointsScored: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  minutesPlayed: 0
};

export const defaultSportParameters = {
  cricket: defaultCricketParameters,
  football: defaultFootballParameters,
  basketball: defaultBasketballParameters
};

// Parameter field labels for UI display
export const cricketParameterLabels = {
  runsScored: 'Runs Scored',
  ballsFaced: 'Balls Faced',
  wicketsTaken: 'Wickets Taken',
  catches: 'Catches',
  oversBowled: 'Overs Bowled'
};

export const footballParameterLabels = {
  goalsScored: 'Goals Scored',
  assists: 'Assists',
  passesCompleted: 'Passes Completed',
  tacklesMade: 'Tackles Made',
  minutesPlayed: 'Minutes Played'
};

export const basketballParameterLabels = {
  pointsScored: 'Points Scored',
  rebounds: 'Rebounds',
  assists: 'Assists',
  steals: 'Steals',
  minutesPlayed: 'Minutes Played'
};

export const sportParameterLabels = {
  cricket: cricketParameterLabels,
  football: footballParameterLabels,
  basketball: basketballParameterLabels
};