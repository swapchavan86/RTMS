import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from '../Leaderboard';
import * as api from '../../services/api'; // To mock getLeaderboard

// Mock the api module
jest.mock('../../services/api');

describe('Leaderboard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    api.getLeaderboard.mockResolvedValueOnce({ data: [] }); // Mock an eventual empty response
    render(<Leaderboard />);
    expect(screen.getByText(/Loading Leaderboard.../i)).toBeInTheDocument();
  });

  test('renders leaderboard data successfully after loading', async () => {
    const mockLeaderboardData = [
      { rank: 1, employee_id: 'emp001', name: 'Alice Wonderland', awe_points: 500 },
      { rank: 2, employee_id: 'emp002', name: 'Bob The Builder', awe_points: 450 },
    ];
    api.getLeaderboard.mockResolvedValueOnce({ data: mockLeaderboardData });

    render(<Leaderboard />);

    // Wait for loading to disappear and data to appear
    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/Employee Leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/#1/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice Wonderland/i)).toBeInTheDocument();
    expect(screen.getByText(/500 AwePs/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob The Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/450 AwePs/i)).toBeInTheDocument();
    expect(api.getLeaderboard).toHaveBeenCalledTimes(1);
    expect(api.getLeaderboard).toHaveBeenCalledWith(10); // Default limit
  });

  test('renders error message if API call fails', async () => {
    const errorMessage = 'Failed to fetch leaderboard. Is the backend running?';
    api.getLeaderboard.mockRejectedValueOnce(new Error(errorMessage));

    render(<Leaderboard />);

    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders "No leaderboard data available" if API returns empty array', async () => {
    api.getLeaderboard.mockResolvedValueOnce({ data: [] });

    render(<Leaderboard />);

    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/No leaderboard data available./i)).toBeInTheDocument();
  });
});
```
