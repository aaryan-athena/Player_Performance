import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { firestoreService } from '../../services/firestoreService.js';
import { matchService } from '../../services/matchService.js';
import CricketForm from '../forms/CricketForm.jsx';
import FootballForm from '../forms/FootballForm.jsx';
import BasketballForm from '../forms/BasketballForm.jsx';

/**
 * Main match entry form component for coaches
 * Handles player selection and sport-specific form rendering
 */
function MatchEntryForm() {
  const { userData } = useAuth();
  const { showSuccess, showError } = useToast();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load players on component mount
  useEffect(() => {
    if (userData?.uid) {
      loadPlayers();
    }
  }, [userData]);

  /**
   * Load players assigned to this coach
   */
  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const playersData = await firestoreService.getPlayersByCoach(userData.uid);
      setPlayers(playersData);
    } catch (err) {
      console.error('Error loading players:', err);
      setError(err.message || 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle player selection
   * @param {Event} e - Select change event
   */
  const handlePlayerSelect = (e) => {
    const playerId = e.target.value;
    const player = players.find(p => p.id === playerId);
    setSelectedPlayer(player);
    setError(null);
    setSuccess(null);
  };

  /**
   * Handle match data submission
   * @param {Object} matchParameters - Sport-specific match parameters
   */
  const handleMatchSubmit = async (matchParameters) => {
    if (!selectedPlayer) {
      setError('Please select a player first');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare match data
      // Use email as the primary identifier for reliable mapping
      const matchData = {
        playerId: selectedPlayer.playerId || selectedPlayer.id,
        playerEmail: selectedPlayer.email, // Add email for reliable mapping
        coachId: userData.uid,
        sport: selectedPlayer.sport,
        parameters: matchParameters,
        date: new Date()
      };

      console.log('Submitting match for player:', {
        playerName: selectedPlayer.name,
        playerEmail: selectedPlayer.email,
        playerId: matchData.playerId,
        sport: matchData.sport
      });

      // Submit match data with automatic calculation
      const result = await matchService.submitMatchData(matchData);

      setSuccess({
        message: `Match data submitted successfully! Performance score: ${result.calculatedScore}%`,
        score: result.calculatedScore,
        suggestions: result.suggestionPackage?.suggestions || []
      });

      showSuccess(`Match data submitted! Performance score: ${result.calculatedScore}%`);

      // Show suggestions if available
      if (result.suggestionPackage?.suggestions?.length > 0) {
        const topSuggestion = result.suggestionPackage.suggestions[0];
        setTimeout(() => {
          showSuccess(`Tip for ${selectedPlayer.name}: ${topSuggestion.message}`, { duration: 8000 });
        }, 1000);
      }

      // Reset form after successful submission
      setTimeout(() => {
        setSuccess(null);
      }, 10000); // Clear success message after 10 seconds

    } catch (err) {
      console.error('Error submitting match data:', err);
      setError(err.message || 'Failed to submit match data');
      showError(err.message || 'Failed to submit match data');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Get performance color based on score
   * @param {number} score - Performance score
   * @returns {string} CSS color class
   */
  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Render sport-specific form based on selected player's sport
   */
  const renderSportForm = () => {
    if (!selectedPlayer) return null;

    const commonProps = {
      onSubmit: handleMatchSubmit,
      loading: submitting,
      disabled: submitting
    };

    switch (selectedPlayer.sport) {
      case 'cricket':
        return <CricketForm {...commonProps} />;
      case 'football':
        return <FootballForm {...commonProps} />;
      case 'basketball':
        return <BasketballForm {...commonProps} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Unsupported sport: {selectedPlayer.sport}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Add Match Data
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Record match performance data for your players and track their progress.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <p className="mt-1 text-sm text-green-700">{success.message}</p>
                {success.suggestions && success.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-800">Suggestions for {selectedPlayer?.name}:</p>
                    <ul className="mt-1 text-sm text-green-700 list-disc list-inside">
                      {success.suggestions.slice(0, 3).map((suggestion, index) => (
                        <li key={index}>{suggestion.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Player Selection */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Player</h2>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No players available</h3>
              <p className="text-gray-600 mb-8">
                You need to add players before you can record match data.
              </p>
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Players
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="player-select" className="block text-sm font-semibold text-gray-700 mb-3">
                Choose a player to record match data for:
              </label>
              <select
                id="player-select"
                value={selectedPlayer?.id || ''}
                onChange={handlePlayerSelect}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              >
                <option value="">Select a player...</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} - {player.sport} (Current Score: {player.currentScore || 0}%)
                  </option>
                ))}
              </select>

              {selectedPlayer && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">
                          {selectedPlayer.name?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedPlayer.name}</h3>
                        <p className="text-sm text-gray-600">{selectedPlayer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 capitalize mb-2">
                        {selectedPlayer.sport}
                      </span>
                      <p className={`text-lg font-bold ${getPerformanceColor(selectedPlayer.currentScore || 0)}`}>
                        Current Score: {selectedPlayer.currentScore || 0}%
                      </p>
                      <p className="text-xs text-gray-600 font-medium mt-1">
                        {selectedPlayer.matchCount || 0} matches played
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sport-Specific Form */}
        {selectedPlayer && (
          <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              {selectedPlayer.sport.charAt(0).toUpperCase() + selectedPlayer.sport.slice(1)} Match Data
            </h2>
            {renderSportForm()}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchEntryForm;