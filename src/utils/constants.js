// Application constants

// User roles
export const USER_ROLES = {
  COACH: 'coach',
  PLAYER: 'player'
};

// Sports
export const SPORTS = {
  CRICKET: 'cricket',
  FOOTBALL: 'football',
  BASKETBALL: 'basketball'
};

// Performance score thresholds
export const PERFORMANCE_THRESHOLDS = {
  LOW: 60,
  MEDIUM: 80,
  HIGH: 100
};

// Rest recommendation hours
export const REST_RECOMMENDATIONS = {
  LOW_PERFORMANCE: { min: 48, max: 72 },
  MEDIUM_PERFORMANCE: { min: 24, max: 48 },
  HIGH_PERFORMANCE: { min: 12, max: 24 }
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COACH_DASHBOARD: '/coach',
  PLAYER_DASHBOARD: '/player'
};