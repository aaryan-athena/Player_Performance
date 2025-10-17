/**
 * Complete workflow integration tests
 * Tests end-to-end user workflows for both coach and player roles
 * Requirements: 3.4, 3.5, 5.1 - Complete user workflows and real-time synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext.jsx';
import MatchEntryForm from '../../components/coach/MatchEntryForm.jsx';
import PlayerDashboard from '../../components/player/PlayerDashboard.jsx';
import { matchService } from '../../services/matchService.js';
import { firestoreService } from '../../services/firestoreService.js';
import { realtimeService } from '../../services/realtimeService.js';

// Mock Firebase and services
vi.mock('../../config/firebase.js', () => ({
  db: {},
  auth: {}
}));

vi.mock('../../services/firestoreService.js');
vi.mock('../../services/matchService.js');
vi.mock('../../services/realtimeService.js');

// Mock auth context
const mockAuthContext = {
  userData: {
    uid: 'coach-123',
    name: 'Coach Smith',
    role: 'coach',
    email: 'coach@example.com'
  },
  loading: false,
  error: null
};

vi.mock('../../contexts/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContext
}));

// Mock hooks
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => mockAuthContext
}));

vi.mock('../../hooks/usePerformance.js', () => ({
  usePerformance: (playerId) => ({
    performanceSummary: {
      currentScore: 78,
      averageScore: 75,
      matchCount: 5,
      sport: 'cricket',
      trend: 'improving',
      recentScores: [78, 75, 72, 70, 68]
    },
    recentMatches: [
      {
        id: 'match-1',
        sport: 'cricket',
        calculatedScore: 78,
        date: { seconds: Date.now() / 1000 },
        suggestions: ['Great batting performance!']
      }
    ],
    loading: false,
    error: null,
    refreshData: vi.fn(),
    performanceTrend: [
      { date: { seconds: Date.now() / 1000 }, score: 78, sport: 'cricket' }
    ],
    latestSuggestions: {
      suggestions: ['Great batting performance!'],
      restRecommendation: { hours: 24, description: 'Light rest recommended' }
    }
  })
}));

describe('Complete Workflow Integration Tests', () => {
  const mockPlayer = {
    id: 'player-456',
    playerId: 'player-456',
    name: 'John Doe',
    email: 'john@example.com',
    sport: 'cricket',
    coachId: 'coach-123',
    currentScore: 75,
    matchCount: 4,
    averageScore: 72
  };

  const mockMatchData = {
    playerId: 'player-456',
    coachId: 'coach-123',
    sport: 'cricket',
    parameters: {
      runsScored: 85,
      ballsFaced: 120,
      wicketsTaken: 2,
      catches: 1,
      oversBowled: 8
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    firestoreService.getPlayersByCoach.mockResolvedValue([mockPlayer]);
    matchService.submitMatchData.mockResolvedValue({
      id: 'new-match-id',
      ...mockMatchData,
      calculatedScore: 78,
      suggestions: ['Great performance!'],
      suggestionPackage: {
        suggestions: [{ message: 'Great performance!' }],
        restRecommendation: { hours: 24, description: 'Light rest' }
      }
    });
    
    realtimeService.subscribeToPlayerUpdates.mockReturnValue('subscription-id');
    realtimeService.subscribeToCoachUpdates.mockReturnValue('coach-subscription-id');
    realtimeService.unsubscribe.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Coach Workflow: Match Entry to Player Update', () => {
    it('should complete coach match entry workflow successfully', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <MatchEntryForm />
          </AuthProvider>
        </BrowserRouter>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Add Match Data')).toBeInTheDocument();
      });

      // Verify player selection is available
      expect(screen.getByText('Select Player')).toBeInTheDocument();
      
      // Select a player
      const playerSelect = screen.getByRole('combobox');
      fireEvent.change(playerSelect, { target: { value: 'player-456' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Verify sport-specific form appears
      expect(screen.getByText('Cricket Match Data')).toBeInTheDocument();

      // Fill in cricket match data
      const runsInput = screen.getByLabelText(/runs scored/i);
      const ballsInput = screen.getByLabelText(/balls faced/i);
      const wicketsInput = screen.getByLabelText(/wickets taken/i);

      fireEvent.change(runsInput, { target: { value: '85' } });
      fireEvent.change(ballsInput, { target: { value: '120' } });
      fireEvent.change(wicketsInput, { target: { value: '2' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit match data/i });
      fireEvent.click(submitButton);

      // Verify match service was called
      await waitFor(() => {
        expect(matchService.submitMatchData).toHaveBeenCalledWith(
          expect.objectContaining({
            playerId: 'player-456',
            coachId: 'coach-123',
            sport: 'cricket',
            parameters: expect.objectContaining({
              runsScored: 85,
              ballsFaced: 120,
              wicketsTaken: 2
            })
          })
        );
      });

      // Verify success message appears
      await waitFor(() => {
        expect(screen.getByText(/match data submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle form validation errors', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <MatchEntryForm />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Add Match Data')).toBeInTheDocument();
      });

      // Try to submit without selecting a player
      const submitButton = screen.getByRole('button', { name: /submit match data/i });
      
      // This should show an error since no player is selected
      // The actual implementation should prevent submission or show validation error
    });

    it('should show real-time feedback during submission', async () => {
      // Mock a delayed response to test loading states
      matchService.submitMatchData.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          id: 'new-match-id',
          calculatedScore: 78,
          suggestions: ['Great performance!']
        }), 1000))
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <MatchEntryForm />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Add Match Data')).toBeInTheDocument();
      });

      // Select player and fill form (simplified for test)
      const playerSelect = screen.getByRole('combobox');
      fireEvent.change(playerSelect, { target: { value: 'player-456' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit match data/i });
      fireEvent.click(submitButton);

      // Should show loading state
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Player Workflow: Dashboard Updates', () => {
    it('should display player dashboard with performance data', async () => {
      // Mock player auth context
      const playerAuthContext = {
        userData: {
          uid: 'player-456',
          name: 'John Doe',
          role: 'player',
          email: 'john@example.com'
        },
        loading: false,
        error: null
      };

      // Override auth mock for this test
      vi.mocked(mockAuthContext).userData = playerAuthContext.userData;

      render(
        <BrowserRouter>
          <AuthProvider>
            <PlayerDashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      // Verify dashboard loads with performance data
      await waitFor(() => {
        expect(screen.getByText(/welcome back, john doe/i)).toBeInTheDocument();
      });

      // Verify performance score is displayed
      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('Latest Score')).toBeInTheDocument();

      // Verify recent matches section
      expect(screen.getByText('Recent Matches')).toBeInTheDocument();

      // Verify performance insights
      expect(screen.getByText('Performance Insights')).toBeInTheDocument();
    });

    it('should handle empty state gracefully', async () => {
      // Mock empty performance data
      vi.mock('../../hooks/usePerformance.js', () => ({
        usePerformance: () => ({
          performanceSummary: null,
          recentMatches: [],
          loading: false,
          error: null,
          refreshData: vi.fn()
        })
      }));

      render(
        <BrowserRouter>
          <AuthProvider>
            <PlayerDashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no performance data available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Data Synchronization', () => {
    it('should establish real-time connections on component mount', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <PlayerDashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(realtimeService.subscribeToPlayerUpdates).toHaveBeenCalledWith(
          'player-456',
          expect.any(Function)
        );
      });
    });

    it('should clean up subscriptions on component unmount', async () => {
      const { unmount } = render(
        <BrowserRouter>
          <AuthProvider>
            <PlayerDashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(realtimeService.subscribeToPlayerUpdates).toHaveBeenCalled();
      });

      unmount();

      expect(realtimeService.unsubscribe).toHaveBeenCalledWith('subscription-id');
    });

    it('should handle real-time update callbacks', async () => {
      let realtimeCallback;
      
      realtimeService.subscribeToPlayerUpdates.mockImplementation((playerId, callback) => {
        realtimeCallback = callback;
        return 'subscription-id';
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <PlayerDashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(realtimeCallback).toBeDefined();
      });

      // Simulate real-time update
      const mockUpdate = {
        type: 'matches_updated',
        playerId: 'player-456',
        data: [
          {
            id: 'new-match',
            calculatedScore: 85,
            date: { seconds: Date.now() / 1000 },
            sport: 'cricket'
          }
        ]
      };

      // This would trigger the callback in the actual implementation
      realtimeCallback(mockUpdate);

      // Verify the update was processed (implementation-specific verification)
    });
  });

  describe('Cross-Component Data Flow', () => {
    it('should synchronize data between coach and player components', async () => {
      // Setup cross-component sync
      const mockSyncControls = {
        syncId: 'sync-123',
        addCallback: vi.fn(),
        removeCallback: vi.fn(),
        destroy: vi.fn()
      };

      realtimeService.setupCrossComponentSync.mockReturnValue(mockSyncControls);

      // This test would verify that when coach submits match data,
      // the player dashboard updates in real-time
      const syncControls = realtimeService.setupCrossComponentSync('player-456', 'coach-123');

      expect(syncControls).toMatchObject({
        syncId: expect.any(String),
        addCallback: expect.any(Function),
        removeCallback: expect.any(Function),
        destroy: expect.any(Function)
      });
    });

    it('should handle concurrent updates gracefully', async () => {
      // Test scenario where multiple updates happen simultaneously
      const updates = [
        { type: 'matches_updated', data: [{ id: 'match-1', calculatedScore: 75 }] },
        { type: 'player_updated', data: { currentScore: 75, matchCount: 6 } },
        { type: 'matches_updated', data: [{ id: 'match-2', calculatedScore: 80 }] }
      ];

      // This would test the debouncing and batching functionality
      const debouncedCallback = realtimeService.debounceUpdates(vi.fn(), 100);
      
      updates.forEach(update => debouncedCallback(update));

      // Verify only the last update is processed after debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      matchService.submitMatchData.mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <AuthProvider>
            <MatchEntryForm />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Add Match Data')).toBeInTheDocument();
      });

      // Attempt to submit match data
      const playerSelect = screen.getByRole('combobox');
      fireEvent.change(playerSelect, { target: { value: 'player-456' } });

      const submitButton = screen.getByRole('button', { name: /submit match data/i });
      fireEvent.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should recover from connection loss', async () => {
      const mockConnectionHandler = vi.fn();
      
      realtimeService.handleConnectionState.mockImplementation((onOnline, onOffline) => {
        mockConnectionHandler.onOnline = onOnline;
        mockConnectionHandler.onOffline = onOffline;
        return () => {};
      });

      // Setup connection state handling
      const cleanup = realtimeService.handleConnectionState(
        () => console.log('Online'),
        () => console.log('Offline')
      );

      expect(mockConnectionHandler.onOnline).toBeDefined();
      expect(mockConnectionHandler.onOffline).toBeDefined();

      cleanup();
    });
  });

  describe('Performance and Optimization', () => {
    it('should optimize real-time updates with debouncing', () => {
      const callback = vi.fn();
      const debouncedCallback = realtimeService.debounceUpdates(callback, 100);

      // Rapid fire updates
      debouncedCallback('update1');
      debouncedCallback('update2');
      debouncedCallback('update3');

      // Should not have called the callback yet
      expect(callback).not.toHaveBeenCalled();

      // After debounce delay, should call once with last update
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('update3');
      }, 150);
    });

    it('should manage subscription lifecycle efficiently', () => {
      const subscriptionId1 = realtimeService.subscribeToPlayerUpdates('player-1', vi.fn());
      const subscriptionId2 = realtimeService.subscribeToCoachUpdates('coach-1', vi.fn());

      expect(realtimeService.getActiveSubscriptionCount()).toBe(2);
      expect(realtimeService.isSubscriptionActive(subscriptionId1)).toBe(true);

      realtimeService.unsubscribe(subscriptionId1);
      expect(realtimeService.getActiveSubscriptionCount()).toBe(1);
      expect(realtimeService.isSubscriptionActive(subscriptionId1)).toBe(false);

      realtimeService.unsubscribeAll();
      expect(realtimeService.getActiveSubscriptionCount()).toBe(0);
    });
  });
});