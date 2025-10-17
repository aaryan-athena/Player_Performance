import React, { useState, useMemo } from 'react';
import { LoadingSpinner } from '../shared/index.js';

/**
 * MatchHistory component - Displays match history with filtering capabilities
 * Requirements: 5.2, 5.4 - Build match history display with filtering
 */
const MatchHistory = ({ matches = [], loading = false }) => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get unique sports from matches
  const availableSports = useMemo(() => {
    const sports = [...new Set(matches.map(match => match.sport))].filter(Boolean);
    return sports.sort();
  }, [matches]);

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let filtered = matches;

    // Filter by sport
    if (selectedSport !== 'all') {
      filtered = filtered.filter(match => match.sport === selectedSport);
    }

    // Sort matches
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = a.date ? new Date(a.date.seconds * 1000) : new Date(0);
          bValue = b.date ? new Date(b.date.seconds * 1000) : new Date(0);
          break;
        case 'score':
          aValue = a.calculatedScore || 0;
          bValue = b.calculatedScore || 0;
          break;
        case 'sport':
          aValue = a.sport || '';
          bValue = b.sport || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [matches, selectedSport, sortBy, sortOrder]);

  // Get score color based on performance
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Get sport icon
  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket':
        return '🏏';
      case 'football':
        return '⚽';
      case 'basketball':
        return '🏀';
      default:
        return '🏃';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Match History</h3>
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Match History</h3>
        <div className="text-sm text-gray-500">
          {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Sport Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Sport
          </label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sports</option>
            {availableSports.map(sport => (
              <option key={sport} value={sport} className="capitalize">
                {sport}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Date</option>
            <option value="score">Score</option>
            <option value="sport">Sport</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Match List */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No matches found</h4>
          <p className="text-gray-500">
            {selectedSport === 'all' 
              ? "No match history available yet. Your coach will add match data to get started."
              : `No matches found for ${selectedSport}. Try selecting a different sport.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match, index) => (
            <div
              key={match.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Match Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                      {getSportIcon(match.sport)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {match.sport || 'Match'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.date 
                        ? new Date(match.date.seconds * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Date not available'
                      }
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.calculatedScore || 0)}`}>
                    {Math.round(match.calculatedScore || 0)} points
                  </div>
                </div>
              </div>

              {/* Match Details */}
              {match.parameters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-2">Match Statistics:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(match.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions Preview */}
              {match.suggestions && match.suggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">Coach's Suggestion:</div>
                    <div className="text-gray-600 italic">
                      "{match.suggestions[0]}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredMatches.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredMatches.length}
              </div>
              <div className="text-sm text-gray-500">Total Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  filteredMatches.reduce((sum, match) => sum + (match.calculatedScore || 0), 0) / 
                  filteredMatches.length
                )}
              </div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...filteredMatches.map(match => match.calculatedScore || 0))}
              </div>
              <div className="text-sm text-gray-500">Best Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;