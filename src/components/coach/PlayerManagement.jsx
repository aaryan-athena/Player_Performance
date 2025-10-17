import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { firestoreService } from '../../services/firestoreService.js';

/**
 * Player management component for coaches
 * Handles adding, editing, and assigning players to coaches
 */
function PlayerManagement() {
  const { userData } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [players, setPlayers] = useState([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  // Form state for adding/editing players
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sport: 'cricket'
  });

  // Load data on component mount
  useEffect(() => {
    if (userData?.uid) {
      loadPlayerData();
    }
  }, [userData]);

  /**
   * Load all player-related data
   */
  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assigned players and unassigned players in parallel
      const [assignedPlayers, unassigned] = await Promise.all([
        firestoreService.getPlayersByCoach(userData.uid),
        firestoreService.getUnassignedPlayers()
      ]);

      setPlayers(assignedPlayers);
      setUnassignedPlayers(unassigned);
    } catch (err) {
      console.error('Error loading player data:', err);
      setError(err.message || 'Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle adding a new player
   * @param {Event} e - Form submit event
   */
  const handleAddPlayer = async (e) => {
    e.preventDefault();

    try {
      setError(null);

      // Register the new player placeholder
      const playerData = {
        email: formData.email,
        name: formData.name,
        role: 'player',
        sport: formData.sport,
        coachId: userData.uid
      };

      // Create player profile (not a user account yet)
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await firestoreService.createUserProfile(playerId, playerData);

      // Assign player to coach
      await firestoreService.assignPlayerToCoach(playerId, userData.uid);

      // Reset form and reload data
      setFormData({ name: '', email: '', sport: 'cricket' });
      setShowAddForm(false);
      await loadPlayerData();

      showSuccess(`Player ${formData.name} added successfully!`);
      showInfo(`The player can now sign up using ${formData.email} and will be automatically linked to your team.`, { duration: 10000 });
    } catch (err) {
      console.error('Error adding player:', err);
      setError(err.message || 'Failed to add player');
      showError(err.message || 'Failed to add player');
    }
  };

  /**
   * Handle editing an existing player
   * @param {Event} e - Form submit event
   */
  const handleEditPlayer = async (e) => {
    e.preventDefault();

    try {
      setError(null);

      // Update player information
      await firestoreService.updatePlayerStats(editingPlayer.id, {
        name: formData.name,
        email: formData.email,
        sport: formData.sport
      });

      // Also update the user profile
      await firestoreService.updateUserProfile(editingPlayer.playerId || editingPlayer.id, {
        name: formData.name,
        email: formData.email,
        sport: formData.sport
      });

      // Reset form and reload data
      setFormData({ name: '', email: '', sport: 'cricket' });
      setEditingPlayer(null);
      await loadPlayerData();

      showSuccess('Player updated successfully!');
    } catch (err) {
      console.error('Error updating player:', err);
      setError(err.message || 'Failed to update player');
    }
  };

  /**
   * Handle assigning an unassigned player to this coach
   * @param {string} playerId - ID of the player to assign
   */
  const handleAssignPlayer = async (playerId) => {
    try {
      setError(null);

      await firestoreService.assignPlayerToCoach(playerId, userData.uid);
      await loadPlayerData();

      showSuccess('Player assigned successfully!');
    } catch (err) {
      console.error('Error assigning player:', err);
      setError(err.message || 'Failed to assign player');
    }
  };

  /**
   * Handle removing a player from this coach
   * @param {string} playerId - ID of the player to remove
   */
  const handleRemovePlayer = async (playerId) => {
    if (!confirm('Are you sure you want to remove this player from your team?')) {
      return;
    }

    try {
      setError(null);

      await firestoreService.removePlayerFromCoach(playerId);
      await loadPlayerData();

      showSuccess('Player removed from your team.');
    } catch (err) {
      console.error('Error removing player:', err);
      setError(err.message || 'Failed to remove player');
    }
  };

  /**
   * Start editing a player
   * @param {Object} player - Player object to edit
   */
  const startEditPlayer = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name || '',
      email: player.email || '',
      sport: player.sport || 'cricket'
    });
  };

  /**
   * Cancel editing/adding
   */
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingPlayer(null);
    setFormData({ name: '', email: '', sport: 'cricket' });
    setError(null);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Player Management
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  Manage your team players, add new members, and assign existing players.
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-xs opacity-90">Total Players</p>
                  <p className="text-2xl font-bold">{players.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Player
          </button>
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Assign Existing Player
          </button>
        </div>

        {/* Add/Edit Player Form */}
        {(showAddForm || editingPlayer) && (
          <div className="mb-8 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h3>
              <button
                onClick={cancelForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!editingPlayer && (
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    The player will need to sign up using this email address to access their account and be linked to your team.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={editingPlayer ? handleEditPlayer : handleAddPlayer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter player's full name"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="player@example.com"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="sport" className="block text-sm font-semibold text-gray-700 mb-2">
                    Sport
                  </label>
                  <select
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="cricket">🏏 Cricket</option>
                    <option value="football">⚽ Football</option>
                    <option value="basketball">🏀 Basketball</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {editingPlayer ? 'Update Player' : 'Add Player'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assign Existing Player Section */}
        {showAssignForm && (
          <div className="mb-8 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-gray-200 animate-fade-in">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              Assign Existing Player
            </h3>
            {unassignedPlayers.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No unassigned players available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unassignedPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {player.name?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{player.name}</p>
                        <p className="text-sm text-gray-500">{player.email} • <span className="capitalize">{player.sport}</span></p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignPlayer(player.id)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Assign to Team
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Players List */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Your Players ({players.length})</h3>
            <p className="text-sm text-gray-600 mt-1">Manage and track your team members</p>
          </div>
          {players.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No players assigned</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first player to begin tracking performance.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Player
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {players.map((player) => (
                <div key={player.id} className="px-8 py-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className="flex-shrink-0">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-white">
                            {player.name?.charAt(0)?.toUpperCase() || 'P'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="text-lg font-semibold text-gray-900">{player.name}</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                            {player.sport}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{player.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Performance</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${(player.currentScore || 0) >= 80 ? 'bg-green-500' :
                            (player.currentScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            } shadow-md`}></div>
                          <p className="text-lg font-bold text-gray-900">
                            {player.currentScore || 0}%
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {player.matchCount || 0} matches
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => startEditPlayer(player)}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerManagement;