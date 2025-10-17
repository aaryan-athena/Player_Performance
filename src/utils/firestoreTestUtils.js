import { firestoreService } from '../services/firestoreService.js';

/**
 * Test utilities for Firestore service
 * These functions help verify that the Firestore service is working correctly
 */

/**
 * Test basic CRUD operations
 * @returns {Promise<boolean>} True if all tests pass
 */
export async function testBasicCRUD() {
  try {
    console.log('Testing basic CRUD operations...');
    
    // Test Create
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'player',
      sport: 'cricket'
    };
    
    const docId = await firestoreService.create('test_users', testData);
    console.log('✓ Create operation successful, ID:', docId);
    
    // Test Read
    const readData = await firestoreService.read('test_users', docId);
    console.log('✓ Read operation successful:', readData);
    
    // Test Update
    const updateData = { name: 'Updated Test User' };
    await firestoreService.update('test_users', docId, updateData);
    console.log('✓ Update operation successful');
    
    // Verify update
    const updatedData = await firestoreService.read('test_users', docId);
    console.log('✓ Update verification successful:', updatedData.name);
    
    // Test Query
    const queryResults = await firestoreService.query('test_users', [
      { field: 'role', operator: '==', value: 'player' }
    ]);
    console.log('✓ Query operation successful, found:', queryResults.length, 'documents');
    
    // Test Delete
    await firestoreService.delete('test_users', docId);
    console.log('✓ Delete operation successful');
    
    // Verify delete
    const deletedData = await firestoreService.read('test_users', docId);
    if (deletedData === null) {
      console.log('✓ Delete verification successful');
    }
    
    return true;
  } catch (error) {
    console.error('✗ CRUD test failed:', error);
    return false;
  }
}

/**
 * Test user profile management
 * @returns {Promise<boolean>} True if all tests pass
 */
export async function testUserProfileManagement() {
  try {
    console.log('Testing user profile management...');
    
    const userId = 'test_user_123';
    const userData = {
      name: 'Test Player',
      email: 'player@example.com',
      role: 'player',
      sport: 'football'
    };
    
    // Test create user profile
    await firestoreService.createUserProfile(userId, userData);
    console.log('✓ User profile creation successful');
    
    // Test get user profile
    const profile = await firestoreService.getUserProfile(userId);
    console.log('✓ User profile retrieval successful:', profile.name);
    
    // Test update user profile
    await firestoreService.updateUserProfile(userId, { sport: 'basketball' });
    console.log('✓ User profile update successful');
    
    // Test get users by role
    const players = await firestoreService.getUsersByRole('player');
    console.log('✓ Get users by role successful, found:', players.length, 'players');
    
    // Cleanup
    await firestoreService.delete('users', userId);
    console.log('✓ User profile cleanup successful');
    
    return true;
  } catch (error) {
    console.error('✗ User profile test failed:', error);
    return false;
  }
}

/**
 * Test player-coach relationship management
 * @returns {Promise<boolean>} True if all tests pass
 */
export async function testPlayerCoachRelationships() {
  try {
    console.log('Testing player-coach relationships...');
    
    const coachId = 'test_coach_123';
    const playerId = 'test_player_456';
    
    // Create test coach
    const coachData = {
      name: 'Test Coach',
      email: 'coach@example.com',
      role: 'coach'
    };
    await firestoreService.createUserProfile(coachId, coachData);
    
    // Create test player
    const playerData = {
      name: 'Test Player',
      email: 'player@example.com',
      role: 'player',
      sport: 'cricket'
    };
    await firestoreService.createUserProfile(playerId, playerData);
    console.log('✓ Test users created');
    
    // Test assign player to coach
    await firestoreService.assignPlayerToCoach(playerId, coachId);
    console.log('✓ Player assignment successful');
    
    // Test get players by coach
    const coachPlayers = await firestoreService.getPlayersByCoach(coachId);
    console.log('✓ Get players by coach successful, found:', coachPlayers.length, 'players');
    
    // Test get player details
    const playerDetails = await firestoreService.getPlayerDetails(playerId);
    console.log('✓ Get player details successful:', playerDetails.name);
    
    // Test update player stats
    const stats = {
      currentScore: 85,
      matchCount: 5,
      averageScore: 78,
      totalScore: 390
    };
    await firestoreService.updatePlayerStats(playerId, stats);
    console.log('✓ Player stats update successful');
    
    // Test get unassigned players (should be empty now)
    const unassigned = await firestoreService.getUnassignedPlayers();
    console.log('✓ Get unassigned players successful, found:', unassigned.length, 'unassigned');
    
    // Test remove player from coach
    await firestoreService.removePlayerFromCoach(playerId);
    console.log('✓ Player removal successful');
    
    // Cleanup
    await firestoreService.delete('users', coachId);
    await firestoreService.delete('users', playerId);
    console.log('✓ Relationship test cleanup successful');
    
    return true;
  } catch (error) {
    console.error('✗ Player-coach relationship test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 * @returns {Promise<boolean>} True if all tests pass
 */
export async function runAllTests() {
  console.log('🧪 Starting Firestore service tests...\n');
  
  const results = await Promise.all([
    testBasicCRUD(),
    testUserProfileManagement(),
    testPlayerCoachRelationships()
  ]);
  
  const allPassed = results.every(result => result === true);
  
  console.log('\n📊 Test Results:');
  console.log('Basic CRUD:', results[0] ? '✅ PASS' : '❌ FAIL');
  console.log('User Profile Management:', results[1] ? '✅ PASS' : '❌ FAIL');
  console.log('Player-Coach Relationships:', results[2] ? '✅ PASS' : '❌ FAIL');
  console.log('\nOverall:', allPassed ? '🎉 ALL TESTS PASSED' : '💥 SOME TESTS FAILED');
  
  return allPassed;
}

export default {
  testBasicCRUD,
  testUserProfileManagement,
  testPlayerCoachRelationships,
  runAllTests
};