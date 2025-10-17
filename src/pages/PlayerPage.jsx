import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { usePerformance } from '../hooks/usePerformance.js';
import { 
  PlayerDashboard, 
  PerformanceChart, 
  MatchHistory, 
  SuggestionPanel 
} from '../components/player/index.js';
import { LoadingSpinner, Navigation } from '../components/shared/index.js';

/**
 * PlayerPage - Complete player interface with dashboard, charts, history, and suggestions
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5 - Complete player interface implementation
 */
const PlayerPage = () => {
  const { userData, loading: authLoading } = useAuth();
  const { 
    performanceSummary,
    recentMatches,
    allMatches,
    latestSuggestions,
    performanceTrend,
    loading: performanceLoading,
    error
  } = usePerformance(userData?.uid);

  const [activeTab, setActiveTab] = useState('dashboard');

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userData || userData.role !== 'player') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              This page is only accessible to players. Please contact your coach if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'performance', name: 'Performance', icon: '📈' },
    { id: 'history', name: 'Match History', icon: '📋' },
    { id: 'suggestions', name: 'Suggestions', icon: '💡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      {/* Navigation Tabs */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Tabs */}
          <nav className="hidden sm:flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Tabs */}
          <div className="sm:hidden py-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm font-medium"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-container py-4 sm:py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                <p className="text-red-600 text-sm mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <PlayerDashboard />
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <PerformanceChart 
              matches={recentMatches} 
              title="Performance Trend (Last 10 Matches)" 
            />
            
            {performanceSummary && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Stats */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Score:</span>
                      <span className="font-semibold text-blue-600">
                        {Math.round(performanceSummary.currentScore || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Score:</span>
                      <span className="font-semibold text-green-600">
                        {Math.round(performanceSummary.averageScore || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Matches:</span>
                      <span className="font-semibold text-gray-900">
                        {performanceSummary.matchCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend:</span>
                      <span className={`font-semibold capitalize ${
                        performanceSummary.trend === 'improving' ? 'text-green-600' :
                        performanceSummary.trend === 'declining' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {performanceSummary.trend || 'stable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Performance */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
                  {performanceSummary.performanceHistory && performanceSummary.performanceHistory.length > 0 ? (
                    <div className="space-y-3">
                      {performanceSummary.performanceHistory.map((match, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium capitalize">{match.sport}</div>
                            <div className="text-sm text-gray-500">
                              {match.date ? new Date(match.date.seconds * 1000).toLocaleDateString() : 'Recent'}
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            {Math.round(match.score)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No recent performance data available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <MatchHistory 
            matches={allMatches} 
            loading={performanceLoading} 
          />
        )}

        {activeTab === 'suggestions' && (
          <SuggestionPanel
            suggestions={latestSuggestions.suggestions || []}
            restRecommendation={latestSuggestions.restRecommendation}
            lastMatchDate={latestSuggestions.matchDate}
            loading={performanceLoading}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerPage;