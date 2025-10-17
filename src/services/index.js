/**
 * Services index file - exports all service modules
 * Requirements: Service layer organization and exports
 */

// Authentication service
export { authService } from './authService.js';

// Firestore database service
export { firestoreService } from './firestoreService.js';

// Performance calculation service
export {
  calculateCricketScore,
  calculateFootballScore,
  calculateBasketballScore,
  calculatePerformanceScore,
  getPerformanceCategory,
  calculatePerformanceChange
} from './performanceCalculator.js';

// Suggestion engine service
export {
  generateRestRecommendation,
  generateTrainingSuggestions,
  generateTrendBasedSuggestions,
  generateComprehensiveSuggestions,
  getMotivationalMessage
} from './suggestionEngine.js';

// Integrated match service
export { matchService } from './matchService.js';