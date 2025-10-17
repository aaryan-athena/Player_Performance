import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { firestoreService } from '../../services/firestoreService.js';
import { Card, Button, Badge, LoadingSpinner, Alert } from '../ui/index.js';

/**
 * Main coach dashboard component
 * Displays player list, team performance overview, and navigation options
 */
function CoachDashboard({ onNavigateToTab }) {
  const { userData } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamStats, setTeamStats] = useState({
    totalPlayers: 0,
    averageScore: 0,
    totalMatches: 0,
    topPerformer: null
  });

  // Load players and team statistics
  useEffect(() => {
    if (userData?.uid) {
      loadDashboardData();
    }
  }, [userData]);

  /**
   * Load all dashboard data including players and team statistics
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get players assigned to this coach
      const playersData = await firestoreService.getPlayersByCoach(userData.uid);
      setPlayers(playersData);

      // Calculate team statistics
      calculateTeamStats(playersData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate team performance statistics
   * @param {Array} playersData - Array of player data
   */
  const calculateTeamStats = (playersData) => {
    if (playersData.length === 0) {
      setTeamStats({
        totalPlayers: 0,
        averageScore: 0,
        totalMatches: 0,
        topPerformer: null
      });
      return;
    }

    const totalPlayers = playersData.length;
    const totalMatches = playersData.reduce((sum, player) => sum + (player.matchCount || 0), 0);
    const totalScore = playersData.reduce((sum, player) => sum + (player.totalScore || 0), 0);
    const averageScore = totalMatches > 0 ? (totalScore / totalMatches) : 0;

    // Find top performer (highest average score with at least 1 match)
    const topPerformer = playersData
      .filter(player => (player.matchCount || 0) > 0)
      .reduce((top, player) => {
        const playerAvg = player.averageScore || 0;
        return (!top || playerAvg > (top.averageScore || 0)) ? player : top;
      }, null);

    setTeamStats({
      totalPlayers,
      averageScore: Math.round(averageScore * 100) / 100,
      totalMatches,
      topPerformer
    });
  };

  /**
   * Get performance status color based on score
   * @param {number} score - Performance score
   * @returns {string} CSS color class
   */
  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get performance status text based on score
   * @param {number} score - Performance score
   * @returns {string} Status text
   */
  const getPerformanceStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="error" title="Error Loading Dashboard">
            {error}
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                Try Again
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Coach Dashboard
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  Welcome back, <span className="font-semibold">{userData?.name}</span>. Manage your players and track team performance.
                </p>
              </div>
              <div className="hidden md:flex space-x-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Report
                </button>
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Match Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Performance Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Players */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Players</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{teamStats.totalPlayers}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Team Average</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{teamStats.averageScore}%</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Matches */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Matches</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{teamStats.totalMatches}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Top Performer */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Top Performer</p>
                  <p className="text-xl font-bold text-gray-900 mt-2 truncate">
                    {teamStats.topPerformer ? teamStats.topPerformer.name : 'N/A'}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Players</h2>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('players')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Player
            </button>
          </div>

          {players.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 text-center py-16 px-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No players assigned</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by adding your first player to begin tracking performance and managing your team.</p>
              <button
                onClick={() => onNavigateToTab && onNavigateToTab('players')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Player
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              {players.map((player) => (
                <div key={player.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-white">
                            {player.name?.charAt(0)?.toUpperCase() || 'P'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 capitalize">
                            {player.sport}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{player.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Current Score</p>
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-3 h-3 rounded-full shadow-md ${(player.currentScore || 0) >= 80 ? 'bg-green-500' :
                            (player.currentScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                          <span className={`text-2xl font-bold ${getPerformanceColor(player.currentScore || 0)}`}>
                            {player.currentScore || 0}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          {getPerformanceStatus(player.currentScore || 0)}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Matches</p>
                        <p className="text-2xl font-bold text-gray-900">{player.matchCount || 0}</p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => onNavigateToTab && onNavigateToTab('match-entry')}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          Add Match
                        </button>
                        <button
                          onClick={() => onNavigateToTab && onNavigateToTab('players')}
                          className="px-5 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-semibold transition-all duration-200"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('match-entry')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer group p-6 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-500 group-hover:to-blue-600 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg">
                    <svg className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-1">
                    Add Match Data
                  </h3>
                  <p className="text-sm text-gray-600">Record new match performance</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('players')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer group p-6 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 group-hover:from-green-500 group-hover:to-emerald-600 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg">
                    <svg className="h-8 w-8 text-green-600 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200 mb-1">
                    Manage Players
                  </h3>
                  <p className="text-sm text-gray-600">Add or edit player information</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('dashboard')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer group p-6 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-500 group-hover:to-purple-600 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg">
                    <svg className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 mb-1">
                    View Dashboard
                  </h3>
                  <p className="text-sm text-gray-600">See team performance overview</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoachDashboard;