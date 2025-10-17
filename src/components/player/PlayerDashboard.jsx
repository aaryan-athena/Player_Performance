import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { usePerformance } from '../../hooks/usePerformance.js';
import { Card, Badge, LoadingSpinner, Alert } from '../ui/index.js';

/**
 * PlayerDashboard component - Main dashboard for players
 * Requirements: 5.1, 5.5 - Display current performance score prominently and show recent match summary
 */
const PlayerDashboard = () => {
  const { userData } = useAuth();
  const { 
    performanceSummary, 
    recentMatches, 
    loading, 
    error 
  } = usePerformance(userData?.uid);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="xl" text="Loading your performance data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error Loading Dashboard">
        {error.message}
      </Alert>
    );
  }

  if (!performanceSummary) {
    return (
      <Alert variant="info" title="Welcome to Your Dashboard">
        No performance data available yet. Your coach will add match data to get started.
      </Alert>
    );
  }

  const currentScore = performanceSummary.currentScore || 0;
  const averageScore = performanceSummary.averageScore || 0;
  const matchCount = performanceSummary.matchCount || 0;
  const trend = performanceSummary.trend || 'stable';

  // Get score color based on performance
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get trend indicator
  const getTrendIndicator = (trend) => {
    switch (trend) {
      case 'improving':
        return { icon: '↗️', color: 'text-green-600', text: 'Improving' };
      case 'declining':
        return { icon: '↘️', color: 'text-red-600', text: 'Declining' };
      default:
        return { icon: '➡️', color: 'text-gray-600', text: 'Stable' };
    }
  };

  const trendInfo = getTrendIndicator(trend);

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card variant="gradient" className="text-center bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-600">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {userData?.name || 'Player'}!
        </h1>
        <p className="text-white/80 text-lg">
          Here's your performance overview for {performanceSummary.sport || 'your sport'}.
        </p>
        <div className="mt-4">
          <Badge variant="primary" size="lg" className="bg-white/20 text-white border-white/30">
            {performanceSummary.sport || 'Athlete'}
          </Badge>
        </div>
      </Card>

      {/* Performance Score Card */}
      <Card variant="elevated" className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title className="text-xl">Performance Overview</Card.Title>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 ${trendInfo.color}`}>
              <span className="text-lg">{trendInfo.icon}</span>
              <span className="text-sm font-medium">{trendInfo.text}</span>
            </div>
          </div>
        </Card.Header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          {/* Current Score */}
          <div className="text-center">
            <div className="relative">
              <div className={`text-5xl font-bold ${getScoreColor(currentScore)} mb-3`}>
                {Math.round(currentScore)}
                <span className="text-2xl">%</span>
              </div>
              <div className={`w-full h-2 rounded-full bg-gray-200 mb-2`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    currentScore >= 80 ? 'bg-green-500' :
                    currentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(currentScore, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Latest Score</div>
          </div>
          
          {/* Average Score */}
          <div className="text-center">
            <div className="relative">
              <div className={`text-5xl font-bold ${getScoreColor(averageScore)} mb-3`}>
                {Math.round(averageScore)}
                <span className="text-2xl">%</span>
              </div>
              <div className={`w-full h-2 rounded-full bg-gray-200 mb-2`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    averageScore >= 80 ? 'bg-green-500' :
                    averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(averageScore, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Average Score</div>
          </div>
          
          {/* Total Matches */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-3">
              {matchCount}
            </div>
            <div className="w-full h-2 rounded-full bg-blue-200 mb-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min((matchCount / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Matches</div>
          </div>
        </div>
      </Card>

      {/* Recent Matches Summary */}
      <Card variant="elevated">
        <Card.Header>
          <Card.Title>Recent Matches</Card.Title>
        </Card.Header>
        
        {recentMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent matches</h3>
            <p className="text-gray-500">Your match history will appear here once your coach adds data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMatches.slice(0, 5).map((match, index) => (
              <div 
                key={match.id || index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      match.sport === 'cricket' ? 'bg-green-100' :
                      match.sport === 'football' ? 'bg-red-100' :
                      match.sport === 'basketball' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <span className={`font-bold text-sm ${
                        match.sport === 'cricket' ? 'text-green-600' :
                        match.sport === 'football' ? 'text-red-600' :
                        match.sport === 'basketball' ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {match.sport?.charAt(0).toUpperCase() || 'M'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {match.sport || 'Match'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.date ? new Date(match.date.seconds * 1000).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(match.calculatedScore || 0)}`}>
                    {Math.round(match.calculatedScore || 0)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Insights */}
        <Card variant="elevated">
          <Card.Header>
            <Card.Title className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Performance Insights
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {performanceSummary.recentScores && performanceSummary.recentScores.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Highest Recent Score</span>
                  <Badge variant="success" size="lg">
                    {Math.max(...performanceSummary.recentScores)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Lowest Recent Score</span>
                  <Badge variant="danger" size="lg">
                    {Math.min(...performanceSummary.recentScores)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Score Consistency</span>
                  <Badge variant="info" size="lg">
                    ±{Math.max(...performanceSummary.recentScores) - Math.min(...performanceSummary.recentScores)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500">More data needed for insights</p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Last Match Details */}
        <Card variant="elevated">
          <Card.Header>
            <Card.Title className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Last Match Details
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Sport</span>
                  <Badge variant="primary" className="capitalize">
                    {recentMatches[0].sport}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Date</span>
                  <span className="font-semibold text-gray-900">
                    {recentMatches[0].date 
                      ? new Date(recentMatches[0].date.seconds * 1000).toLocaleDateString()
                      : 'Recent'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Performance Score</span>
                  <Badge 
                    variant={
                      (recentMatches[0].calculatedScore || 0) >= 80 ? 'success' :
                      (recentMatches[0].calculatedScore || 0) >= 60 ? 'warning' : 'danger'
                    }
                    size="lg"
                  >
                    {Math.round(recentMatches[0].calculatedScore || 0)}%
                  </Badge>
                </div>
                {recentMatches[0].suggestions && recentMatches[0].suggestions.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-800">Latest Suggestion</span>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {recentMatches[0].suggestions[0]}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-500">No match data available</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default PlayerDashboard;