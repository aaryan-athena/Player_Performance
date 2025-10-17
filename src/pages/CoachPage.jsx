import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import {
  CoachDashboard,
  PlayerManagement,
  MatchEntryForm
} from '../components/coach/index.js';
import { LoadingSpinner, Navigation } from '../components/shared/index.js';

/**
 * CoachPage - Complete coach interface with dashboard, player management, and match entry
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6 - Complete coach interface implementation
 */
const CoachPage = () => {
  const { userData, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userData || userData.role !== 'coach') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              This page is only accessible to coaches. Please contact an administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'players', name: 'Players', icon: '👥' },
    { id: 'match-entry', name: 'Match Entry', icon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      {/* Navigation Tabs */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Tabs */}
          <nav className="hidden sm:flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'match-entry') {
                    setSelectedPlayer(null);
                  }
                }}
                className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 ${activeTab === tab.id
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
              onChange={(e) => {
                setActiveTab(e.target.value);
                if (e.target.value !== 'match-entry') {
                  setSelectedPlayer(null);
                }
              }}
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
        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <CoachDashboard onNavigateToTab={setActiveTab} />
        )}

        {activeTab === 'players' && (
          <PlayerManagement
            onSelectPlayer={(player) => {
              setSelectedPlayer(player);
              setActiveTab('match-entry');
            }}
          />
        )}

        {activeTab === 'match-entry' && (
          <div className="space-y-6">
            {selectedPlayer ? (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Adding match data for: {selectedPlayer.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      Sport: {selectedPlayer.sport}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Clear selection</span>
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-blue-400 mr-3">ℹ️</div>
                  <div>
                    <h3 className="text-blue-800 font-medium">Select a Player</h3>
                    <p className="text-blue-600 text-sm mt-1">
                      Go to the Players tab to select a player for match data entry.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <MatchEntryForm
              selectedPlayer={selectedPlayer}
              onPlayerSelect={setSelectedPlayer}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachPage;