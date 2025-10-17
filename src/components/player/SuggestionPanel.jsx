import React from 'react';

/**
 * SuggestionPanel component - Displays suggestions and rest recommendations
 * Requirements: 5.3, 4.1, 4.2, 4.3 - Create suggestion panel, implement rest recommendation display, add training advice presentation
 */
const SuggestionPanel = ({ suggestions = [], restRecommendation = null, lastMatchDate = null, loading = false }) => {
  
  // Get rest recommendation color and icon based on hours
  const getRestRecommendationStyle = (hours) => {
    if (hours >= 48) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🛑',
        priority: 'High Priority'
      };
    } else if (hours >= 24) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '⚠️',
        priority: 'Moderate Priority'
      };
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '✅',
        priority: 'Light Rest'
      };
    }
  };

  // Get suggestion type icon
  const getSuggestionIcon = (suggestion) => {
    const text = suggestion.toLowerCase();
    if (text.includes('rest') || text.includes('recovery')) return '😴';
    if (text.includes('training') || text.includes('practice')) return '💪';
    if (text.includes('nutrition') || text.includes('diet')) return '🥗';
    if (text.includes('hydration') || text.includes('water')) return '💧';
    if (text.includes('technique') || text.includes('skill')) return '🎯';
    if (text.includes('strength') || text.includes('fitness')) return '🏋️';
    return '💡';
  };

  // Format time since last match
  const getTimeSinceMatch = (matchDate) => {
    if (!matchDate) return null;
    
    const now = new Date();
    const match = new Date(matchDate.seconds * 1000);
    const diffHours = Math.floor((now - match) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Suggestions</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const hasData = suggestions.length > 0 || restRecommendation;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Suggestions</h3>
        {lastMatchDate && (
          <div className="text-sm text-gray-500">
            Last updated: {getTimeSinceMatch(lastMatchDate)}
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🎯</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h4>
          <p className="text-gray-500">
            Suggestions will appear after your coach records match data and performance scores are calculated.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rest Recommendation */}
          {restRecommendation && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <span className="mr-2">🛌</span>
                Rest Recommendation
              </h4>
              
              <div className={`p-4 rounded-lg border ${getRestRecommendationStyle(restRecommendation.hours).bgColor} ${getRestRecommendationStyle(restRecommendation.hours).borderColor}`}>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {getRestRecommendationStyle(restRecommendation.hours).icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${getRestRecommendationStyle(restRecommendation.hours).color} mb-1`}>
                      {getRestRecommendationStyle(restRecommendation.hours).priority}
                    </div>
                    <div className="text-gray-700 mb-2">
                      <strong>Recommended Rest:</strong> {restRecommendation.hours} hours
                    </div>
                    {restRecommendation.description && (
                      <div className="text-gray-600 text-sm">
                        {restRecommendation.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Training Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <span className="mr-2">💡</span>
                Training Advice
              </h4>
              
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="text-xl flex-shrink-0 mt-0.5">
                      {getSuggestionIcon(suggestion)}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 leading-relaxed">
                        {suggestion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📋</span>
              Action Items
            </h5>
            <div className="space-y-2 text-sm">
              {restRecommendation && (
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-700">
                    Take {restRecommendation.hours} hours of rest before next training
                  </span>
                </div>
              )}
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-700">
                    {suggestion.length > 60 ? `${suggestion.substring(0, 60)}...` : suggestion}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center">
              <span className="mr-2">🌟</span>
              Performance Tips
            </h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Follow your rest recommendations to prevent overtraining</p>
              <p>• Stay hydrated and maintain proper nutrition</p>
              <p>• Focus on technique improvements during practice</p>
              <p>• Track your progress and celebrate improvements</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * RestRecommendationCard - Standalone component for displaying rest recommendations
 */
export const RestRecommendationCard = ({ restRecommendation, compact = false }) => {
  if (!restRecommendation) return null;

  const style = (() => {
    const hours = restRecommendation.hours;
    if (hours >= 48) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🛑',
        title: 'Extended Rest Required'
      };
    } else if (hours >= 24) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '⚠️',
        title: 'Moderate Rest Needed'
      };
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '✅',
        title: 'Light Rest Period'
      };
    }
  })();

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${style.bgColor} ${style.borderColor}`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{style.icon}</span>
          <div>
            <div className={`font-medium ${style.color}`}>
              {restRecommendation.hours}h rest
            </div>
            <div className="text-xs text-gray-600">{style.title}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${style.bgColor} ${style.borderColor}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{style.icon}</div>
        <div>
          <div className={`font-semibold ${style.color} mb-1`}>
            {style.title}
          </div>
          <div className="text-gray-700 mb-2">
            <strong>Recommended Rest:</strong> {restRecommendation.hours} hours
          </div>
          {restRecommendation.description && (
            <div className="text-gray-600 text-sm">
              {restRecommendation.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionPanel;