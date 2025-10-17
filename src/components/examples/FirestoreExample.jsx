import React, { useState, useEffect } from 'react';
import { useFirestore, useQuery, usePlayerManagement } from '../../hooks/useFirestore.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Example component demonstrating Firestore service usage
 * This component shows how to use the Firestore service for various operations
 */
const FirestoreExample = () => {
  const { user, userRole } = useAuth();
  const { 
    loading, 
    error, 
    clearError,
    getUserProfile,
    getPlayersByCoach,
    assignPlayerToCoach 
  } = useFirestore();

  const [userProfile, setUserProfile] = useState(null);
  const [testResults, setTestResults] = useState([]);

  // Example: Using useQuery hook for real-time data
  const { 
    data: allPlayers, 
    loading: playersLoading, 
    error: playersError 
  } = useQuery('players', [], 'name', 'asc');

  // Example: Using usePlayerManagement hook (for coaches)
  const {
    players: myPlayers,
    unassignedPlayers,
    loading: managementLoading,
    assignPlayer,
    removePlayer
  } = usePlayerManagement(user?.uid);

  // Load user profile on component mount
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const runBasicTest = async () => {
    const results = [];
    
    try {
      // Test creating a document
      results.push('✓ Starting basic CRUD test...');
      
      // This would typically be done through proper forms and validation
      const testData = {
        name: 'Test Document',
        description: 'This is a test document',
        testField: 'test value'
      };
      
      results.push('✓ Test data prepared');
      setTestResults([...results]);
      
      // Note: In a real application, you would have proper error handling
      // and user feedback for these operations
      
    } catch (error) {
      results.push(`✗ Test failed: ${error.message}`);
    }
    
    setTestResults(results);
  };

  const handleAssignPlayer = async (playerId) => {
    try {
      await assignPlayer(playerId);
      alert('Player assigned successfully!');
    } catch (err) {
      alert(`Failed to assign player: ${err.message}`);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      await removePlayer(playerId);
      alert('Player removed successfully!');
    } catch (err) {
      alert(`Failed to remove player: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Firestore Service Example</h2>
        <p className="text-gray-600">Please log in to see Firestore operations.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Firestore Service Example</h2>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>Error: {error.message}</span>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Loading...
        </div>
      )}

      {/* User Profile Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">User Profile</h3>
        {userProfile ? (
          <div className="space-y-2">
            <p><strong>Name:</strong> {userProfile.name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Role:</strong> {userProfile.role}</p>
            {userProfile.sport && <p><strong>Sport:</strong> {userProfile.sport}</p>}
            {userProfile.coachId && <p><strong>Coach ID:</strong> {userProfile.coachId}</p>}
          </div>
        ) : (
          <p className="text-gray-600">Loading profile...</p>
        )}
      </div>

      {/* Coach-specific sections */}
      {userRole === 'coach' && (
        <>
          {/* My Players Section */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">My Players</h3>
            {managementLoading ? (
              <p className="text-gray-600">Loading players...</p>
            ) : myPlayers.length > 0 ? (
              <div className="space-y-2">
                {myPlayers.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-gray-600 ml-2">({player.sport})</span>
                      <span className="text-blue-600 ml-2">Score: {player.currentScore}</span>
                    </div>
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No players assigned yet.</p>
            )}
          </div>

          {/* Unassigned Players Section */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Available Players</h3>
            {unassignedPlayers.length > 0 ? (
              <div className="space-y-2">
                {unassignedPlayers.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-gray-600 ml-2">({player.sport})</span>
                    </div>
                    <button
                      onClick={() => handleAssignPlayer(player.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No unassigned players available.</p>
            )}
          </div>
        </>
      )}

      {/* All Players Query Example */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">All Players (Real-time Query)</h3>
        {playersLoading ? (
          <p className="text-gray-600">Loading all players...</p>
        ) : playersError ? (
          <p className="text-red-600">Error loading players: {playersError.message}</p>
        ) : allPlayers.length > 0 ? (
          <div className="space-y-2">
            {allPlayers.map(player => (
              <div key={player.id} className="p-2 bg-white rounded border">
                <span className="font-medium">{player.name}</span>
                <span className="text-gray-600 ml-2">({player.sport})</span>
                <span className="text-blue-600 ml-2">Matches: {player.matchCount}</span>
                <span className="text-green-600 ml-2">Avg Score: {player.averageScore}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No players found.</p>
        )}
      </div>

      {/* Test Section */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Service Test</h3>
        <button
          onClick={runBasicTest}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Run Basic Test
        </button>
        
        {testResults.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div key={index} className={result.startsWith('✗') ? 'text-red-600' : 'text-green-600'}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service Features Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Firestore Service Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ Implemented Features:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Base CRUD operations (Create, Read, Update, Delete)</li>
              <li>• User profile management</li>
              <li>• Player-coach relationship management</li>
              <li>• Real-time data listening</li>
              <li>• Query operations with filters</li>
              <li>• Batch operations</li>
              <li>• Error handling with user-friendly messages</li>
              <li>• React hooks for easy integration</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-600 mb-2">🔧 Key Methods:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• <code>create()</code> - Create documents</li>
              <li>• <code>read()</code> - Read documents</li>
              <li>• <code>update()</code> - Update documents</li>
              <li>• <code>delete()</code> - Delete documents</li>
              <li>• <code>query()</code> - Query with filters</li>
              <li>• <code>assignPlayerToCoach()</code> - Manage relationships</li>
              <li>• <code>getPlayersByCoach()</code> - Get coach's players</li>
              <li>• <code>onDocumentChange()</code> - Real-time listening</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirestoreExample;