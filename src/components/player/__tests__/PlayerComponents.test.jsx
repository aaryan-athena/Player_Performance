import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayerDashboard from '../PlayerDashboard.jsx';
import PerformanceChart from '../PerformanceChart.jsx';
import MatchHistory from '../MatchHistory.jsx';
import SuggestionPanel from '../SuggestionPanel.jsx';

// Mock the hooks
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    userData: {
      uid: 'test-player-id',
      name: 'Test Player',
      role: 'player'
    }
  })
}));

vi.mock('../../hooks/usePerformance.js', () => ({
  usePerformance: () => ({
    performanceSummary: {
      currentScore: 85,
      averageScore: 78,
      matchCount: 5,
      trend: 'improving',
      sport: 'cricket'
    },
    recentMatches: [
      {
        id: '1',
        sport: 'cricket',
        calculatedScore: 85,
        date: { seconds: Date.now() / 1000 },
        suggestions: ['Great performance! Keep up the good work.']
      }
    ],
    loading: false,
    error: null
  })
}));

describe('Player Components', () => {
  describe('PlayerDashboard', () => {
    it('renders welcome message and performance score', () => {
      render(<PlayerDashboard />);
      
      expect(screen.getByText(/Welcome back, Test Player/)).toBeInTheDocument();
      expect(screen.getByText('Current Performance Score')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument(); // Current score
    });

    it('displays performance trend', () => {
      render(<PlayerDashboard />);
      
      expect(screen.getByText('Improving')).toBeInTheDocument();
    });
  });

  describe('PerformanceChart', () => {
    const mockMatches = [
      {
        id: '1',
        calculatedScore: 75,
        date: { seconds: Date.now() / 1000 },
        sport: 'cricket'
      },
      {
        id: '2',
        calculatedScore: 85,
        date: { seconds: (Date.now() / 1000) + 86400 },
        sport: 'cricket'
      }
    ];

    it('renders chart with performance data', () => {
      render(<PerformanceChart matches={mockMatches} />);
      
      expect(screen.getByText('Performance Trend')).toBeInTheDocument();
    });

    it('shows empty state when no matches', () => {
      render(<PerformanceChart matches={[]} />);
      
      expect(screen.getByText('No performance data to display')).toBeInTheDocument();
    });
  });

  describe('MatchHistory', () => {
    const mockMatches = [
      {
        id: '1',
        sport: 'cricket',
        calculatedScore: 85,
        date: { seconds: Date.now() / 1000 },
        parameters: { runsScored: 50, ballsFaced: 30 }
      }
    ];

    it('renders match history with filters', () => {
      render(<MatchHistory matches={mockMatches} />);
      
      expect(screen.getByText('Match History')).toBeInTheDocument();
      expect(screen.getByText('Filter by Sport')).toBeInTheDocument();
      expect(screen.getByText('Cricket')).toBeInTheDocument();
    });

    it('shows empty state when no matches', () => {
      render(<MatchHistory matches={[]} />);
      
      expect(screen.getByText('No matches found')).toBeInTheDocument();
    });
  });

  describe('SuggestionPanel', () => {
    const mockSuggestions = ['Focus on improving batting technique'];
    const mockRestRecommendation = {
      hours: 24,
      description: 'Take moderate rest to recover'
    };

    it('renders suggestions and rest recommendations', () => {
      render(
        <SuggestionPanel 
          suggestions={mockSuggestions}
          restRecommendation={mockRestRecommendation}
        />
      );
      
      expect(screen.getByText('Performance Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Rest Recommendation')).toBeInTheDocument();
      expect(screen.getByText('Training Advice')).toBeInTheDocument();
    });

    it('shows empty state when no suggestions', () => {
      render(<SuggestionPanel suggestions={[]} />);
      
      expect(screen.getByText('No suggestions available')).toBeInTheDocument();
    });
  });
});